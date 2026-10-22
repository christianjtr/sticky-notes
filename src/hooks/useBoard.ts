import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Note } from '@app-types/Note';
import type { BoardBounds } from '@app-types/BoardBounds';
import { loadNotes, saveNotes } from '@services/NotesStorageService';
import { createDefaultNote } from '@utils/noteDefaultGenerator';
import { clampPosition } from '@utils/noteBounds';
import { createId } from '@utils/createId';
import { BASE_Z_INDEX } from '@constants/board';

export type NotesMap = Map<string, Note>;

/** Fields of a note that can be changed without replacing the whole entity. */
export type NotePatch = Partial<Omit<Note, 'id'>>;

interface UseBoardParams {
    bounds: BoardBounds;
    /** Context the notes inherit when they are created. */
    defaultContextId?: string | null;
}

interface UseBoard {
    notes: Note[];
    addNote: () => void;
    updateNote: (id: string, patch: NotePatch) => void;
    deleteNote: (id: string) => void;
    bringToFront: (id: string) => void;
}

const SAVE_DEBOUNCE_MS = 500;

const highestZIndex = (notes: NotesMap): number => {
    let highest = 0;
    notes.forEach((note) => {
        if (note.zIndex > highest) highest = note.zIndex;
    });
    return highest;
};

const nextTitle = (notes: NotesMap): string => {
    let highest = 0;
    notes.forEach((note) => {
        const match = /^Note (\d+)$/.exec(note.title);
        if (match) highest = Math.max(highest, Number(match[1]));
    });
    return `Note ${highest + 1}`;
};

function useBoard({ bounds, defaultContextId }: UseBoardParams): UseBoard {
    const [notesMap, setNotesMap] = useState<NotesMap>(() => {
        const initialNotes = loadNotes();
        return new Map(initialNotes.map((note) => [note.id, note]));
    });

    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const notesRef = useRef<NotesMap>(notesMap);

    useEffect(() => {
        notesRef.current = notesMap;
    }, [notesMap]);

    const flushSave = useCallback(() => {
        if (saveTimeoutRef.current !== null) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
        saveNotes([...notesRef.current.values()]);
    }, []);

    // Persistence is debounced so that typing in a note does not write to
    // localStorage on every keystroke.
    useEffect(() => {
        if (saveTimeoutRef.current !== null) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveTimeoutRef.current = null;
            saveNotes([...notesMap.values()]);
        }, SAVE_DEBOUNCE_MS);

        return () => {
            if (saveTimeoutRef.current !== null) {
                clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
            }
        };
    }, [notesMap]);

    // The debounce above would drop the last edit when the tab is closed or
    // reloaded right after typing, so pending changes are flushed on unload.
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') flushSave();
        };

        window.addEventListener('pagehide', flushSave);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('pagehide', flushSave);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            flushSave();
        };
    }, [flushSave]);

    const addNote = useCallback(() => {
        const id = createId();
        const draft = createDefaultNote(bounds);

        setNotesMap((prev) => {
            const newNote: Note = {
                id,
                title: nextTitle(prev),
                zIndex: Math.max(highestZIndex(prev) + 1, BASE_Z_INDEX),
                contextId: defaultContextId ?? undefined,
                ...draft,
            };

            return new Map(prev).set(id, newNote);
        });
    }, [bounds, defaultContextId]);

    const updateNote = useCallback((id: string, patch: NotePatch): void => {
        setNotesMap((prev) => {
            const current = prev.get(id);
            if (!current) return prev;

            const next: Note = { ...current, ...patch };
            next.position = clampPosition(next.position, next.size, bounds);

            return new Map(prev).set(id, next);
        });
    }, [bounds]);

    const deleteNote = useCallback((id: string): void => {
        setNotesMap((prev) => {
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const bringToFront = useCallback((id: string): void => {
        setNotesMap((prev) => {
            const current = prev.get(id);
            if (!current) return prev;

            const highest = highestZIndex(prev);
            if (current.zIndex >= highest) return prev;

            return new Map(prev).set(id, { ...current, zIndex: highest + 1 });
        });
    }, []);

    const notes = useMemo(
        () => [...notesMap.values()].sort((a, b) => a.zIndex - b.zIndex),
        [notesMap]
    );

    return {
        notes,
        addNote,
        updateNote,
        deleteNote,
        bringToFront,
    };
}

export { useBoard };
