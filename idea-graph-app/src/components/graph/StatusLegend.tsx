import { useState } from 'react'
import { STATUS_COLOR_MAP, STATUS_LABEL_MAP } from '../../constants/status'
import type { IdeaStatus } from '../../types/graph'

export function StatusLegend() {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <section className="panel legend-panel">
      <div className="legend-header">
        <h3>Status Legend</h3>
        <button
          type="button"
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand status legend' : 'Collapse status legend'}
        >
          {collapsed ? '📘' : '📖'}
        </button>
      </div>
      {!collapsed && (
        <ul>
          {Object.entries(STATUS_LABEL_MAP).map(([status, label]) => (
            <li key={status}>
              <span
                className="legend-color"
                style={{ backgroundColor: STATUS_COLOR_MAP[status as IdeaStatus] }}
              />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
