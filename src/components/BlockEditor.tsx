import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import * as Blockly from 'blockly/core'
import { STARTER, defineBlocks, readProgram, theme, toolbox } from '../blocks/blockly'
import type { Lang } from '../i18n'
import type { Step } from '../levels/train/model'

export interface BlockEditorHandle {
  program: () => Step[] | null
}

const STORAGE_KEY = 'kotakata.level1.blocks'

function loadSaved(): object {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore broken or blocked storage */
  }
  return STARTER
}

export default function BlockEditor({ lang, ref }: { lang: Lang; ref: Ref<BlockEditorHandle> }) {
  const host = useRef<HTMLDivElement>(null)
  const ws = useRef<Blockly.WorkspaceSvg | null>(null)

  useImperativeHandle(ref, () => ({ program: () => (ws.current ? readProgram(ws.current) : null) }), [])

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
    // Start with every block in view: zoom out if the editor is narrow, but
    // never zoom in past the normal size.
    requestAnimationFrame(() => {
      Blockly.svgResize(workspace)
      workspace.zoomToFit()
      if (workspace.scale > 0.9) {
        workspace.setScale(0.9)
        workspace.scrollCenter()
      }
    })

    const save = (e: Blockly.Events.Abstract) => {
      if (e.isUiEvent) return
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
