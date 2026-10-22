import { describe, expect, it } from 'vitest';
import { getNoteLift, getNoteShadow } from '@utils/noteShadow';

describe('getNoteLift', () => {
    it('is always between zero and one', () => {
        for (const id of ['a', 'note-1', '4a880261-813e-47cb-b0b3-0a37029f4c98', '']) {
            const lift = getNoteLift(id);

            expect(lift).toBeGreaterThanOrEqual(0);
            expect(lift).toBeLessThan(1);
        }
    });

    it('is stable for the same id', () => {
        expect(getNoteLift('note-1')).toBe(getNoteLift('note-1'));
    });

    it('does not give every note the same value', () => {
        const lifts = new Set(
            Array.from({ length: 40 }, (_, index) => getNoteLift(`note-${index}`))
        );

        expect(lifts.size).toBeGreaterThan(20);
    });
});

describe('getNoteShadow', () => {
    it('is stable for the same note', () => {
        expect(getNoteShadow('note-1')).toBe(getNoteShadow('note-1'));
    });

    it('builds a contact shadow and an ambient one', () => {
        const shadow = getNoteShadow('note-1');

        expect(shadow).toContain('0 1px 1px rgba(15, 23, 31, 0.12)');
        expect(shadow.match(/rgba/g)).toHaveLength(2);
    });

    it('gives different notes a different shadow', () => {
        const shadows = new Set(
            Array.from({ length: 20 }, (_, index) => getNoteShadow(`note-${index}`))
        );

        expect(shadows.size).toBeGreaterThan(10);
    });
});
