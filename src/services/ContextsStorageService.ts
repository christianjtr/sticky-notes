import type { Context } from '@app-types/Context';
import { sanitizeContexts } from '@utils/contextValidation';

const CONTEXTS_KEY = 'sticky-notes-app-contexts';
const ACTIVE_CONTEXT_KEY = 'sticky-notes-app-active-context';

/**
 * Reads the persisted contexts. The payload is validated before it reaches the
 * UI, so a corrupted entry can never break the board.
 */
export const loadContexts = (): Context[] => {
    try {
        const saved = localStorage.getItem(CONTEXTS_KEY);
        if (!saved) return [];

        return sanitizeContexts(JSON.parse(saved));
    } catch (error) {
        console.error('Error loading contexts from localStorage:', error);
        return [];
    }
};

export const saveContexts = (contexts: Context[]): void => {
    try {
        localStorage.setItem(CONTEXTS_KEY, JSON.stringify(contexts));
    } catch (error) {
        console.error('Error saving contexts to localStorage:', error);
    }
};

/** Reads the context the board was filtered by when it was last used. */
export const loadActiveContextId = (): string | null => {
    try {
        return localStorage.getItem(ACTIVE_CONTEXT_KEY);
    } catch (error) {
        console.error('Error loading the active context from localStorage:', error);
        return null;
    }
};

export const saveActiveContextId = (id: string | null): void => {
    try {
        if (id === null) {
            localStorage.removeItem(ACTIVE_CONTEXT_KEY);
            return;
        }

        localStorage.setItem(ACTIVE_CONTEXT_KEY, id);
    } catch (error) {
        console.error('Error saving the active context to localStorage:', error);
    }
};
