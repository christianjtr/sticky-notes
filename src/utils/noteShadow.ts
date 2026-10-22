/**
 * Deterministic hash of a string, with an avalanche step at the end so that
 * ids that only differ in their last character still get a different value.
 */
const hashString = (value: string): number => {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    hash ^= hash >>> 15;
    hash = Math.imul(hash, 2246822507);
    hash ^= hash >>> 13;

    return hash >>> 0;
};

/** The value between 0 and 1 that seeds the shadow of a note. */
export const getNoteLift = (noteId: string): number =>
    (hashString(noteId) % 1000) / 1000;

/**
 * The shadow of a note: a tight contact shadow plus a soft ambient one. Both
 * are seeded with the id of the note, which gives the board the look of notes
 * that were placed by hand without moving a single pixel.
 */
export const getNoteShadow = (noteId: string): string => {
    const lift = getNoteLift(noteId);

    const offset = (5 + lift * 5).toFixed(1);
    const blur = (14 + lift * 8).toFixed(1);
    const spread = (4 + lift * 3).toFixed(1);
    const alpha = (0.24 + lift * 0.1).toFixed(3);

    return (
        `0 1px 1px rgba(58, 46, 36, 0.18), ` +
        `0 ${offset}px ${blur}px -${spread}px rgba(58, 46, 36, ${alpha})`
    );
};
