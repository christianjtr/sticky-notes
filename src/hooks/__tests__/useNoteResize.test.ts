import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useNoteResize } from '@hooks/useNoteResize';
import type { Note } from '@app-types/Note';

const note: Note = {
    id: 'note-1',
    title: 'Note 1',
    text: '',
    position: { x: 10, y: 20 },
    size: { width: 240, height: 160 },
    color: '#ffffff',
    zIndex: 100,
};

/** jsdom has no PointerEvent, a mouse event is dispatched under that name. */
const pointerEvent = (type: string, clientX: number, clientY: number): MouseEvent =>
    new MouseEvent(type, { bubbles: true, clientX, clientY });

const pointerStartEvent = (clientX: number, clientY: number) =>
    ({
        clientX,
        clientY,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
    }) as unknown as React.PointerEvent;

describe('useNoteResize', () => {
    it('resizes the note while the pointer travels', () => {
        const updateNote = vi.fn();
        const { result } = renderHook(() => useNoteResize({ note, updateNote }));

        act(() => {
            result.current.handleResizeStart(pointerStartEvent(100, 100));
        });

        act(() => {
            window.dispatchEvent(pointerEvent('pointermove', 150, 130));
        });

        expect(updateNote).toHaveBeenCalledWith(note.id, {
            size: { width: 290, height: 190 },
        });
    });

    it('never shrinks the note below the minimum size', () => {
        const updateNote = vi.fn();
        const { result } = renderHook(() => useNoteResize({ note, updateNote }));

        act(() => {
            result.current.handleResizeStart(pointerStartEvent(300, 300));
        });

        act(() => {
            window.dispatchEvent(pointerEvent('pointermove', 0, 0));
        });

        expect(updateNote).toHaveBeenCalledWith(note.id, {
            size: { width: 100, height: 100 },
        });
    });

    it('stops resizing when the pointer is released', () => {
        const updateNote = vi.fn();
        const { result } = renderHook(() => useNoteResize({ note, updateNote }));

        act(() => {
            result.current.handleResizeStart(pointerStartEvent(100, 100));
        });
        act(() => {
            window.dispatchEvent(pointerEvent('pointerup', 100, 100));
        });
        act(() => {
            window.dispatchEvent(pointerEvent('pointermove', 200, 200));
        });

        expect(updateNote).not.toHaveBeenCalled();
    });

    it('removes its listeners when the note is unmounted', () => {
        const updateNote = vi.fn();
        const { result, unmount } = renderHook(() => useNoteResize({ note, updateNote }));

        act(() => {
            result.current.handleResizeStart(pointerStartEvent(100, 100));
        });
        unmount();
        act(() => {
            window.dispatchEvent(pointerEvent('pointermove', 200, 200));
        });

        expect(updateNote).not.toHaveBeenCalled();
    });
});
