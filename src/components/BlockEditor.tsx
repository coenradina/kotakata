import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import { store } from '../store'
import * as Blockly from 'blockly/core'
import { theme } from '../blocks/common'
import { PANEL_TOGGLE, SECTION_PREFIX, freshSections, panelContents, sectionOf, type GroupedToolbox, type PanelState, type ToolboxGroup } from '../blocks/toolbox'
import { defineAllBlocks, type Session } from '../levels'
import type { Lang } from '../i18n'
import type { HintTarget } from '../hints'
import { alpha } from '../theme'

export interface BlockEditorHandle {
  /** The current level's program, read as data. Null when there's no start block. */
  program: () => unknown | null
  /** Where a hint target is on screen, or null if it isn't showing. The block list always shows every block. */
  locate: (target: HintTarget, reveal?: boolean) => DOMRect | null
  /** Replaces the player's blocks with the starter program. */
  resetToStarter: () => void
  /** Replaces the player's blocks with these (used for stage demos). */
  loadBlocks: (state: object) => void
  /** Ids of blocks lying loose in the workspace, not attached to the program. */
  looseBlocks: () => string[]
}

/** One block size everywhere: a bit smaller on narrow screens. */
const blockScale = () => (window.innerWidth < 1200 ? 0.6 : 0.74)

/**
 * The block panel draws its blocks smaller than the workspace does, so it
 * stays narrow and leaves room for the player's program.
 */
class CompactFlyout extends Blockly.VerticalFlyout {
  override getFlyoutScale() {
    return window.innerWidth < 1200 ? 0.5 : 0.62
  }
}
Blockly.registry.register(Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX, 'kkCompactFlyout', CompactFlyout, true)

/**
 * Puts the program at the top left of the visible area, to the right of the
 * block panel (which floats over the workspace and would otherwise hide it).
 */
/** Places the program now, and again once the block panel has finished laying out. */
function schedulePlace(workspace: Blockly.WorkspaceSvg) {
  requestAnimationFrame(() => placeProgram(workspace))
  window.setTimeout(() => placeProgram(workspace), 250)
}

function placeProgram(workspace: Blockly.WorkspaceSvg) {
  Blockly.svgResize(workspace)
  workspace.setScale(blockScale())
  const tops = workspace.getTopBlocks(false)
  if (!tops.length) return
  // Measure what's actually on screen: the panel's right edge and the program's top-left.
  const root = workspace.getParentSvg()
  const flyout = root.parentElement?.querySelector('.blocklyFlyout')?.getBoundingClientRect()
  const area = root.getBoundingClientRect()
  const rects = tops.map((b) => b.getSvgRoot().getBoundingClientRect())
  const left = Math.min(...rects.map((r) => r.left))
  const top = Math.min(...rects.map((r) => r.top))
  const margin = 18
  const targetLeft = (flyout && flyout.width > 0 ? flyout.right : area.left) + margin
  const dx = (targetLeft - left) / workspace.scale
  const dy = (area.top + margin - top) / workspace.scale
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return
  Blockly.Events.disable()
  try {
    for (const b of tops) b.moveBy(dx, dy)
  } finally {
    Blockly.Events.enable()
  }
}

// Events that mean the player changed their program.
const EDIT_EVENTS = new Set<string>([
  Blockly.Events.BLOCK_CREATE,
  Blockly.Events.BLOCK_DELETE,
  Blockly.Events.BLOCK_CHANGE,
  Blockly.Events.BLOCK_MOVE,
])

const starterOf = (level: Session, lang: Lang) => (typeof level.starter === 'function' ? level.starter(lang) : level.starter)

function loadSaved(level: Session, lang: Lang): object {
  return store.loadBlocks(level.id) ?? starterOf(level, lang)
}

interface Props {
  lang: Lang
  level: Session
  ref: Ref<BlockEditorHandle>
  /** The puzzle being played, for sessions whose palette grows puzzle by puzzle. */
  puzzleId?: string
  /** Called when the player changes their blocks. */
  onEdit?: () => void
}

/** Which sections were closed in each session, for the rest of the visit. */
const closedBySession = new Map<string, Set<string>>()

const groupsOf = (def: Blockly.utils.toolbox.ToolboxDefinition): ToolboxGroup[] | null => (def as GroupedToolbox).groups ?? null

function locateIn(workspace: Blockly.WorkspaceSvg, target: HintTarget): DOMRect | null {
  if (target.where === 'block') return workspace.getBlockById(target.blockId)?.getSvgRoot().getBoundingClientRect() ?? null
  if (target.where === 'palette') {
    const blocks = workspace.getFlyout()?.getWorkspace().getTopBlocks(false) ?? []
    const block = blocks.find(
      (b) => b.type === target.type && Object.entries(target.fields ?? {}).every(([name, value]) => b.getFieldValue(name) === value),
    )
    return block?.getSvgRoot().getBoundingClientRect() ?? null
  }
  // Page elements aren't in the workspace; the page locates those itself.
  if (target.where === 'element') return null
  const block = target.blockId
    ? workspace.getBlockById(target.blockId)
    : workspace.getAllBlocks(false).find((b) => b.type === target.type && b.isEnabled())
  const field = block?.getField(target.field)
  return field?.getSvgRoot()?.getBoundingClientRect() ?? null
}

export default function BlockEditor({ lang, level, ref, onEdit, puzzleId }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const ws = useRef<Blockly.WorkspaceSvg | null>(null)
  const onEditRef = useRef(onEdit)
  onEditRef.current = onEdit
  const levelRef = useRef(level)
  levelRef.current = level
  const langRef = useRef(lang)
  langRef.current = lang
  const puzzleRef = useRef(puzzleId)
  puzzleRef.current = puzzleId
  // Which level the workspace currently holds, so a level switch loads fresh blocks.
  const shownLevel = useRef<string | null>(null)
  // The panel's sections, and which are open (docs/plan/05-mobile-play.md, part A).
  const groups = useRef<ToolboxGroup[] | null>(null)
  const rawToolbox = useRef<Blockly.utils.toolbox.ToolboxDefinition | null>(null)
  const panel = useRef<PanelState>({ open: store.load().paletteOpen, closed: new Set(), peek: null, fresh: new Set() })

  /** The flyout for the current panel state. Toolboxes without groups show as they are. */
  const toolboxDef = (): Blockly.utils.toolbox.ToolboxDefinition =>
    groups.current ? ({ kind: 'flyoutToolbox', contents: panelContents(langRef.current, groups.current, panel.current) } as Blockly.utils.toolbox.ToolboxDefinition) : rawToolbox.current!

  const renderPanel = () => {
    const workspace = ws.current
    if (!workspace) return
    workspace.updateToolbox(toolboxDef())
    registerCallbacks(workspace)
  }

  const setPanel = (patch: Partial<PanelState>) => {
    panel.current = { ...panel.current, ...patch }
    closedBySession.set(levelRef.current.id, new Set(panel.current.closed))
    renderPanel()
  }

  const registerCallbacks = (workspace: Blockly.WorkspaceSvg) => {
    workspace.registerButtonCallback(PANEL_TOGGLE, () => {
      const open = !panel.current.open
      store.save({ paletteOpen: open })
      setPanel({ open, peek: null })
      schedulePlace(workspace)
    })
    for (const g of groups.current ?? []) {
      workspace.registerButtonCallback(`${SECTION_PREFIX}${g.label}`, () => {
        const p = panel.current
        if (p.open) {
          const closed = new Set(p.closed)
          if (closed.has(g.label)) closed.delete(g.label)
          else closed.add(g.label)
          setPanel({ closed })
        } else setPanel({ peek: p.peek === g.label ? null : g.label })
      })
    }
  }

  /** Opens the section holding a palette block, so a hint can point at it. */
  const reveal = (target: HintTarget) => {
    if (target.where !== 'palette' || !groups.current) return false
    const section = sectionOf(groups.current, target.type)
    if (!section) return false
    const p = panel.current
    if (p.open && p.closed.has(section)) {
      const closed = new Set(p.closed)
      closed.delete(section)
      setPanel({ closed })
      return true
    }
    if (!p.open && p.peek !== section) {
      setPanel({ peek: section })
      return true
    }
    return false
  }

  useImperativeHandle(
    ref,
    () => ({
      program: () => (ws.current ? levelRef.current.read(ws.current) : null),
      locate: (target, show) => {
        if (!ws.current) return null
        const found = locateIn(ws.current, target)
        if (found || !show || !reveal(target)) return found
        return locateIn(ws.current, target)
      },
      resetToStarter: () => {
        const workspace = ws.current
        if (!workspace) return
        workspace.clear()
        Blockly.serialization.workspaces.load(starterOf(levelRef.current, langRef.current), workspace)
        schedulePlace(workspace)
      },
      loadBlocks: (state) => {
        const workspace = ws.current
        if (!workspace) return
        workspace.clear()
        Blockly.serialization.workspaces.load(state, workspace)
        schedulePlace(workspace)
      },
      looseBlocks: () => {
        const workspace = ws.current
        if (!workspace) return []
        // Any enabled top-level block other than the start block is loose
        return workspace
          .getTopBlocks(false)
          .filter((b) => b.type !== 'kk_when_run' && b.isEnabled() && !b.isInFlyout)
          .map((b) => b.id)
      },
    }),
    [],
  )

  useEffect(() => {
    if (!host.current) return
    // Changing language redefines the blocks, so rebuild the workspace and
    // carry the player's blocks across. Changing level loads that level's blocks.
    const sameLevel = shownLevel.current === level.id
    const state = ws.current && sameLevel ? Blockly.serialization.workspaces.save(ws.current) : loadSaved(level, lang)
    ws.current?.dispose()
    defineAllBlocks(lang)
    const newLevel = shownLevel.current !== level.id
    shownLevel.current = level.id
    rawToolbox.current = level.toolbox(lang, puzzleRef.current)
    groups.current = groupsOf(rawToolbox.current)
    if (newLevel) {
      // The start block's section folds away once the program has one.
      const hasHat = JSON.stringify(state).includes('"kk_when_run"')
      const closed = closedBySession.get(level.id) ?? new Set(hasHat ? ['catEvents'] : [])
      panel.current = { ...panel.current, closed, peek: null, fresh: new Set() }
    }

    const workspace = Blockly.inject(host.current, {
      toolbox: toolboxDef(),
      theme,
      renderer: 'zelos',
      sounds: false,
      // Self-hosted, so the CSP doesn't need to allow static.blockly.com.
      media: `${import.meta.env.BASE_URL}blockly-media/`,
      trashcan: true,
      grid: { spacing: 24, length: 2, colour: alpha('ink', 0.08), snap: true },
      zoom: { controls: true, wheel: true, startScale: blockScale(), maxScale: 1.6, minScale: 0.5 },
      move: { scrollbars: true, drag: true, wheel: false },
      plugins: { flyoutsVerticalToolbox: 'kkCompactFlyout' },
    })
    try {
      Blockly.serialization.workspaces.load(state, workspace)
    } catch {
      Blockly.serialization.workspaces.load(starterOf(level, lang), workspace)
    }
    ws.current = workspace
    registerCallbacks(workspace)

    // The block list stays open; it has no categories to switch between.
    const flyout = workspace.getFlyout()
    if (flyout instanceof Blockly.Flyout) flyout.setAutoClose(false)
    schedulePlace(workspace)

    const save = (e: Blockly.Events.Abstract) => {
      // A block dragged out of a folded panel's section folds it away again.
      if (e.type === Blockly.Events.BLOCK_DRAG && !(e as Blockly.Events.BlockDrag).isStart && panel.current.peek && !panel.current.open) {
        setPanel({ peek: null })
      }
      if (e.isUiEvent) return
      if (EDIT_EVENTS.has(e.type)) onEditRef.current?.()
      store.saveBlocks(level.id, Blockly.serialization.workspaces.save(workspace))
    }
    workspace.addChangeListener(save)
    const resize = new ResizeObserver(() => Blockly.svgResize(workspace))
    resize.observe(host.current)

    return () => {
      resize.disconnect()
      workspace.removeChangeListener(save)
    }
  }, [lang, level])

  // A new puzzle can bring new blocks into the palette, without rebuilding the workspace.
  useEffect(() => {
    const workspace = ws.current
    if (!workspace) return
    const before = groups.current
    rawToolbox.current = level.toolbox(lang, puzzleId)
    groups.current = groupsOf(rawToolbox.current)
    // Sections with a block new in this stage open, and say so.
    const fresh = groups.current ? freshSections(before, groups.current) : new Set<string>()
    const closed = new Set([...panel.current.closed].filter((c) => !fresh.has(c)))
    panel.current = { ...panel.current, closed, fresh, peek: null }
    renderPanel()
    // Only the puzzle matters here; language and level changes rebuild everything above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleId])

  useEffect(
    () => () => {
      ws.current?.dispose()
      ws.current = null
    },
    [],
  )

  return <div ref={host} className="h-full w-full" />
}
