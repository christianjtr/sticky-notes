import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBoard } from '@hooks/useBoard';
import type { BoardBounds } from '@app-types/BoardBounds';

const bounds: BoardBounds = { width: 1000, height: 800, top: 60 };
const STORAGE_KEY = 'sticky-notes-app-notes';

const readStorage = (): unknown[] => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');

describe('useBoard', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('starts empty when nothing was persisted', () => {
        const { result } = renderHook(() => useBoard({ bounds }));

        expect(result.current.notes).toHaveLength(0);
    });

    it('restores the persisted notes', () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify([
                {
                    id: 'note-1',
                    title: 'Note 1',
                    text: 'persisted',
                    position: { x: 10, y: 20 },
                    size: { width: 240, height: 160 },
                    color: '#fff',
                    zIndex: 100,
                },
            ])
        );

        const { result } = renderHook(() => useBoard({ bounds }));

        expect(result.current.notes).toHaveLength(1);
        expect(result.current.notes[0].text).toBe('persisted');
    });

    it('ignores a corrupted payload instead of crashing', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 'broken' }]));

        const { result } = renderHook(() => useBoard({ bounds }));

        expect(result.current.notes).toHaveLength(0);
    });

    it('gives every batched note a unique z-index', () => {
        const { result } = renderHook(() => useBoard({ bounds }));

        act(() => {
            result.current.addNote();
            result.current.addNote();
            result.current.addNote();
        });

        const zIndexes = result.current.notes.map((note) => note.zIndex);

        expect(result.current.notes).toHaveLength(3);
        expect(new Set(zIndexes).size).toBe(3);
    });

    it('gives every note a distinct title', () => {
        const { result } = renderHook(() => useBoard({ bounds }));

        act(() => {
            result.current.addNote();
            result.current.addNote();
        });

        const titles = result.current.notes.map((note) => note.title);

        expect(new Set(titles).size).toBe(2);
        expect(titles.every((title) => /^Note \d+$/.test(title))).toBe(true);
    });

    it('does not reuse the z-index of a deleted note', () => {
        const { result } = renderHook(() => useBoard({ bounds }));

        act(() => result.current.addNote());
        act(() => result.current.addNote());

        const firstId = result.current.notes[0].id;
        act(() => result.current.deleteNote(firstId));
        act(() => result.current.addNote());

        const zIndexes = result.current.notes.map((note) => note.zIndex);

        expect(new Set(zIndexes).size).toBe(result.current.notes.length);
    });

    it('patches a note without touching its other fields', () => {
        const { result } = renderHook(() => useBoard({ bounds }));

        act(() => result.current.addNote());
        const note = result.current.notes[0];

        act(() => result.current.updateNote(note.id, { text: 'hello' }));

        expect(result.current.notes[0].text).toBe('hello');
        expect(result.current.notes[0].position).toEqual(note.position);
        expect(result.current.notes[0].size).toEqual(note.size);
    });

    it('clamps a position to the board bounds', () => {
        const { result } = renderHook(() => useBoard({ bounds }));

        act(() => result.current.addNote());
        const note = result.current.notes[0];

        act(() => result.current.updateNote(note.id, { position: { x: -500, y: -500 } }));

        expect(result.current.notes[0].position).toEqual({ x: 0, y: 60 });
    });

    it('ignores a patch for a note that does not exist', () => {
        const { result } = renderHook(() => useBoard({ bounds }));

        act(() => result.current.updateNote('ghost', { text: 'hello' }));

        expect(result.current.notes).toHaveLength(0);
    });

    it('brings a note to the front', () => {
        const { result } = renderHook(() => useBoard({ bounds }));

        act(() => {
            result.current.addNote();
            result.current.addNote();
        });

        const bottom = result.current.notes[0];
        act(() => result.current.bringToFront(bottom.id));

        const highest = Math.max(...result.current.notes.map((note) => note.zIndex));
        expect(result.current.notes.find((note) => note.id === bottom.id)?.zIndex).toBe(highest);
    });

    it('leaves the z-index of a note that is already on top untouched', () => {
        const { result } = renderHook(() => useBoard({ bounds }));

        act(() => result.current.addNote());
        const note = result.current.notes[0];

        act(() => result.current.bringToFront(note.id));

        expect(result.current.notes[0].zIndex).toBe(note.zIndex);
    });

    it('persists the notes once the debounce elapsed', () => {
        const { result } = renderHook(() => useBoard({ bounds }));

        act(() => result.current.addNote());
        expect(readStorage()).toHaveLength(0);

        act(() => {
            vi.advanceTimersByTime(600);
        });

        expect(readStorage()).toHaveLength(1);
    });

    it('flushes pending changes when the page is unloaded', () => {
        const { result } = renderHook(() => useBoard({ bounds }));

        act(() => result.current.addNote());
        act(() => {
            window.dispatchEvent(new Event('pagehide'));
        });

        expect(readStorage()).toHaveLength(1);
    });

    it('flushes pending changes when the tab is hidden', () => {
        const visibility = vi
            .spyOn(document, 'visibilityState', 'get')
            .mockReturnValue('hidden' as DocumentVisibilityState);

        const { result } = renderHook(() => useBoard({ bounds }));

        act(() => result.current.addNote());
        act(() => {
            document.dispatchEvent(new Event('visibilitychange'));
        });

        expect(readStorage()).toHaveLength(1);

        visibility.mockRestore();
    });
});
