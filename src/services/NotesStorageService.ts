import type { Note } from '@app-types/Note';
import { sanitizeNotes } from '@utils/noteValidation';

const STORAGE_KEY = 'sticky-notes-app-notes';

/**
 * Reads the persisted notes. The payload is validated before it reaches the
 * UI, so a corrupted or outdated entry can never break the board.
 */
export const loadNotes = (): Note[] => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return [];

        return sanitizeNotes(JSON.parse(saved));
    } catch (error) {
        console.error('Error loading notes from localStorage:', error);
        return [];
    }
};

export const saveNotes = (notes: Note[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
        console.error('Error saving notes to localStorage:', error);
    }
};
