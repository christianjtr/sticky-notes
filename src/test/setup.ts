import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'>;

const isUsable = (candidate: unknown): candidate is StorageLike =>
    typeof candidate === 'object' &&
    candidate !== null &&
    typeof (candidate as StorageLike).getItem === 'function' &&
    typeof (candidate as StorageLike).setItem === 'function' &&
    typeof (candidate as StorageLike).removeItem === 'function' &&
    typeof (candidate as StorageLike).clear === 'function';

const createMemoryStorage = (): StorageLike => {
    const entries = new Map<string, string>();

    return {
        getItem: (key: string) => entries.get(key) ?? null,
        setItem: (key: string, value: string) => {
            entries.set(key, String(value));
        },
        removeItem: (key: string) => {
            entries.delete(key);
        },
        clear: () => {
            entries.clear();
        },
    };
};

/**
 * Recent Node versions expose an experimental `localStorage` global that
 * shadows the DOM implementation and is not backed by a file. The tests need a
 * working storage, so the DOM implementation is restored when needed.
 */
const installUsableLocalStorage = (): void => {
    if (isUsable(globalThis.localStorage)) return;

    const domStorage = (window as unknown as { _localStorage?: unknown })._localStorage;

    Object.defineProperty(globalThis, 'localStorage', {
        value: isUsable(domStorage) ? domStorage : createMemoryStorage(),
        configurable: true,
        writable: true,
    });
};

installUsableLocalStorage();

// Vitest runs without globals, so the automatic cleanup of the testing library
// has to be registered explicitly.
afterEach(() => {
    cleanup();
});
