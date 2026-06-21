import { Handle, Position, type NodeProps } from 'reactflow'
import { useEffect, useRef, useState } from 'react'
import { STATUS_COLOR_MAP } from '../../constants/status'
import type { IdeaNodeData } from '../../types/graph'
import { useGraphStore } from '../../store/graphStore'

function InlineInput({
  className,
  value,
  onCommit,
  placeholder,
  autoFocus,
}: {
  className: string
  value: string
  onCommit: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}) {
  const [localValue, setLocalValue] = useState(value)
  const composingRef = useRef(false)

  return (
    <input
      className={className}
      value={localValue}
      autoFocus={autoFocus}
      placeholder={placeholder}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => setLocalValue(event.target.value)}
      onCompositionStart={() => { composingRef.current = true }}
      onCompositionEnd={() => { composingRef.current = false }}
      onBlur={() => onCommit(localValue)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !composingRef.current) {
          event.preventDefault()
          onCommit(localValue)
        }
      }}
    />
  )
}

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
      <header>
        {displayFields.label && data.labels.length > 0 ? (
          <ul className="label-list top-labels">
            {data.labels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        ) : null}
        <div className="node-actions top-right">
          <button
            type="button"
            className="collapse-btn"
            title={data.collapsed ? 'Expand' : 'Collapse'}
            onClick={(event) => {
              event.stopPropagation()
              toggleNodeCollapsed(id)
            }}
          >
            {data.collapsed ? '📘' : '📖'}
          </button>
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
            ➕
          </button>
        </div>
      </header>

      {displayFields.title ? (
        editingField === 'title' && !editLock ? (
          <InlineInput
            className="inline-title"
            value={data.title}
            autoFocus
            onCommit={(value) => commitField('title', value)}
          />
        ) : (
          <button
            type="button"
            className="inline-display"
            disabled={editLock}
            style={{ fontWeight: 'bold' }}
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

      {displayFields.subtitle && data.subtitle.trim() ? (
        editingField === 'subtitle' && !editLock ? (
          <InlineInput
            className="inline-field"
            value={data.subtitle}
            autoFocus
            placeholder="Subtitle"
            onCommit={(value) => commitField('subtitle', value)}
          />
        ) : (
          <button
            type="button"
            className="inline-display subtitle-display"
            disabled={editLock}
            onClick={(event) => {
              event.stopPropagation()
              if (!editLock) {
                setEditingField('subtitle')
              }
            }}
          >
            {data.subtitle}
          </button>
        )
      ) : null}

      {displayFields.conclusion && data.conclusion.trim() ? (
        editingField === 'conclusion' && !editLock ? (
          <InlineInput
            className="inline-field"
            value={data.conclusion}
            autoFocus
            placeholder="Conclusion"
            onCommit={(value) => commitField('conclusion', value)}
          />
        ) : (
          <button
            type="button"
            className="inline-display conclusion-display"
            disabled={editLock}
            onClick={(event) => {
              event.stopPropagation()
              if (!editLock) {
                setEditingField('conclusion')
              }
            }}
          >
            {data.conclusion}
          </button>
        )
      ) : null}

      {displayFields.targetDate && data.targetDate ? <small>Target: {data.targetDate}</small> : null}
      {displayFields.taskList && data.tasks.length > 0 ? (
        <ul className="task-mini-list">
          {data.tasks.slice(0, 3).map((task) => (
            <li key={task.id} className={task.done ? 'task-completed' : ''}>
                <span className="task-title">{task.title}</span>
                {task.conclusion && <span className="task-conclusion">{task.conclusion}</span>}
            </li>
          ))}
        </ul>
      ) : null}

      {data.collapsed ? <p className="task-count">Tasks: {data.hiddenTaskCount}</p> : null}

      {trayOpen ? (
        <div className="node-utility-tray" onClick={(event) => event.stopPropagation()}>
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
        </div>
      ) : null}
      <Handle type="source" position={Position.Right} />
    </article>
  )
}
