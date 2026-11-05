import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import * as Blockly from 'blockly/core'
import { STARTER, defineBlocks, readProgram, theme, toolbox } from '../blocks/blockly'
import type { Lang } from '../i18n'
import type { HintTarget } from '../hints'
import type { Step } from '../levels/train/model'

export interface BlockEditorHandle {
  program: () => Step[] | null
  /**
   * Where a hint target is on screen, or null if it isn't showing. With
   * `reveal`, switches the panel to "All" first so palette blocks are visible.
   */
  locate: (target: HintTarget, reveal?: boolean) => DOMRect | null
  /** Replaces the player's blocks with the starter program. */
  resetToStarter: () => void
}

/** Shows every block: zooms out if the editor is narrow, never past normal size. */
function fitToView(workspace: Blockly.WorkspaceSvg) {
  Blockly.svgResize(workspace)
  workspace.zoomToFit()
  if (workspace.scale > 0.9) {
    workspace.setScale(0.9)
    workspace.scrollCenter()
  }
}

const STORAGE_KEY = 'kotakata.level1.blocks'
// Events that mean the player changed their program.
const EDIT_EVENTS = new Set<string>([
  Blockly.Events.BLOCK_CREATE,
  Blockly.Events.BLOCK_DELETE,
  Blockly.Events.BLOCK_CHANGE,
  Blockly.Events.BLOCK_MOVE,
])

function loadSaved(): object {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore broken or blocked storage */
  }
  return STARTER
}

interface Props {
  lang: Lang
  ref: Ref<BlockEditorHandle>
  /** Called when the player changes their blocks. */
  onEdit?: () => void
}

function locateIn(workspace: Blockly.WorkspaceSvg, target: HintTarget, reveal: boolean): DOMRect | null {
  if (target.where === 'palette') {
    const box = workspace.getToolbox()
    // The block may be filtered out of view; "All" always shows it.
    if (reveal && box && box.getSelectedItem() !== box.getToolboxItems()[0]) box.selectItemByPosition(0)
    const blocks = box?.getFlyout()?.getWorkspace().getTopBlocks(false) ?? []
    const block = blocks.find((b) => b.type === target.type && (!target.label || b.getFieldValue('LABEL') === target.label))
    return block?.getSvgRoot().getBoundingClientRect() ?? null
  }
  const block = workspace.getAllBlocks(false).find((b) => b.type === target.type && b.isEnabled())
  const field = block?.getField(target.field)
  return field?.getSvgRoot()?.getBoundingClientRect() ?? null
}

export default function BlockEditor({ lang, ref, onEdit }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const ws = useRef<Blockly.WorkspaceSvg | null>(null)
  const onEditRef = useRef(onEdit)
  onEditRef.current = onEdit

  useImperativeHandle(
    ref,
    () => ({
      program: () => (ws.current ? readProgram(ws.current) : null),
      locate: (target, reveal = false) => (ws.current ? locateIn(ws.current, target, reveal) : null),
      resetToStarter: () => {
        const workspace = ws.current
        if (!workspace) return
        workspace.clear()
        Blockly.serialization.workspaces.load(STARTER, workspace)
        workspace.getToolbox()?.selectItemByPosition(0)
        requestAnimationFrame(() => fitToView(workspace))
      },
    }),
    [],
  )

  useEffect(() => {
    if (!host.current) return
    // Changing language redefines the blocks, so rebuild the workspace and
    // carry the player's blocks across.
    const state = ws.current ? Blockly.serialization.workspaces.save(ws.current) : loadSaved()
    ws.current?.dispose()
    defineBlocks(lang)

    const workspace = Blockly.inject(host.current, {
      toolbox: toolbox(lang),
      theme,
      renderer: 'zelos',
      sounds: false,
      // Self-hosted, so the CSP doesn't need to allow static.blockly.com.
      media: `${import.meta.env.BASE_URL}blockly-media/`,
      trashcan: true,
      grid: { spacing: 24, length: 2, colour: 'rgba(15,23,42,0.08)', snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 1.6, minScale: 0.5 },
      move: { scrollbars: true, drag: true, wheel: false },
    })
    try {
      Blockly.serialization.workspaces.load(state, workspace)
    } catch {
      Blockly.serialization.workspaces.load(STARTER, workspace)
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
    requestAnimationFrame(() => fitToView(workspace))

    const save = (e: Blockly.Events.Abstract) => {
      if (e.isUiEvent) return
      if (EDIT_EVENTS.has(e.type)) onEditRef.current?.()
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Blockly.serialization.workspaces.save(workspace)))
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
  }, [lang])

  useEffect(
    () => () => {
      ws.current?.dispose()
      ws.current = null
    },
    [],
  )

  return <div ref={host} className="h-full w-full" />
}
