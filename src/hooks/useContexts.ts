import { useCallback, useEffect, useRef, useState } from 'react';
import type { Context } from '@app-types/Context';
import {
    loadActiveContextId,
    loadContexts,
    saveActiveContextId,
    saveContexts,
} from '@services/ContextsStorageService';
import { nextContextColor } from '@utils/contextValidation';
import { createId } from '@utils/createId';
import { CONTEXT_NAME_MAX_LENGTH } from '@constants/context';

const SAVE_DEBOUNCE_MS = 500;

interface UseContexts {
    contexts: Context[];
    activeContextId: string | null;
    setActiveContextId: (id: string | null) => void;
    toggleContext: (id: string) => void;
    createContext: (name: string) => string | null;
    deleteContext: (id: string) => void;
}

function useContexts(): UseContexts {
    const [contexts, setContexts] = useState<Context[]>(() => loadContexts());
    const [selectedContextId, setSelectedContextIdState] = useState<string | null>(
        () => loadActiveContextId()
    );

    const contextsRef = useRef(contexts);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        contextsRef.current = contexts;
    }, [contexts]);

    const flushSave = useCallback(() => {
        if (saveTimeoutRef.current !== null) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
        saveContexts([...contextsRef.current]);
    }, []);

    useEffect(() => {
        if (saveTimeoutRef.current !== null) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveTimeoutRef.current = null;
            saveContexts([...contexts]);
        }, SAVE_DEBOUNCE_MS);

        return () => {
            if (saveTimeoutRef.current !== null) {
                clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
            }
        };
    }, [contexts]);

    // The debounce above would drop the last change when the tab is closed
    // right after it, so pending changes are flushed on unload.
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

    // A context that no longer exists must not hide the whole board.
    const activeContextId = contexts.some(
        (context) => context.id === selectedContextId
    )
        ? selectedContextId
        : null;

    const setActiveContextId = useCallback((id: string | null): void => {
        setSelectedContextIdState(id);
        saveActiveContextId(id);
    }, []);

    const toggleContext = useCallback((id: string): void => {
        const next = activeContextId === id ? null : id;
        setSelectedContextIdState(next);
        saveActiveContextId(next);
    }, [activeContextId]);

    const createContext = useCallback((name: string): string | null => {
        const trimmed = name.trim().slice(0, CONTEXT_NAME_MAX_LENGTH);
        if (!trimmed) return null;

        const id = createId();

        setContexts((prev) => [
            ...prev,
            { id, name: trimmed, color: nextContextColor(prev.length) },
        ]);

        return id;
    }, []);

    const deleteContext = useCallback((id: string): void => {
        setContexts((prev) => prev.filter((context) => context.id !== id));

        if (activeContextId === id) {
            setSelectedContextIdState(null);
            saveActiveContextId(null);
        }
    }, [activeContextId]);

    return {
        contexts,
        activeContextId,
        setActiveContextId,
        toggleContext,
        createContext,
        deleteContext,
    };
}

export { useContexts };
