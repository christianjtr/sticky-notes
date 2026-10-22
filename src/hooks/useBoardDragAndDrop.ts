import { useCallback } from 'react';
import type React from 'react';
import type { Note } from '@app-types/Note';
import type { BoardBounds } from '@app-types/BoardBounds';
import type { NotePatch } from '@hooks/useBoard';
import { NOTE_GRAB_OFFSET_DATA_KEY, NOTE_ID_DATA_KEY } from '@constants/drag';
import { computeDropPosition, parseGrabOffset } from '@utils/noteBounds';

interface UseBoardDragAndDropParams {
    notes: Note[];
    updateNote: (id: string, patch: NotePatch) => void;
    deleteNote: (id: string) => void;
    bounds: BoardBounds;
    onDragEnd?: () => void;
}

interface UseBoardDragAndDrop {
    handleBoardDragOver: (event: React.DragEvent) => void;
    handleBoardDrop: (event: React.DragEvent) => void;
    handleTrashDrop: (event: React.DragEvent) => void;
}

export const useBoardDragAndDrop = ({
    notes,
    updateNote,
    deleteNote,
    bounds,
    onDragEnd,
}: UseBoardDragAndDropParams): UseBoardDragAndDrop => {
    const handleBoardDragOver = useCallback((event: React.DragEvent): void => {
        event.preventDefault();
    }, []);

    const handleBoardDrop = useCallback((event: React.DragEvent): void => {
        event.preventDefault();

        const noteId = event.dataTransfer.getData(NOTE_ID_DATA_KEY);
        const note = notes.find((candidate) => candidate.id === noteId);

        if (note) {
            const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
            const grabOffset = parseGrabOffset(
                event.dataTransfer.getData(NOTE_GRAB_OFFSET_DATA_KEY)
            );

            const position = computeDropPosition({
                clientX: event.clientX,
                clientY: event.clientY,
                boardRect: { left: rect.left, top: rect.top },
                grabOffset,
                size: note.size,
                bounds,
            });

            updateNote(note.id, { position });
        }

        onDragEnd?.();
    }, [notes, updateNote, bounds, onDragEnd]);

    const handleTrashDrop = useCallback((event: React.DragEvent): void => {
        // The trash zone lives inside the board, so the event must not reach
        // the board drop handler that repositions the dropped note.
        event.preventDefault();
        event.stopPropagation();

        const noteId = event.dataTransfer.getData(NOTE_ID_DATA_KEY);

        if (noteId) {
            deleteNote(noteId);
        }

        onDragEnd?.();
    }, [deleteNote, onDragEnd]);

    return {
        handleBoardDragOver,
        handleBoardDrop,
        handleTrashDrop,
    };
};
