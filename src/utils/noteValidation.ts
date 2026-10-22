import type { Note } from '@app-types/Note';
import type { Position } from '@app-types/Position';
import type { Size } from '@app-types/Size';

const FALLBACK_COLOR = 'hsl(45, 70%, 85%)';

const isFiniteNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

const isPosition = (value: unknown): value is Position =>
    typeof value === 'object' &&
    value !== null &&
    isFiniteNumber((value as Position).x) &&
    isFiniteNumber((value as Position).y);

const isSize = (value: unknown): value is Size =>
    typeof value === 'object' &&
    value !== null &&
    isFiniteNumber((value as Size).width) &&
    isFiniteNumber((value as Size).height);

/**
 * Validates a single value read back from storage. Anything that does not
 * describe a usable note is rejected instead of being forwarded to the UI,
 * which would otherwise crash the board on the first render.
 */
export const sanitizeNote = (value: unknown): Note | null => {
    if (typeof value !== 'object' || value === null) return null;

    const candidate = value as Partial<Note>;
    if (typeof candidate.id !== 'string' || candidate.id.length === 0) return null;
    if (!isPosition(candidate.position)) return null;
    if (!isSize(candidate.size)) return null;

    return {
        id: candidate.id,
        title: typeof candidate.title === 'string' ? candidate.title : 'Note',
        text: typeof candidate.text === 'string' ? candidate.text : '',
        position: { x: candidate.position.x, y: candidate.position.y },
        size: { width: candidate.size.width, height: candidate.size.height },
        color: typeof candidate.color === 'string' ? candidate.color : FALLBACK_COLOR,
        zIndex: isFiniteNumber(candidate.zIndex) ? candidate.zIndex : 1,
    };
};

/** Validates a whole payload read back from storage, dropping invalid entries. */
export const sanitizeNotes = (value: unknown): Note[] => {
    if (!Array.isArray(value)) return [];

    return value
        .map(sanitizeNote)
        .filter((note): note is Note => note !== null);
};
