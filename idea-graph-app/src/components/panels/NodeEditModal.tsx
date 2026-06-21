import { useMemo, useState } from 'react'
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
  const [taskRequired, setTaskRequired] = useState('')

  const labels = useMemo(() => (node?.data.labels ?? []).join(', '), [node?.data.labels])

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
          required: taskRequired.trim(),
          done: false,
        },
      ],
    })

    setTaskTitle('')
    setTaskRequired('')
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={closeNodeEditor}>
      <section className="panel modal-panel" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>Node Detail</h3>
          <button type="button" onClick={closeNodeEditor}>
            Close
          </button>
        </div>
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
            value={labels}
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
            onChange={(event) => updateNode(node.id, { isFocusPath: event.target.checked })}
          />
        </label>

        <label>
          Markdown Content
          <textarea
            value={node.data.content}
            onChange={(event) => updateNode(node.id, { content: event.target.value })}
          />
        </label>

        <div className="markdown-preview">
          <p>Preview</p>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{node.data.content || '_Empty_'}</ReactMarkdown>
        </div>

        <div className="task-editor">
          <p>Tasks</p>
          <ul>
            {node.data.tasks.map((task) => (
              <li key={task.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={(event) =>
                      updateNode(node.id, {
                        tasks: node.data.tasks.map((item) =>
                          item.id === task.id ? { ...item, done: event.target.checked } : item,
                        ),
                      })
                    }
                  />
                  {task.title}
                </label>
              </li>
            ))}
          </ul>
          <input
            placeholder="Task title"
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
          />
          <input
            placeholder="Required details"
            value={taskRequired}
            onChange={(event) => setTaskRequired(event.target.value)}
          />
          <button type="button" onClick={saveTask}>
            Add Task
          </button>
        </div>
      </section>
    </div>
  )
}
