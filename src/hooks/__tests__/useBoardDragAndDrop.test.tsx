import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useBoardDragAndDrop } from '@hooks/useBoardDragAndDrop';
import { NOTE_GRAB_OFFSET_DATA_KEY, NOTE_ID_DATA_KEY } from '@constants/drag';
import type { Note } from '@app-types/Note';
import type { BoardBounds } from '@app-types/BoardBounds';

const bounds: BoardBounds = { width: 1000, height: 800, top: 60 };

const note: Note = {
    id: 'note-1',
    title: 'Note 1',
    text: '',
    position: { x: 10, y: 20 },
    size: { width: 240, height: 160 },
    color: '#ffffff',
    zIndex: 100,
};

interface HarnessProps {
    notes: Note[];
    updateNote: (id: string, patch: unknown) => void;
    deleteNote: (id: string) => void;
}

const Harness = ({ notes, updateNote, deleteNote }: HarnessProps) => {
    const { handleBoardDragOver, handleBoardDrop, handleTrashDrop } = useBoardDragAndDrop({
        notes,
        updateNote,
        deleteNote,
        bounds,
    });

    return (
        <div data-testid="board" onDragOver={handleBoardDragOver} onDrop={handleBoardDrop}>
            <div data-testid="trash" onDrop={handleTrashDrop} />
        </div>
    );
};

const createDataTransfer = (noteId: string, grabOffset: { x: number; y: number }) => ({
    getData: (key: string): string => {
        if (key === NOTE_ID_DATA_KEY) return noteId;
        if (key === NOTE_GRAB_OFFSET_DATA_KEY) return JSON.stringify(grabOffset);
        return '';
    },
    setData: (): void => undefined,
    effectAllowed: 'move',
    dropEffect: 'move',
    types: [] as string[],
});

const fireDrop = (
    element: HTMLElement,
    { clientX, clientY, noteId = note.id, grabOffset = { x: 0, y: 0 } }: {
        clientX: number;
        clientY: number;
        noteId?: string;
        grabOffset?: { x: number; y: number };
    }
): void => {
    const event = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', { value: createDataTransfer(noteId, grabOffset) });
    Object.defineProperty(event, 'clientX', { value: clientX });
    Object.defineProperty(event, 'clientY', { value: clientY });

    fireEvent(element, event);
};

describe('useBoardDragAndDrop', () => {
    it('repositions the dropped note', () => {
        const updateNote = vi.fn();
        const deleteNote = vi.fn();
        render(<Harness notes={[note]} updateNote={updateNote} deleteNote={deleteNote} />);

        fireDrop(screen.getByTestId('board'), { clientX: 300, clientY: 200 });

        expect(updateNote).toHaveBeenCalledWith(note.id, { position: { x: 300, y: 200 } });
    });

    it('keeps the point the note was grabbed by', () => {
        const updateNote = vi.fn();
        const deleteNote = vi.fn();
        render(<Harness notes={[note]} updateNote={updateNote} deleteNote={deleteNote} />);

        fireDrop(screen.getByTestId('board'), {
            clientX: 300,
            clientY: 200,
            grabOffset: { x: 10, y: 20 },
        });

        expect(updateNote).toHaveBeenCalledWith(note.id, { position: { x: 290, y: 180 } });
    });

    it('clamps the dropped note to the board', () => {
        const updateNote = vi.fn();
        const deleteNote = vi.fn();
        render(<Harness notes={[note]} updateNote={updateNote} deleteNote={deleteNote} />);

        fireDrop(screen.getByTestId('board'), { clientX: 5000, clientY: 5000 });

        expect(updateNote).toHaveBeenCalledWith(note.id, { position: { x: 760, y: 640 } });
    });

    it('does nothing when the drop carries no note', () => {
        const updateNote = vi.fn();
        const deleteNote = vi.fn();
        render(<Harness notes={[note]} updateNote={updateNote} deleteNote={deleteNote} />);

        fireDrop(screen.getByTestId('board'), { clientX: 300, clientY: 200, noteId: '' });

        expect(updateNote).not.toHaveBeenCalled();
    });

    it('deletes the note dropped on the trash zone', () => {
        const updateNote = vi.fn();
        const deleteNote = vi.fn();
        render(<Harness notes={[note]} updateNote={updateNote} deleteNote={deleteNote} />);

        fireDrop(screen.getByTestId('trash'), { clientX: 300, clientY: 200 });

        expect(deleteNote).toHaveBeenCalledWith(note.id);
    });

    it('does not reposition a note that was dropped on the trash zone', () => {
        const updateNote = vi.fn();
        const deleteNote = vi.fn();
        render(<Harness notes={[note]} updateNote={updateNote} deleteNote={deleteNote} />);

        fireDrop(screen.getByTestId('trash'), { clientX: 300, clientY: 200 });

        expect(updateNote).not.toHaveBeenCalled();
    });
});
