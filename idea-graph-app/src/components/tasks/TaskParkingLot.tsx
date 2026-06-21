import { useState } from 'react'
import { useGraphStore } from '../../store/graphStore'

export function TaskParkingLot() {
  const parkingLot = useGraphStore((state) => state.parkingLot)
  const selectedNodeId = useGraphStore((state) => state.selectedNodeId)
  const addParkingItem = useGraphStore((state) => state.addParkingItem)
  const removeParkingItem = useGraphStore((state) => state.removeParkingItem)
  const convertParkingItemToTask = useGraphStore((state) => state.convertParkingItemToTask)

  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')

  return (
    <section className="panel parking-panel">
      <h3>Task Parking Lot</h3>
      <p>Put side ideas here and convert later.</p>
      <input
        placeholder="Task title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <textarea
        placeholder="Task note"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <button
        type="button"
        onClick={() => {
          if (!title.trim()) {
            return
          }
          addParkingItem(title.trim(), note.trim())
          setTitle('')
          setNote('')
        }}
      >
        Add Parking Item
      </button>

      <ul>
        {parkingLot.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong>
            {item.note ? <p>{item.note}</p> : null}
            <div className="button-row">
              <button type="button" onClick={() => removeParkingItem(item.id)}>
                Remove
              </button>
              <button
                type="button"
                disabled={!selectedNodeId}
                onClick={() => selectedNodeId && convertParkingItemToTask(item.id, selectedNodeId)}
              >
                To Selected Node
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
