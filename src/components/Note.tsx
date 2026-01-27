import React from 'react'
import type { Note as NoteType } from '@app-types/Note'
import noteStyles from '@styles/note.module.css'

interface NoteProps {
  note: NoteType;
  updateNote: (note: NoteType) => void;
}

const Note: React.FC<NoteProps> = ({ note, updateNote }): React.ReactElement => {
  const dynamicStyle: React.CSSProperties = {
    width: note.size.width,
    height: note.size.height,
    backgroundColor: note.color,
    zIndex: note.zIndex,
    transform: `translate(${note.position.x}px, ${note.position.y}px)`,
  }

  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('noteId', note.id)
    event.dataTransfer.effectAllowed = 'move'

    const target = event.currentTarget as HTMLElement
    target.classList.add(noteStyles.isDraggingEffect)

    event.stopPropagation();
  }

  const handleDragEnd = (event: React.DragEvent) => {
    const target = event.currentTarget as HTMLElement
    target.classList.remove(noteStyles.isDraggingEffect)
  };

  const handleResize = (event: React.PointerEvent) => {
    event.preventDefault()

    const startX = event.clientX
    const startY = event.clientY
    const { width: startW, height: startH } = note.size

    const onMove = (event: PointerEvent) => {
      updateNote({
        ...note,
        size: {
          width: Math.max(100, startW + (event.clientX - startX)),
          height: Math.max(100, startH + (event.clientY - startY)),
        }
      })
    }

    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNote({ ...note, text: event.target.value })
  }

  return (
    <div
      id={`note-${note.id}`}
      tabIndex={0}
      role="application"
      aria-label={`Sticky note ${note.id}. Position: ${note.position.x}, ${note.position.y}. Size: ${note.size.width} by ${note.size.height}. Use arrow keys to move, drag to reposition.`}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={noteStyles.note}
      style={dynamicStyle}
      draggable
    >
      <textarea
        id={`note-textarea-${note.id}`}
        name={`note-text-${note.id}`}
        className={noteStyles.textarea}
        value={note.text}
        onChange={handleTextChange}
        placeholder="Type anything..."
        aria-label="Note content"
      />
      <div
        className={noteStyles.resizeHandle}
        onPointerDown={handleResize}
        aria-label="Resize note"
        role="button"
        tabIndex={-1}
      />
    </div>
  )
}

export default Note
