import React, { useState, useCallback } from 'react'
import { useBoard } from '@hooks/useBoard'
import { useBoardDragAndDrop } from '@hooks/useBoardDragAndDrop'
import Note from './Note'
import Toolbar from './Toolbar'
import TrashZone from './TrashZone'
import boardStyles from '@styles/board.module.css'

interface BoardProps {
  enableTrash?: boolean;
}

const Board: React.FC<BoardProps> = ({ enableTrash = true }): React.ReactElement => {
  const { notes, addNote, updateNote, deleteNote } = useBoard()
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = useCallback(() => setIsDragging(true), [])
  const handleDragEnd = useCallback(() => setIsDragging(false), [])

  const { handleBoardDragOver, handleBoardDrop, handleTrashDrop } = useBoardDragAndDrop({
    notes,
    updateNote,
    deleteNote,
    onDragEnd: handleDragEnd,
  })

  return (
    <div
      id="sticky-notes-board"
      role="main"
      aria-label="Sticky notes workspace"
      className={boardStyles.board}
      onDragOver={handleBoardDragOver}
      onDrop={handleBoardDrop}
    >
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="board-announcements"></div>
      <Toolbar onAdd={addNote} />
      {notes.map(note => (
        <Note
          key={note.id}
          note={note}
          updateNote={updateNote}
          onDelete={deleteNote}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      ))}
      {enableTrash && <TrashZone onDrop={handleTrashDrop} isDragging={isDragging} />}
    </div>
  )
}

export default Board
