import type { Note } from '@app-types/Note';
import type { BoardBounds } from '@app-types/BoardBounds';
import { DEFAULT_NOTE_HEIGHT, DEFAULT_NOTE_WIDTH } from '@constants/note';
import { generateRandomPosition } from '@utils/noteBounds';

export const generateRandomColor = (): string =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 85%)`;

export const createDefaultNote = (
    bounds: BoardBounds
): Omit<Note, 'id' | 'title' | 'zIndex'> => {
    const size = { width: DEFAULT_NOTE_WIDTH, height: DEFAULT_NOTE_HEIGHT };

    return {
        position: generateRandomPosition(size, bounds),
        size,
        color: generateRandomColor(),
        text: '',
    };
};
