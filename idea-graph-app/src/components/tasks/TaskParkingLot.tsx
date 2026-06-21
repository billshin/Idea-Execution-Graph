import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { DEFAULT_IDEA_NOTE_CONTENT } from '../../constants/defaults'
import { useGraphStore } from '../../store/graphStore'

export function TaskParkingLot() {
  const parkingLot = useGraphStore((state) => state.parkingLot)
  const addParkingItem = useGraphStore((state) => state.addParkingItem)
  const updateParkingItem = useGraphStore((state) => state.updateParkingItem)

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')

  // Ensure single note exists
  useEffect(() => {
    if (parkingLot.length === 0) {
      addParkingItem(DEFAULT_IDEA_NOTE_CONTENT)
      return
    }

    const firstNote = parkingLot[0]
    if (firstNote && firstNote.content.trim().length === 0) {
      updateParkingItem(firstNote.id, DEFAULT_IDEA_NOTE_CONTENT)
    }
  }, [addParkingItem, parkingLot, updateParkingItem])

  useEffect(() => {
    if (!editingNoteId) {
      return
    }

    const activeItem = parkingLot.find((item) => item.id === editingNoteId)
    if (!activeItem) {
      setEditingNoteId(null)
      setEditingContent('')
    }
  }, [editingNoteId, parkingLot])

  const commitEditingNote = () => {
    if (!editingNoteId) {
      return
    }

    updateParkingItem(editingNoteId, editingContent.trim())
    setEditingNoteId(null)
    setEditingContent('')
  }

  const note = parkingLot[0]

  return (
    <section className="panel parking-panel">
      <h3>Idea Note</h3>
      {note ? (
        <>
          {editingNoteId === note.id ? (
            <textarea
              className="idea-note-editor"
              autoFocus
              value={editingContent}
              onChange={(event) => setEditingContent(event.target.value)}
              onBlur={commitEditingNote}
            />
          ) : (
            <div
              role="button"
              tabIndex={0}
              className="idea-note-preview markdown-preview"
              onClick={() => {
                setEditingNoteId(note.id)
                setEditingContent(note.content)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setEditingNoteId(note.id)
                  setEditingContent(note.content)
                }
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {note.content.trim() || DEFAULT_IDEA_NOTE_CONTENT}
              </ReactMarkdown>
            </div>
          )}
        </>
      ) : null}
    </section>
  )
}
