import type { Note } from '@app-types/Note'

const STORAGE_KEY = 'sticky-notes-app-notes'

export const loadNotes = (): Note[] => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) return []
        return JSON.parse(saved)
    } catch (error) {
        console.error('Error loading notes from localStorage:', error)
        return []
    }
}

export const saveNotes = (notes: Note[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    } catch (error) {
        console.error('Error saving notes to localStorage:', error)
    }
}

export const clearNotes = (): void => {
    localStorage.removeItem(STORAGE_KEY)
}
