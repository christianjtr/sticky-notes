import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useContexts } from '@hooks/useContexts';
import { CONTEXT_COLORS } from '@constants/context';

const CONTEXTS_KEY = 'sticky-notes-app-contexts';
const ACTIVE_KEY = 'sticky-notes-app-active-context';

const readContexts = (): unknown => JSON.parse(localStorage.getItem(CONTEXTS_KEY) ?? '[]');

describe('useContexts', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('starts empty when nothing was persisted', () => {
        const { result } = renderHook(() => useContexts());

        expect(result.current.contexts).toHaveLength(0);
        expect(result.current.activeContextId).toBeNull();
    });

    it('restores the persisted contexts and the active one', () => {
        localStorage.setItem(
            CONTEXTS_KEY,
            JSON.stringify([{ id: 'context-1', name: 'Work', color: '#3182ed' }])
        );
        localStorage.setItem(ACTIVE_KEY, 'context-1');

        const { result } = renderHook(() => useContexts());

        expect(result.current.contexts).toHaveLength(1);
        expect(result.current.contexts[0].name).toBe('Work');
        expect(result.current.activeContextId).toBe('context-1');
    });

    it('ignores a corrupted payload', () => {
        localStorage.setItem(CONTEXTS_KEY, JSON.stringify([{ id: 'broken' }]));

        const { result } = renderHook(() => useContexts());

        expect(result.current.contexts).toHaveLength(0);
    });

    it('creates a context with the next colour of the curated list', () => {
        const { result } = renderHook(() => useContexts());

        act(() => {
            result.current.createContext('Work');
        });

        expect(result.current.contexts).toHaveLength(1);
        expect(result.current.contexts[0].name).toBe('Work');
        expect(result.current.contexts[0].color).toBe(CONTEXT_COLORS[0]);
    });

    it('refuses a context without a name', () => {
        const { result } = renderHook(() => useContexts());

        let created: string | null = null;
        act(() => {
            created = result.current.createContext('   ');
        });

        expect(created).toBeNull();
        expect(result.current.contexts).toHaveLength(0);
    });

    it('trims the name of a context', () => {
        const { result } = renderHook(() => useContexts());

        act(() => {
            result.current.createContext('  Home  ');
        });

        expect(result.current.contexts[0].name).toBe('Home');
    });

    it('toggles the active context', () => {
        const { result } = renderHook(() => useContexts());

        act(() => {
            result.current.createContext('Work');
        });

        const id = result.current.contexts[0].id;

        act(() => {
            result.current.toggleContext(id);
        });
        expect(result.current.activeContextId).toBe(id);

        act(() => {
            result.current.toggleContext(id);
        });
        expect(result.current.activeContextId).toBeNull();
    });

    it('deletes a context and clears it when it was active', () => {
        const { result } = renderHook(() => useContexts());

        act(() => {
            result.current.createContext('Work');
        });

        const id = result.current.contexts[0].id;

        act(() => {
            result.current.toggleContext(id);
        });
        act(() => {
            result.current.deleteContext(id);
        });

        expect(result.current.contexts).toHaveLength(0);
        expect(result.current.activeContextId).toBeNull();
    });

    it('ignores an active context that no longer exists', () => {
        localStorage.setItem(ACTIVE_KEY, 'context-gone');

        const { result } = renderHook(() => useContexts());

        expect(result.current.activeContextId).toBeNull();
    });

    it('persists the contexts once the debounce elapsed', () => {
        const { result } = renderHook(() => useContexts());

        act(() => {
            result.current.createContext('Work');
        });
        expect(readContexts()).toHaveLength(0);

        act(() => {
            vi.advanceTimersByTime(600);
        });

        expect(readContexts()).toHaveLength(1);
    });

    it('flushes the pending contexts when the page is unloaded', () => {
        const { result } = renderHook(() => useContexts());

        act(() => {
            result.current.createContext('Work');
        });
        act(() => {
            window.dispatchEvent(new Event('pagehide'));
        });

        expect(readContexts()).toHaveLength(1);
    });

    it('persists the active context right away', () => {
        const { result } = renderHook(() => useContexts());

        act(() => {
            result.current.createContext('Work');
        });

        const id = result.current.contexts[0].id;

        act(() => {
            result.current.toggleContext(id);
        });

        expect(localStorage.getItem(ACTIVE_KEY)).toBe(id);
    });
});
