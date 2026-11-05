import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import * as Blockly from 'blockly/core'
import { theme } from '../blocks/common'
import { defineAllBlocks, type Level } from '../levels'
import type { Lang } from '../i18n'
import type { HintTarget } from '../hints'

export interface BlockEditorHandle {
  /** The current level's program, read as data. Null when there's no start block. */
  program: () => unknown | null
  /**
   * Where a hint target is on screen, or null if it isn't showing. With
   * `reveal`, switches the panel to "All" first so palette blocks are visible.
   */
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

function loadSaved(level: Level): object {
  try {
    const raw = localStorage.getItem(level.storageKey)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore broken or blocked storage */
  }
  return level.starter
}

interface Props {
  lang: Lang
  level: Level
  ref: Ref<BlockEditorHandle>
  /** Called when the player changes their blocks. */
  onEdit?: () => void
}

function locateIn(workspace: Blockly.WorkspaceSvg, target: HintTarget, reveal: boolean): DOMRect | null {
  if (target.where === 'block') return workspace.getBlockById(target.blockId)?.getSvgRoot().getBoundingClientRect() ?? null
  if (target.where === 'palette') {
    const box = workspace.getToolbox()
    // The block may be filtered out of view; "All" always shows it.
    if (reveal && box && box.getSelectedItem() !== box.getToolboxItems()[0]) box.selectItemByPosition(0)
    const blocks = box?.getFlyout()?.getWorkspace().getTopBlocks(false) ?? []
    const block = blocks.find(
      (b) => b.type === target.type && Object.entries(target.fields ?? {}).every(([name, value]) => b.getFieldValue(name) === value),
    )
    return block?.getSvgRoot().getBoundingClientRect() ?? null
  }
  const block = target.blockId
    ? workspace.getBlockById(target.blockId)
    : workspace.getAllBlocks(false).find((b) => b.type === target.type && b.isEnabled())
  const field = block?.getField(target.field)
  return field?.getSvgRoot()?.getBoundingClientRect() ?? null
}

export default function BlockEditor({ lang, level, ref, onEdit }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const ws = useRef<Blockly.WorkspaceSvg | null>(null)
  const onEditRef = useRef(onEdit)
  onEditRef.current = onEdit
  const levelRef = useRef(level)
  levelRef.current = level
  // Which level the workspace currently holds, so a level switch loads fresh blocks.
  const shownLevel = useRef<string | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      program: () => (ws.current ? levelRef.current.read(ws.current) : null),
      locate: (target, reveal = false) => (ws.current ? locateIn(ws.current, target, reveal) : null),
      resetToStarter: () => {
        const workspace = ws.current
        if (!workspace) return
        workspace.clear()
        Blockly.serialization.workspaces.load(levelRef.current.starter, workspace)
        workspace.getToolbox()?.selectItemByPosition(0)
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
    const state = ws.current && sameLevel ? Blockly.serialization.workspaces.save(ws.current) : loadSaved(level)
    ws.current?.dispose()
    defineAllBlocks(lang)
    shownLevel.current = level.id

    const workspace = Blockly.inject(host.current, {
      toolbox: level.toolbox(lang),
      theme,
      renderer: 'zelos',
      sounds: false,
      // Self-hosted, so the CSP doesn't need to allow static.blockly.com.
      media: `${import.meta.env.BASE_URL}blockly-media/`,
      trashcan: true,
      grid: { spacing: 24, length: 2, colour: 'rgba(15,23,42,0.08)', snap: true },
      zoom: { controls: true, wheel: true, startScale: blockScale(), maxScale: 1.6, minScale: 0.5 },
      move: { scrollbars: true, drag: true, wheel: false },
      plugins: { flyoutsVerticalToolbox: 'kkCompactFlyout' },
    })
    try {
      Blockly.serialization.workspaces.load(state, workspace)
    } catch {
      Blockly.serialization.workspaces.load(level.starter, workspace)
    }
    ws.current = workspace

    // Keep the block panel open, starting on "All". Clicking the selected
    // category again goes back to "All" instead of closing the panel.
    const box = workspace.getToolbox()
    const flyout = box?.getFlyout()
    if (flyout instanceof Blockly.Flyout) flyout.setAutoClose(false)
    box?.selectItemByPosition(0)
    const keepOpen = (e: Blockly.Events.Abstract) => {
      if (e.type === Blockly.Events.TOOLBOX_ITEM_SELECT && !(e as Blockly.Events.ToolboxItemSelect).newItem) {
        box?.selectItemByPosition(0)
      }
    }
    workspace.addChangeListener(keepOpen)
    schedulePlace(workspace)

    const save = (e: Blockly.Events.Abstract) => {
      if (e.isUiEvent) return
      if (EDIT_EVENTS.has(e.type)) onEditRef.current?.()
      try {
        localStorage.setItem(level.storageKey, JSON.stringify(Blockly.serialization.workspaces.save(workspace)))
      } catch {
        /* not critical */
      }
    }
    workspace.addChangeListener(save)
    const resize = new ResizeObserver(() => Blockly.svgResize(workspace))
    resize.observe(host.current)

    return () => {
      resize.disconnect()
      workspace.removeChangeListener(save)
      workspace.removeChangeListener(keepOpen)
    }
  }, [lang, level])

  useEffect(
    () => () => {
      ws.current?.dispose()
      ws.current = null
    },
    [],
  )

  return <div ref={host} className="h-full w-full" />
}
