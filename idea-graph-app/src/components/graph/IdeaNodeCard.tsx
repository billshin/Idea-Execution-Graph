import { Handle, Position, type NodeProps } from 'reactflow'
import { useEffect, useState } from 'react'
import { STATUS_COLOR_MAP } from '../../constants/status'
import type { IdeaNodeData } from '../../types/graph'
import { useGraphStore } from '../../store/graphStore'

export function IdeaNodeCard({ id, data, selected }: NodeProps<IdeaNodeData>) {
  const displayFields = useGraphStore((state) => state.ui.displayFields)
  const editLock = useGraphStore((state) => state.ui.editLock)
  const addConnectedNode = useGraphStore((state) => state.addConnectedNode)
  const toggleNodeCollapsed = useGraphStore((state) => state.toggleNodeCollapsed)
  const removeNode = useGraphStore((state) => state.removeNode)
  const openNodeEditor = useGraphStore((state) => state.openNodeEditor)
  const setSelectedNode = useGraphStore((state) => state.setSelectedNode)
  const updateNode = useGraphStore((state) => state.updateNode)
  const [editingField, setEditingField] = useState<'title' | 'subtitle' | 'conclusion' | null>(null)
  const [trayOpen, setTrayOpen] = useState(false)

  useEffect(() => {
    if (editLock) {
      setEditingField(null)
    }
  }, [editLock])

  const commitField = (field: 'title' | 'subtitle' | 'conclusion', value: string) => {
    updateNode(id, { [field]: value } as Partial<IdeaNodeData>)
    setEditingField((current) => (current === field ? null : current))
  }

  return (
    <article
      className={`idea-node ${selected ? 'is-selected' : ''}`}
      style={{ borderColor: STATUS_COLOR_MAP[data.status] }}
      onClick={() => setSelectedNode(id)}
      onDoubleClick={() => openNodeEditor(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          setSelectedNode(id)
        }
      }}
    >
      <Handle type="target" position={Position.Left} />
      {displayFields.label && data.labels.length > 0 ? (
        <ul className="label-list top-labels">
          {data.labels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      ) : null}
      <header>
        <select
          className="node-status-select"
          value={data.status}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => updateNode(id, { status: event.target.value as IdeaNodeData['status'] })}
        >
          <option value="open">Open</option>
          <option value="doing">Doing</option>
          <option value="wait">Wait</option>
          <option value="hold">Hold</option>
          <option value="finish">Finish</option>
          <option value="fail">Fail</option>
          <option value="cancel">Cancel</option>
        </select>
        <div className="node-actions top-right">
          <button
            type="button"
            className="gear-btn"
            onClick={(event) => {
              event.stopPropagation()
              setTrayOpen((current) => !current)
            }}
          >
            ⚙️
          </button>
          <button
            type="button"
            className="add-node-inline"
            onClick={(event) => {
              event.stopPropagation()
              addConnectedNode(id)
            }}
          >
            +
          </button>
        </div>
      </header>

      {displayFields.title ? (
        editingField === 'title' && !editLock ? (
          <input
            className="inline-title"
            value={data.title}
            autoFocus
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => updateNode(id, { title: event.target.value })}
            onBlur={(event) => commitField('title', event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                commitField('title', (event.target as HTMLInputElement).value)
              }
            }}
          />
        ) : (
          <button
            type="button"
            className="inline-display"
            disabled={editLock}
            onClick={(event) => {
              event.stopPropagation()
              if (!editLock) {
                setEditingField('title')
              }
            }}
          >
            {data.title || 'Untitled'}
          </button>
        )
      ) : null}

      {displayFields.subtitle ? (
        editingField === 'subtitle' && !editLock ? (
          <input
            className="inline-field"
            value={data.subtitle}
            autoFocus
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => updateNode(id, { subtitle: event.target.value })}
            onBlur={(event) => commitField('subtitle', event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                commitField('subtitle', (event.target as HTMLInputElement).value)
              }
            }}
            placeholder="Subtitle"
          />
        ) : (
          <button
            type="button"
            className="inline-display"
            disabled={editLock}
            onClick={(event) => {
              event.stopPropagation()
              if (!editLock) {
                setEditingField('subtitle')
              }
            }}
          >
            {data.subtitle || 'Subtitle'}
          </button>
        )
      ) : null}
      {displayFields.targetDate && data.targetDate ? <small>Target: {data.targetDate}</small> : null}
      {displayFields.conclusion ? (
        editingField === 'conclusion' && !editLock ? (
          <input
            className="inline-field"
            value={data.conclusion}
            autoFocus
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => updateNode(id, { conclusion: event.target.value })}
            onBlur={(event) => commitField('conclusion', event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                commitField('conclusion', (event.target as HTMLInputElement).value)
              }
            }}
            placeholder="Conclusion"
          />
        ) : (
          <button
            type="button"
            className="inline-display"
            disabled={editLock}
            onClick={(event) => {
              event.stopPropagation()
              if (!editLock) {
                setEditingField('conclusion')
              }
            }}
          >
            {data.conclusion || 'Conclusion'}
          </button>
        )
      ) : null}
      {displayFields.taskList ? (
        <ul className="task-mini-list">
          {data.tasks.slice(0, 3).map((task) => (
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
      ) : null}

      {data.collapsed ? <p className="task-count">Tasks: {data.hiddenTaskCount}</p> : null}

      {trayOpen ? (
        <div className="node-utility-tray" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            className="utility-btn"
            onClick={() => toggleNodeCollapsed(id)}
          >
            {data.collapsed ? 'Expand' : 'Collapse'}
          </button>
          <button
            type="button"
            className="utility-btn"
            onClick={(event) => {
              event.stopPropagation()
              openNodeEditor(id)
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="utility-btn"
            onClick={(event) => {
              event.stopPropagation()
              removeNode(id)
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
      <Handle type="source" position={Position.Right} />
    </article>
  )
}
