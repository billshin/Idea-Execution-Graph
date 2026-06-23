import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ALLOWED_STATUSES } from '../../constants/status'
import { useGraphStore, useSelectedNode } from '../../store/graphStore'
import type { IdeaStatus } from '../../types/graph'

export function NodeDetailPanel() {
  const node = useSelectedNode()
  const updateNode = useGraphStore((state) => state.updateNode)
  const isReadOnly = useGraphStore((state) => state.accessMode === 'read-only')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskCategory, setTaskCategory] = useState('')
  const [taskConclusion, setTaskConclusion] = useState('')
  const [isEditingMarkdown, setIsEditingMarkdown] = useState(false)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null)

  const labels = useMemo(() => (node?.data.labels ?? []).join(', '), [node?.data.labels])

  if (!node) {
    return (
      <section className="panel detail-panel">
        <h3>Node Detail</h3>
        <p>Select a node to edit details.</p>
      </section>
    )
  }

  const saveTask = () => {
    if (!taskTitle.trim()) {
      return
    }

    if (isReadOnly) {
      return
    }

    updateNode(node.id, {
      tasks: [
        ...node.data.tasks,
        {
          id: crypto.randomUUID(),
          title: taskTitle.trim(),
          category: taskCategory.trim(),
          conclusion: taskConclusion.trim(),
          done: false,
        },
      ],
    })

    setTaskTitle('')
    setTaskCategory('')
    setTaskConclusion('')
  }

  const updateTask = (taskId: string, updates: Partial<typeof node.data.tasks[0]>) => {
    updateNode(node.id, {
      tasks: node.data.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    })
  }

  const removeTask = (taskId: string) => {
    updateNode(node.id, {
      tasks: node.data.tasks.filter((task) => task.id !== taskId),
    })
  }

  const reorderTask = (fromTaskId: string, toTaskId: string) => {
    if (fromTaskId === toTaskId) {
      return
    }

    const fromIndex = node.data.tasks.findIndex((task) => task.id === fromTaskId)
    const toIndex = node.data.tasks.findIndex((task) => task.id === toTaskId)

    if (fromIndex < 0 || toIndex < 0) {
      return
    }

    const nextTasks = [...node.data.tasks]
    const [movedTask] = nextTasks.splice(fromIndex, 1)
    nextTasks.splice(toIndex, 0, movedTask)

    updateNode(node.id, { tasks: nextTasks })
  }

  return (
    <section className="panel detail-panel detail-panel-2col">
      <h3>Node Detail</h3>
      {isReadOnly ? <p className="empty-state">Read-only mode. Node editing is disabled.</p> : null}

      <div className="detail-main-grid">
        {/* Left Column: Controls */}
        <div className="detail-left-column">
          <label>
            Title
            <input
              value={node.data.title}
              disabled={isReadOnly}
              onChange={(event) => updateNode(node.id, { title: event.target.value })}
            />
          </label>
          <label>
            Subtitle
            <input
              value={node.data.subtitle}
              disabled={isReadOnly}
              onChange={(event) => updateNode(node.id, { subtitle: event.target.value })}
            />
          </label>
          <label>
            Target Date
            <input
              type="date"
              value={node.data.targetDate ?? ''}
              disabled={isReadOnly}
              onChange={(event) => updateNode(node.id, { targetDate: event.target.value })}
            />
          </label>
          <label>
            Conclusion
            <input
              value={node.data.conclusion}
              disabled={isReadOnly}
              onChange={(event) => updateNode(node.id, { conclusion: event.target.value })}
            />
          </label>
          <label>
            Status
            <select
              value={node.data.status}
              disabled={isReadOnly}
              onChange={(event) => updateNode(node.id, { status: event.target.value as IdeaStatus })}
            >
              {ALLOWED_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Labels (comma separated)
            <input
              value={labels}
              disabled={isReadOnly}
              onChange={(event) =>
                updateNode(node.id, {
                  labels: event.target.value
                    .split(',')
                    .map((label) => label.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
          <label>
            Focus Path
            <input
              type="checkbox"
              checked={node.data.isFocusPath}
              disabled={isReadOnly}
              onChange={(event) => updateNode(node.id, { isFocusPath: event.target.checked })}
            />
          </label>

          <div className="task-editor">
            <p>Tasks</p>
            <div className="task-list-container">
              {node.data.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-row${dragOverTaskId === task.id ? ' task-row--drag-over' : ''}`}
                  onDragOver={(event) => {
                    if (!draggedTaskId) {
                      return
                    }

                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                    if (dragOverTaskId !== task.id) {
                      setDragOverTaskId(task.id)
                    }
                  }}
                  onDrop={(event) => {
                    if (!draggedTaskId) {
                      return
                    }

                    event.preventDefault()
                    reorderTask(draggedTaskId, task.id)
                    setDraggedTaskId(null)
                    setDragOverTaskId(null)
                  }}
                >
                  <button
                    type="button"
                    className="task-drag-handle"
                    title="拖曳調整順序"
                    aria-label="拖曳調整順序"
                    draggable
                    onDragStart={(event) => {
                      // Firefox needs setData for drag events to be emitted reliably.
                      event.dataTransfer.setData('text/plain', task.id)
                      event.dataTransfer.effectAllowed = 'move'
                      setDraggedTaskId(task.id)
                    }}
                    onDragEnd={() => {
                      setDraggedTaskId(null)
                      setDragOverTaskId(null)
                    }}
                    onClick={(event) => event.preventDefault()}
                  >
                    ↕
                  </button>
                  <input
                    type="checkbox"
                    checked={task.done}
                    disabled={isReadOnly}
                    onChange={(event) => updateTask(task.id, { done: event.target.checked })}
                    className="task-checkbox"
                  />
                  <div className="task-row-content">
                    <input
                      className="task-required-field"
                      value={task.category}
                      disabled={isReadOnly}
                      onChange={(event) => updateTask(task.id, { category: event.target.value })}
                      placeholder="Category"
                    />
                    <input
                      className="task-title-field"
                      value={task.title}
                      disabled={isReadOnly}
                      onChange={(event) => updateTask(task.id, { title: event.target.value })}
                      placeholder="Task title"
                    />

                    <input
                      className="task-conclusion-field"
                      value={task.conclusion}
                      disabled={isReadOnly}
                      onChange={(event) => updateTask(task.id, { conclusion: event.target.value })}
                      placeholder="Conclusion"
                    />
                  </div>
                  <button
                    type="button"
                    className="task-remove-btn"
                    disabled={isReadOnly}
                    onClick={() => removeTask(task.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="task-add-form">

              <input
                placeholder="Category"
                value={taskCategory}
                disabled={isReadOnly}
                onChange={(event) => setTaskCategory(event.target.value)}
              />
              <input
                placeholder="Task title"
                value={taskTitle}
                disabled={isReadOnly}
                onChange={(event) => setTaskTitle(event.target.value)}
              />
              <input
                placeholder="Conclusion"
                value={taskConclusion}
                disabled={isReadOnly}
                onChange={(event) => setTaskConclusion(event.target.value)}
              />
              <button type="button" onClick={saveTask} disabled={isReadOnly}>
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Markdown Editor */}
        <div className="detail-right-column">
          <div className="markdown-content-header">
            <label>
              Markdown Content
            </label>
            {!isReadOnly && (
              <button
                type="button"
                className="markdown-edit-btn"
                onClick={() => setIsEditingMarkdown(!isEditingMarkdown)}
                title={isEditingMarkdown ? 'Preview mode' : 'Edit mode'}
              >
                {isEditingMarkdown ? '👁️' : '✏️'}
              </button>
            )}
          </div>

          {isEditingMarkdown && !isReadOnly ? (
            <textarea
              value={node.data.content}
              onChange={(event) => updateNode(node.id, { content: event.target.value })}
              className="markdown-editor"
            />
          ) : (
            <div className="markdown-preview">
              <p>Preview</p>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{node.data.content || '_Empty_'}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
