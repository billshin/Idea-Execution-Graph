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
  const ui = useGraphStore((state) => state.ui)
  const setFocusMode = useGraphStore((state) => state.setFocusMode)
  const setFinishMode = useGraphStore((state) => state.setFinishMode)
  const setEditLock = useGraphStore((state) => state.setEditLock)
  const setDisplayField = useGraphStore((state) => state.setDisplayField)
  const setEdgeTransparency = useGraphStore((state) => state.setEdgeTransparency)
  const toggleAllCollapsed = useGraphStore((state) => state.toggleAllCollapsed)

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
      </div>
      <label>
        <input
          type="checkbox"
          checked={ui.focusMode}
          onChange={(event) => setFocusMode(event.target.checked)}
        />
        Focus Mode
      </label>
      <label>
        <input
          type="checkbox"
          checked={ui.finishMode}
          onChange={(event) => setFinishMode(event.target.checked)}
        />
        Finish Mode
      </label>
      <label>
        <input
          type="checkbox"
          checked={ui.editLock}
          onChange={(event) => setEditLock(event.target.checked)}
        />
        Edit Lock (inline edit off)
      </label>

      <label>
        Edge Opacity
        <select
          value={ui.edgeTransparency}
          onChange={(event) => setEdgeTransparency(event.target.value as 'high' | 'medium' | 'low')}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>

      <div className="display-options">
        <p>Custom Display</p>
        {DISPLAY_OPTIONS.map((option) => (
          <label key={option.key}>
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
