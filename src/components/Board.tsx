import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { useBoard } from '@hooks/useBoard';
import { useBoardDragAndDrop } from '@hooks/useBoardDragAndDrop';
import { useBoardBounds } from '@hooks/useBoardBounds';
import { useContexts } from '@hooks/useContexts';
import ContextFilter from './ContextFilter';
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

  const {
    contexts,
    activeContextId,
    toggleContext,
    createContext,
    deleteContext,
  } = useContexts();

  const { notes, addNote, updateNote, deleteNote, bringToFront } = useBoard({
    bounds,
    defaultContextId: activeContextId,
  });

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

  const announce = useCallback((text: string) => {
    setAnnouncement((prev) => ({ text, sequence: prev.sequence + 1 }));
  }, []);

  const visibleNotes = useMemo(
    () =>
      activeContextId
        ? notes.filter((note) => note.contextId === activeContextId)
        : notes,
    [notes, activeContextId]
  );

  const contextColors = useMemo(() => {
    const colors = new Map<string, string>();
    contexts.forEach((context) => colors.set(context.id, context.color));
    return colors;
  }, [contexts]);

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

  const handleToggleContext = useCallback(
    (id: string) => {
      const next = activeContextId === id ? null : id;

      toggleContext(id);

      const context = contexts.find((candidate) => candidate.id === next);
      announce(
        context
          ? `Showing the notes of ${context.name}.`
          : 'Showing all the notes on the board.'
      );
    },
    [activeContextId, toggleContext, contexts, announce]
  );

  const handleCreateContext = useCallback(
    (name: string) => {
      const id = createContext(name);
      if (!id) return;

      // The board keeps showing every note: the new context starts empty and
      // the notes are filed in it by dragging them onto its tag.
      announce(`Context ${name} created.`);
    },
    [createContext, announce]
  );

  const handleAssignContext = useCallback(
    (noteId: string, contextId: string) => {
      const context = contexts.find((candidate) => candidate.id === contextId);

      updateNote(noteId, { contextId });
      announce(`Note filed in ${context ? context.name : 'the context'}.`);
    },
    [contexts, updateNote, announce]
  );

  const handleDeleteContext = useCallback(
    (contextId: string) => {
      const context = contexts.find((candidate) => candidate.id === contextId);

      notes.forEach((note) => {
        if (note.contextId === contextId) updateNote(note.id, { contextId: undefined });
      });

      deleteContext(contextId);
      announce(
        context
          ? `Context ${context.name} deleted. Showing all the notes on the board.`
          : 'Context deleted. Showing all the notes on the board.'
      );
    },
    [notes, contexts, updateNote, deleteContext, announce]
  );

  const activeContext = contexts.find(
    (context) => context.id === activeContextId
  ) ?? null;

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
        <ContextFilter
          contexts={contexts}
          activeContextId={activeContextId}
          onToggle={handleToggleContext}
          onCreate={handleCreateContext}
          onAssign={handleAssignContext}
          onDelete={handleDeleteContext}
        />
      </div>

      {activeContext && visibleNotes.length === 0 && (
        <p className={boardStyles.emptyState}>
          No notes in {activeContext.name} yet. Drag a note onto its tag to file it there.
        </p>
      )}

      {visibleNotes.map(note => (
        <Note
          key={note.id}
          note={note}
          updateNote={updateNote}
          onDelete={deleteNote}
          onBringToFront={bringToFront}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          contextColor={note.contextId ? contextColors.get(note.contextId) : undefined}
        />
      ))}

      {enableTrash && <TrashZone onDrop={handleTrashDrop} isDragging={isDragging} />}
    </div>
  );
};

export default Board;
