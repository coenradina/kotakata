import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import { store } from '../store'
import * as Blockly from 'blockly/core'
import { theme } from '../blocks/common'
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

  useImperativeHandle(
    ref,
    () => ({
      program: () => (ws.current ? levelRef.current.read(ws.current) : null),
      locate: (target) => (ws.current ? locateIn(ws.current, target) : null),
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
    shownLevel.current = level.id

    const workspace = Blockly.inject(host.current, {
      toolbox: level.toolbox(lang, puzzleRef.current),
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

    // The block list stays open; it has no categories to switch between.
    const flyout = workspace.getFlyout()
    if (flyout instanceof Blockly.Flyout) flyout.setAutoClose(false)
    schedulePlace(workspace)

    const save = (e: Blockly.Events.Abstract) => {
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
    workspace.updateToolbox(level.toolbox(lang, puzzleId))
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
