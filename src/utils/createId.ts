/**
 * Creates a unique id for a note.
 *
 * `crypto.randomUUID` is only available in secure contexts, so a fallback is
 * used to keep the app working when it is served over plain http.
 */
export const createId = (): string => {
    const cryptoApi = globalThis.crypto;

    if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
        return cryptoApi.randomUUID();
    }

    return `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};
