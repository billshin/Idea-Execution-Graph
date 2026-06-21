import { useState } from 'react'
import { useGraphStore } from '../../store/graphStore'

export function IdeaSpace() {
  const ideaSpace = useGraphStore((state) => state.ideaSpace)
  const updateIdeaSpace = useGraphStore((state) => state.updateIdeaSpace)
  const [editMode, setEditMode] = useState(false)

  return (
    <section className="panel idea-space-panel">
      <div className="idea-space-header">
        <h3>Idea Space</h3>
        <button
          type="button"
          className="edit-button"
          onClick={() => setEditMode(!editMode)}
          aria-label={editMode ? 'Done editing' : 'Edit idea space'}
        >
          ✏️
        </button>
      </div>

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
            <span>Target Date</span>
            <input
              type="date"
              value={ideaSpace.targetDate}
              onChange={(e) => updateIdeaSpace({ targetDate: e.target.value })}
            />
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
