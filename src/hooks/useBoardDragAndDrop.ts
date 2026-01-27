import React from 'react'
import type { Note } from '@app-types/Note'

interface UseBoardDragAndDropParams {
    notes: Note[];
    updateNote: (note: Note) => void;
    deleteNote: (id: string) => void;
}

interface UseBoardDragAndDrop {
    handleBoardDragOver: (event: React.DragEvent) => void;
    handleBoardDrop: (event: React.DragEvent) => void;
    handleTrashDrop: (event: React.DragEvent) => void;
}

export const useBoardDragAndDrop = ({ notes, updateNote, deleteNote }: UseBoardDragAndDropParams): UseBoardDragAndDrop => {

    const getNoteId = (event: React.DragEvent): string => {
        return event.dataTransfer.getData('noteId')
    }

    const handleBoardDragOver = (event: React.DragEvent): void => {
        event.preventDefault()
    }

    const handleBoardDrop = (event: React.DragEvent): void => {
        event.preventDefault()

        const noteId = getNoteId(event)
        const note = notes.find(n => n.id === noteId)

        if (note) {
            const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top

            updateNote({ ...note, position: { x, y } })
        }
    }

    const handleTrashDrop = (event: React.DragEvent) => {
        event.preventDefault()

        const noteId = getNoteId(event)

        if (noteId) {
            deleteNote(noteId)
        }
    }

    return {
        handleBoardDragOver,
        handleBoardDrop,
        handleTrashDrop,
    }
}
