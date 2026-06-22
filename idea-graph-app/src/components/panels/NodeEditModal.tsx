import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ALLOWED_STATUSES } from '../../constants/status'
import { useEditingNode, useGraphStore } from '../../store/graphStore'
import type { IdeaStatus } from '../../types/graph'

export function NodeEditModal() {
  const node = useEditingNode()
  const closeNodeEditor = useGraphStore((state) => state.closeNodeEditor)
  const updateNode = useGraphStore((state) => state.updateNode)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskCategory, setTaskCategory] = useState('')
  const [taskConclusion, setTaskConclusion] = useState('')
  const [labelsInput, setLabelsInput] = useState('')

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeNodeEditor()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeNodeEditor])

  useEffect(() => {
    setLabelsInput((node?.data.labels ?? []).join(', '))
  }, [node?.id, node?.data.labels])

  if (!node) {
    return null
  }

  const saveTask = () => {
    if (!taskTitle.trim()) {
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

  const commitLabels = () => {
    updateNode(node.id, {
      labels: labelsInput
        .split(',')
        .map((label) => label.trim())
        .filter(Boolean),
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={closeNodeEditor}>
      <section className="panel modal-panel modal-2col" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>Node Detail</h3>
          <button type="button" onClick={closeNodeEditor}>
            Close
          </button>
        </div>

        <div className="modal-main-grid">
          {/* Left Column */}
          <div className="modal-left-column">
            <label>
              Title
              <input
                value={node.data.title}
                onChange={(event) => updateNode(node.id, { title: event.target.value })}
              />
            </label>
            <label>
              Subtitle
              <input
                value={node.data.subtitle}
                onChange={(event) => updateNode(node.id, { subtitle: event.target.value })}
              />
            </label>
            <label>
              Target Date
              <input
                type="date"
                value={node.data.targetDate ?? ''}
                onChange={(event) => updateNode(node.id, { targetDate: event.target.value })}
              />
            </label>
            <label>
              Conclusion
              <input
                value={node.data.conclusion}
                onChange={(event) => updateNode(node.id, { conclusion: event.target.value })}
              />
            </label>
            <label>
              Status
              <select
                value={node.data.status}
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
                value={labelsInput}
                onChange={(event) => setLabelsInput(event.target.value)}
                onBlur={commitLabels}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    commitLabels()
                  }
                }}
              />
            </label>
            <label className="checkbox-inline-label">
              <input
                type="checkbox"
                checked={node.data.isFocusPath}
                onChange={(event) => updateNode(node.id, { isFocusPath: event.target.checked })}
              />
              <span>Focus Path</span>
            </label>

            <div className="task-editor">
              <p>Tasks</p>
              <div className="task-list-container">
                {node.data.tasks.map((task) => (
                  <div key={task.id} className="task-row">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(event) => updateTask(task.id, { done: event.target.checked })}
                      className="task-checkbox"
                    />
                    <div className="task-row-content">
                      <input
                        className="task-required-field"
                        value={task.category}
                        onChange={(event) => updateTask(task.id, { category: event.target.value })}
                        placeholder="Category"
                      />
                      <input
                        className="task-title-field"
                        value={task.title}
                        onChange={(event) => updateTask(task.id, { title: event.target.value })}
                        placeholder="Task title"
                      />

                      <input
                        className="task-conclusion-field"
                        value={task.conclusion}
                        onChange={(event) => updateTask(task.id, { conclusion: event.target.value })}
                        placeholder="Conclusion"
                      />
                    </div>
                    <button
                      type="button"
                      className="task-remove-btn"
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
                  onChange={(event) => setTaskCategory(event.target.value)}
                />
                <input
                  placeholder="Task title"
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                />
                <input
                  placeholder="Conclusion"
                  value={taskConclusion}
                  onChange={(event) => setTaskConclusion(event.target.value)}
                />
                <button type="button" onClick={saveTask}>
                  Add Task
                </button>
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="modal-middle-column">
            <label>
              Markdown Content
              <textarea
                value={node.data.content}
                onChange={(event) => updateNode(node.id, { content: event.target.value })}
              />
            </label>
          </div>

          {/* Right Column */}
          <div className="modal-right-column">
            <div className="markdown-preview">
              <p>Preview</p>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{node.data.content || '_Empty_'}</ReactMarkdown>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
