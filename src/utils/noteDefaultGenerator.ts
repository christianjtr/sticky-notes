import type { Note } from '@app-types/Note';
import type { BoardBounds } from '@app-types/BoardBounds';
import { DEFAULT_NOTE_HEIGHT, DEFAULT_NOTE_WIDTH } from '@constants/note';
import { generateRandomPosition } from '@utils/noteBounds';

/**
 * The colours of a real pad of sticky notes. They are saturated enough to
 * read as paper, and light enough to keep a dark text perfectly readable.
 */
export const NOTE_COLORS: readonly string[] = [
    '#FFF48C',
    '#FFA8B5',
    '#B7E4A0',
    '#A8D8F0',
    '#FFBE7D',
    '#D4B8E8',
    '#FFD1C1',
    '#E5E2DC',
];

export const generateRandomColor = (): string =>
    NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];

export const createDefaultNote = (
    bounds: BoardBounds
): Omit<Note, 'id' | 'title' | 'zIndex' | 'contextId'> => {
    const size = { width: DEFAULT_NOTE_WIDTH, height: DEFAULT_NOTE_HEIGHT };

    return {
        position: generateRandomPosition(size, bounds),
        size,
        color: generateRandomColor(),
        text: '',
    };
};
