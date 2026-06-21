import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { DEFAULT_SNAPSHOT } from '../../constants/defaults'
import { loadSnapshot, saveSnapshot } from '../../persistence/storage'
import { useGraphStore } from '../../store/graphStore'
import type { DisplayField, GraphSnapshot } from '../../types/graph'

const DISPLAY_OPTIONS: Array<{ key: DisplayField; label: string }> = [
  { key: 'label', label: 'Label' },
  { key: 'title', label: 'Title' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'targetDate', label: 'Target Date' },
  { key: 'conclusion', label: 'Conclusion' },
  { key: 'taskList', label: 'Task List' },
]

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toSafeFileName(value: string): string {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 80)
}

export function WorkspaceControls() {
  const [actionStatus, setActionStatus] = useState<'idle' | 'saved' | 'loaded' | 'reset'>('idle')
  const [collapsed, setCollapsed] = useState(true)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const ui = useGraphStore((state) => state.ui)
  const nodes = useGraphStore((state) => state.nodes)
  const edges = useGraphStore((state) => state.edges)
  const parkingLot = useGraphStore((state) => state.parkingLot)
  const ideaSpace = useGraphStore((state) => state.ideaSpace)
  const loadStoreSnapshot = useGraphStore((state) => state.loadSnapshot)
  const setMode = useGraphStore((state) => state.setMode)
  const setEditLock = useGraphStore((state) => state.setEditLock)
  const setDisplayField = useGraphStore((state) => state.setDisplayField)
  const toggleAllCollapsed = useGraphStore((state) => state.toggleAllCollapsed)

  useEffect(() => {
    if (actionStatus === 'idle') {
      return
    }

    const timer = window.setTimeout(() => setActionStatus('idle'), 1500)
    return () => window.clearTimeout(timer)
  }, [actionStatus])

  const handleSave = () => {
    saveSnapshot({ nodes, edges, parkingLot, ideaSpace, ui })
    setActionStatus('saved')
  }

  const handleLoad = () => {
    loadStoreSnapshot(loadSnapshot())
    setActionStatus('loaded')
  }

  const handleReset = () => {
    const confirmed = window.confirm('Reset workspace to default state? This will overwrite the current local storage snapshot.')
    if (!confirmed) {
      return
    }

    loadStoreSnapshot(DEFAULT_SNAPSHOT)
    saveSnapshot(DEFAULT_SNAPSHOT)
    setActionStatus('reset')
  }

  const handleExport = () => {
    const snapshot: GraphSnapshot = { nodes, edges, parkingLot, ideaSpace, ui }
    const json = JSON.stringify(snapshot, null, 2)
    const baseName = toSafeFileName(ideaSpace.title) || 'idea-space'
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${baseName}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const raw = await file.text()
      const parsed = JSON.parse(raw) as unknown

      if (!isObject(parsed) || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges) || !Array.isArray(parsed.parkingLot) || !isObject(parsed.ui)) {
        window.alert('Invalid JSON format. Please import a valid workspace snapshot file.')
        return
      }

      const nextSnapshot: GraphSnapshot = {
        nodes: parsed.nodes as GraphSnapshot['nodes'],
        edges: parsed.edges as GraphSnapshot['edges'],
        parkingLot: parsed.parkingLot as GraphSnapshot['parkingLot'],
        ideaSpace: isObject(parsed.ideaSpace)
          ? {
              title: typeof parsed.ideaSpace.title === 'string' ? parsed.ideaSpace.title : '',
              subtitle: typeof parsed.ideaSpace.subtitle === 'string' ? parsed.ideaSpace.subtitle : '',
              targetDate: typeof parsed.ideaSpace.targetDate === 'string' ? parsed.ideaSpace.targetDate : '',
            }
          : DEFAULT_SNAPSHOT.ideaSpace,
        ui: parsed.ui as unknown as GraphSnapshot['ui'],
      }

      loadStoreSnapshot(nextSnapshot)
      saveSnapshot(nextSnapshot)
      setActionStatus('loaded')
    } catch {
      window.alert('Failed to import JSON. Please check file content and try again.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <section className="panel controls-panel">
      <div className="panel-header">
        <h3>Workspace Controls</h3>
        <button 
          type="button" 
          className="collapse-button"
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '📘' : '📖'}
        </button>
      </div>
      {!collapsed && (
        <>
          <div className="button-row">
            <button type="button" onClick={() => toggleAllCollapsed(true)}>
              Collapse All
            </button>
            <button type="button" onClick={() => toggleAllCollapsed(false)}>
              Expand All
            </button>
            <button type="button" onClick={handleSave}>
              {actionStatus === 'saved' ? 'Saved' : 'Save'}
            </button>
            <button type="button" onClick={handleLoad}>
              {actionStatus === 'loaded' ? 'Loaded' : 'Load'}
            </button>
            <button type="button" onClick={handleReset}>
              {actionStatus === 'reset' ? 'Reset' : 'Reset'}
            </button>
            <button type="button" onClick={handleExport}>
              Export JSON
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </div>
          <div className="view-mode-group">
            <p>View Mode</p>
            <label className="radio-label">
              <input
                type="radio"
                name="viewMode"
                value="default"
                checked={ui.mode === 'default'}
                onChange={() => setMode('default')}
              />
              All
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="viewMode"
                value="focus"
                checked={ui.mode === 'focus'}
                onChange={() => setMode('focus')}
              />
              Focus
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="viewMode"
                value="finish"
                checked={ui.mode === 'finish'}
                onChange={() => setMode('finish')}
              />
              Finish
            </label>
          </div>

          <label className="checkbox-inline-label">
            <input
              type="checkbox"
              checked={ui.editLock}
              onChange={(event) => setEditLock(event.target.checked)}
            />
            Edit Lock (inline edit off)
          </label>

          <div className="display-options">
            <p>Custom Display</p>
            {DISPLAY_OPTIONS.map((option) => (
              <label key={option.key} className="checkbox-inline-label">
                <input
                  type="checkbox"
                  checked={ui.displayFields[option.key]}
                  onChange={(event) => setDisplayField(option.key, event.target.checked)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
