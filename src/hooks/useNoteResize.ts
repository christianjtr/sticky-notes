import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import type { Note } from '@app-types/Note';
import type { NotePatch } from '@hooks/useBoard';
import {
    KEYBOARD_MOVE_STEP,
    KEYBOARD_MOVE_STEP_LARGE,
    MIN_NOTE_HEIGHT,
    MIN_NOTE_WIDTH,
} from '@constants/note';

interface UseNoteResizeParams {
    note: Note;
    updateNote: (id: string, patch: NotePatch) => void;
}

interface UseNoteResize {
    isResizing: boolean;
    handleResizeStart: (event: React.PointerEvent) => void;
    handleResizeKeyDown: (event: React.KeyboardEvent) => void;
}

interface ResizeOrigin {
    pointerX: number;
    pointerY: number;
    width: number;
    height: number;
}

/**
 * Resizing of a note, driven either by the pointer or by the keyboard.
 *
 * The size is always derived from the position the resize started at, so the
 * note never drifts while the pointer travels.
 */
export const useNoteResize = ({ note, updateNote }: UseNoteResizeParams): UseNoteResize => {
    const [isResizing, setIsResizing] = useState(false);
    const originRef = useRef<ResizeOrigin | null>(null);

    useEffect(() => {
        if (!isResizing) return;

        const handlePointerMove = (event: PointerEvent): void => {
            const origin = originRef.current;
            if (!origin) return;

            updateNote(note.id, {
                size: {
                    width: Math.max(MIN_NOTE_WIDTH, origin.width + (event.clientX - origin.pointerX)),
                    height: Math.max(MIN_NOTE_HEIGHT, origin.height + (event.clientY - origin.pointerY)),
                },
            });
        };

        const stopResizing = (): void => {
            originRef.current = null;
            setIsResizing(false);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', stopResizing);
        window.addEventListener('pointercancel', stopResizing);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', stopResizing);
            window.removeEventListener('pointercancel', stopResizing);
        };
    }, [isResizing, note.id, updateNote]);

    const handleResizeStart = useCallback((event: React.PointerEvent): void => {
        event.preventDefault();
        event.stopPropagation();

        originRef.current = {
            pointerX: event.clientX,
            pointerY: event.clientY,
            width: note.size.width,
            height: note.size.height,
        };

        setIsResizing(true);
    }, [note.size]);

    const handleResizeKeyDown = useCallback((event: React.KeyboardEvent): void => {
        const step = event.shiftKey ? KEYBOARD_MOVE_STEP_LARGE : KEYBOARD_MOVE_STEP;

        let deltaWidth = 0;
        let deltaHeight = 0;

        switch (event.key) {
            case 'ArrowRight':
                deltaWidth = step;
                break;
            case 'ArrowLeft':
                deltaWidth = -step;
                break;
            case 'ArrowDown':
                deltaHeight = step;
                break;
            case 'ArrowUp':
                deltaHeight = -step;
                break;
            default:
                return;
        }

        // The resize handle lives inside the note, so the key press must not
        // reach the note level shortcut that moves the note around.
        event.preventDefault();
        event.stopPropagation();

        updateNote(note.id, {
            size: {
                width: Math.max(MIN_NOTE_WIDTH, note.size.width + deltaWidth),
                height: Math.max(MIN_NOTE_HEIGHT, note.size.height + deltaHeight),
            },
        });
    }, [note.id, note.size, updateNote]);

    return {
        isResizing,
        handleResizeStart,
        handleResizeKeyDown,
    };
};
