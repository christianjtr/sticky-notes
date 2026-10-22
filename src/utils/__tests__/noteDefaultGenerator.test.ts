import { describe, expect, it } from 'vitest';
import { createDefaultNote, generateRandomColor, NOTE_COLORS } from '@utils/noteDefaultGenerator';
import type { BoardBounds } from '@app-types/BoardBounds';

const bounds: BoardBounds = { width: 1000, height: 800, top: 88 };

describe('generateRandomColor', () => {
    it('only picks from the curated palette of the pad', () => {
        for (let index = 0; index < 50; index += 1) {
            expect(NOTE_COLORS).toContain(generateRandomColor());
        }
    });
});

describe('createDefaultNote', () => {
    it('uses the default size', () => {
        const note = createDefaultNote(bounds);

        expect(note.size).toEqual({ width: 240, height: 160 });
    });

    it('starts empty', () => {
        expect(createDefaultNote(bounds).text).toBe('');
    });

    it('spawns inside the usable area of the board', () => {
        for (let index = 0; index < 50; index += 1) {
            const { position } = createDefaultNote(bounds);

            expect(position.x).toBeGreaterThanOrEqual(0);
            expect(position.x).toBeLessThanOrEqual(760);
            expect(position.y).toBeGreaterThanOrEqual(88);
            expect(position.y).toBeLessThanOrEqual(640);
        }
    });

    it('uses a colour of the pad', () => {
        expect(NOTE_COLORS).toContain(createDefaultNote(bounds).color);
    });
});
