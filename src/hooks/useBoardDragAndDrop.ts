import React, { useCallback } from 'react'
import type { Note } from '@app-types/Note'

interface UseBoardDragAndDropParams {
    notes: Note[];
    updateNote: (note: Note) => void;
    deleteNote: (id: string) => void;
    onDragEnd?: () => void;
}

interface UseBoardDragAndDrop {
    handleBoardDragOver: (event: React.DragEvent) => void;
    handleBoardDrop: (event: React.DragEvent) => void;
    handleTrashDrop: (event: React.DragEvent) => void;
}

export const useBoardDragAndDrop = ({ notes, updateNote, deleteNote, onDragEnd }: UseBoardDragAndDropParams): UseBoardDragAndDrop => {

    const getNoteId = (event: React.DragEvent): string => {
        return event.dataTransfer.getData('noteId')
    }

    const handleBoardDragOver = useCallback((event: React.DragEvent): void => {
        event.preventDefault()
    }, [])

    const handleBoardDrop = useCallback((event: React.DragEvent): void => {
        event.preventDefault()

        const noteId = getNoteId(event)
        const note = notes.find(n => n.id === noteId)

        if (note) {
            const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top

            updateNote({ ...note, position: { x, y } })
        }

        onDragEnd?.()
    }, [notes, updateNote, onDragEnd])

    const handleTrashDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault()

        const noteId = getNoteId(event)

        if (noteId) {
            deleteNote(noteId)
        }

        onDragEnd?.()
    }, [deleteNote, onDragEnd])

    return {
        handleBoardDragOver,
        handleBoardDrop,
        handleTrashDrop,
    }
}
