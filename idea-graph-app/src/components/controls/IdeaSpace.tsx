import { useEffect, useState } from 'react'
import { useGraphStore } from '../../store/graphStore'
import { createPasswordHashValue } from '../../utils/passwords'

export function IdeaSpace() {
  const ideaSpace = useGraphStore((state) => state.ideaSpace)
  const accessMode = useGraphStore((state) => state.accessMode)
  const updateIdeaSpace = useGraphStore((state) => state.updateIdeaSpace)
  const [editMode, setEditMode] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')

  const isReadOnly = accessMode === 'read-only'

  useEffect(() => {
    if (isReadOnly) {
      setEditMode(false)
    }
  }, [isReadOnly])

  const savePassword = async (value: string) => {
    const trimmedValue = value.trim()
    if (!trimmedValue || isReadOnly) {
      return
    }

    updateIdeaSpace({ password: await createPasswordHashValue(trimmedValue) })
    setPasswordInput('')
  }

  return (
    <section className="panel idea-space-panel">
      <div className="idea-space-header">
        <h3>Idea Space</h3>
        <div className="idea-space-header-actions">
          <button
            type="button"
            className="edit-button"
            onClick={() => setShowHelp((current) => !current)}
            aria-label={showHelp ? 'Hide access help' : 'Show access help'}
          >
            ?
          </button>
          <button
            type="button"
            className="edit-button"
            onClick={() => setEditMode(!editMode)}
            aria-label={editMode ? 'Done editing' : 'Edit idea space'}
            disabled={isReadOnly}
          >
            ✏️
          </button>
        </div>
      </div>

      {showHelp ? (
        <div className="idea-space-help markdown-preview">
          <p>Mode behavior</p>
          <ul>
            <li>No password + Read Only enabled: open in read-only mode.</li>
            <li>No password + Read Only disabled: open in edit mode.</li>
            <li>Password configured: matching password opens edit mode.</li>
          </ul>
        </div>
      ) : null}

      {editMode ? (
        <div className="idea-space-form">
          <label>
            <span>Title</span>
            <input
              type="text"
              placeholder="新想法"
              value={ideaSpace.title}
              onChange={(e) => updateIdeaSpace({ title: e.target.value })}
            />
          </label>
          <label>
            <span>Subtitle</span>
            <input
              type="text"
              placeholder="為了什麼目的"
              value={ideaSpace.subtitle}
              onChange={(e) => updateIdeaSpace({ subtitle: e.target.value })}
            />
          </label>
          <label>
            <span>Category</span>
            <input
              type="text"
              placeholder="Category"
              value={ideaSpace.category}
              onChange={(e) => updateIdeaSpace({ category: e.target.value })}
            />
          </label>
          <label>
            <span>Author</span>
            <input
              type="text"
              placeholder="Author"
              value={ideaSpace.author}
              onChange={(e) => updateIdeaSpace({ author: e.target.value })}
            />
          </label>
          <label>
            <span>Target Date</span>
            <input
              type="date"
              value={ideaSpace.targetDate}
              onChange={(e) => updateIdeaSpace({ targetDate: e.target.value })}
            />
          </label>
          <label>
            <span>Password</span>
            <div className="password-input-row">
              <input
                type="password"
                placeholder={ideaSpace.password ? '••••••••' : 'Set password for edit mode'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onBlur={() => void savePassword(passwordInput)}
              />
              {ideaSpace.password ? (
                <button
                  type="button"
                  className="password-clear-btn"
                  onClick={() => {
                    updateIdeaSpace({ password: null, readOnly: false })
                    setPasswordInput('')
                  }}
                  title="取消密碼"
                >
                  ✕
                </button>
              ) : null}
            </div>
          </label>
          <label className="checkbox-inline-label">
            <input
              type="checkbox"
              checked={ideaSpace.readOnly}
              onChange={(e) => updateIdeaSpace({ readOnly: e.target.checked })}
              disabled={!ideaSpace.password}
            />
            <span>Read Only{!ideaSpace.password ? '（需先設定密碼）' : ''}</span>
          </label>
        </div>
      ) : (
        <div className="idea-space-display">
          <div className="idea-space-item">
            <span className="value">{ideaSpace.title || '新想法'}</span>
          </div>
          <div className="idea-space-item subtitle-item">
            <span className="value">{ideaSpace.subtitle || '為了什麼目的'}</span>
          </div>
          {ideaSpace.category ? (
            <div className="idea-space-item">
              <span className="label">Category</span>
              <span className="value idea-space-meta">{ideaSpace.category}</span>
            </div>
          ) : null}
          {ideaSpace.author ? (
            <div className="idea-space-item">
              <span className="label">Author</span>
              <span className="value idea-space-meta">{ideaSpace.author}</span>
            </div>
          ) : null}
          <div className="idea-space-item">
            <span className="label">Access</span>
            <span className="value idea-space-meta">{isReadOnly ? 'Read Only' : 'Editable'}</span>
          </div>
          {ideaSpace.targetDate && (
            <div className="idea-space-item">
              <span className="value">{ideaSpace.targetDate}</span>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
