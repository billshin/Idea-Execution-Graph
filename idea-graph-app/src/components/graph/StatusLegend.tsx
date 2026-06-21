import { STATUS_COLOR_MAP, STATUS_LABEL_MAP } from '../../constants/status'
import type { IdeaStatus } from '../../types/graph'

export function StatusLegend() {
  return (
    <section className="panel legend-panel">
      <h3>Status Legend</h3>
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
    </section>
  )
}
