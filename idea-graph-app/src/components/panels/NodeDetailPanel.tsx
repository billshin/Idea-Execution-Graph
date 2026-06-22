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
                <div key={task.id} className="task-row">
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
          <label>
            Markdown Content
            <textarea
              value={node.data.content}
              disabled={isReadOnly}
              onChange={(event) => updateNode(node.id, { content: event.target.value })}
              className="markdown-editor"
            />
          </label>

          <div className="markdown-preview">
            <p>Preview</p>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{node.data.content || '_Empty_'}</ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  )
}
