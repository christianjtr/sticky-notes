import React from 'react'
import type { Note as NoteType } from '@app-types/Note'
import { useBoard } from '@hooks/useBoard'
import Note from './Note'
import Toolbar from './Toolbar'
import TrashZone from './TrashZone'
import boardStyles from '@styles/board.module.css'

interface BoardProps {
  enableTrash?: boolean;
}

const Board: React.FC<BoardProps> = ({ enableTrash = true }): React.ReactElement => {
  const { notes, addNote, updateNote, deleteNote } = useBoard()

  return (
    <div className={boardStyles.board}>
      <Toolbar onAdd={addNote} />
      {notes.map(note => (
        <Note
          key={note.id}
          note={note}
          updateNote={(updates: Partial<NoteType>) => updateNote({ ...note, ...updates })}
          deleteNote={() => deleteNote(note.id)}
        />
      ))}
      {enableTrash && <TrashZone />}
    </div>
  )
}

export default Board
