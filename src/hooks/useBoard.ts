import { useState, useEffect, useRef, useCallback } from 'react'
import type { Note } from '@app-types/Note'
import { loadNotes, saveNotes } from '@services/NotesStorageService'
import { createDefaultNote } from '@utils/noteDefaultGenerator'

type NotesMap = Map<string, Note>;

interface UseBoard {
    notes: Note[];
    addNote: () => void;
    updateNote: (payload: Note) => void;
    deleteNote: (id: string) => void;
}

const SAVE_DEBOUNCE_MS = 500

function useBoard(): UseBoard {
    const [notesMap, setNotesMap] = useState<NotesMap>(() => {
        const initialNotes = loadNotes()
        return new Map(initialNotes.map(note => [note.id, note]))
    })

    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(() => {
            const notesToSave = [...notesMap.values()]
            saveNotes(notesToSave)
        }, SAVE_DEBOUNCE_MS)

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [notesMap])

    const addNote = useCallback(() => {
        const id = crypto.randomUUID();

        const newNote: Note = {
            id,
            zIndex: notesMap.size + 1,
            ...createDefaultNote(),
        }

        setNotesMap(prev => new Map(prev).set(id, newNote))
    }, [notesMap.size])

    const updateNote = useCallback((payload: Note): void => {
        setNotesMap(prev => {
            if (!prev.has(payload.id)) {
                return prev
            }

            return new Map(prev).set(payload.id, payload)
        })
    }, [])

    const deleteNote = useCallback((id: string): void => {
        setNotesMap(prev => {
            const notesMap = new Map(prev)
            notesMap.delete(id)

            return notesMap
        })
    }, [])

    const notesToBeRendered = [...notesMap.values()].sort((a, b) => b.zIndex - a.zIndex)

    return {
        notes: notesToBeRendered,
        addNote,
        updateNote,
        deleteNote
    }
}

export { useBoard }
