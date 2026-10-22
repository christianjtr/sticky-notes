import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { useBoard } from '@hooks/useBoard';
import { useBoardDragAndDrop } from '@hooks/useBoardDragAndDrop';
import { useBoardBounds } from '@hooks/useBoardBounds';
import Note from './Note';
import Toolbar from './Toolbar';
import TrashZone from './TrashZone';
import boardStyles from '@styles/board.module.css';

interface BoardProps {
  enableTrash?: boolean;
}

interface Announcement {
  text: string;
  sequence: number;
}

const Board: React.FC<BoardProps> = ({ enableTrash = true }): React.ReactElement => {
  const boardRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);

  const bounds = useBoardBounds(boardRef, chromeRef);

  const { notes, addNote, updateNote, deleteNote, bringToFront } = useBoard({ bounds });

  const [isDragging, setIsDragging] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement>({ text: '', sequence: 0 });

  const handleDragStart = useCallback(() => setIsDragging(true), []);
  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  const { handleBoardDragOver, handleBoardDrop, handleTrashDrop } = useBoardDragAndDrop({
    notes,
    updateNote,
    deleteNote,
    bounds,
    onDragEnd: handleDragEnd,
  });

  const previousCountRef = useRef(notes.length);

  useEffect(() => {
    if (notes.length === previousCountRef.current) return;

    const added = notes.length > previousCountRef.current;
    previousCountRef.current = notes.length;

    setAnnouncement((prev) => ({
      text: `${added ? 'Note added' : 'Note deleted'}. ${notes.length} ${
        notes.length === 1 ? 'note' : 'notes'
      } on the board.`,
      sequence: prev.sequence + 1,
    }));
  }, [notes.length]);

  return (
    <div
      id="sticky-notes-board"
      ref={boardRef}
      role="main"
      aria-label="Sticky notes workspace"
      className={boardStyles.board}
      onDragOver={handleBoardDragOver}
      onDrop={handleBoardDrop}
    >
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="board-announcements"
      >
        {announcement.text}
        {announcement.sequence % 2 === 1 ? '\u200B' : ''}
      </div>

      <div className={boardStyles.chrome} ref={chromeRef}>
        <Toolbar onAdd={addNote} />
      </div>

      {notes.map(note => (
        <Note
          key={note.id}
          note={note}
          updateNote={updateNote}
          onDelete={deleteNote}
          onBringToFront={bringToFront}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      ))}

      {enableTrash && <TrashZone onDrop={handleTrashDrop} isDragging={isDragging} />}
    </div>
  );
};

export default Board;
