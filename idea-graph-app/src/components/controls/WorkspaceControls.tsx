import { useEffect, useState } from 'react'
import { DEFAULT_SNAPSHOT } from '../../constants/defaults'
import { loadSnapshot, saveSnapshot } from '../../persistence/storage'
import { useGraphStore } from '../../store/graphStore'
import type { DisplayField } from '../../types/graph'

const DISPLAY_OPTIONS: Array<{ key: DisplayField; label: string }> = [
  { key: 'label', label: 'Label' },
  { key: 'title', label: 'Title' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'targetDate', label: 'Target Date' },
  { key: 'conclusion', label: 'Conclusion' },
  { key: 'taskList', label: 'Task List' },
]

export function WorkspaceControls() {
  const [actionStatus, setActionStatus] = useState<'idle' | 'saved' | 'loaded' | 'reset'>('idle')
  const ui = useGraphStore((state) => state.ui)
  const nodes = useGraphStore((state) => state.nodes)
  const edges = useGraphStore((state) => state.edges)
  const parkingLot = useGraphStore((state) => state.parkingLot)
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
    saveSnapshot({ nodes, edges, parkingLot, ui })
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

  return (
    <section className="panel controls-panel">
      <h3>Workspace Controls</h3>
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
    </section>
  )
}
