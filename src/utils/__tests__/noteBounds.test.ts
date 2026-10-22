import { describe, expect, it } from 'vitest';
import {
    clampPosition,
    computeDropPosition,
    generateRandomPosition,
    parseGrabOffset,
} from '@utils/noteBounds';
import type { BoardBounds } from '@app-types/BoardBounds';

const bounds: BoardBounds = { width: 1000, height: 800, top: 60 };
const size = { width: 240, height: 160 };

describe('clampPosition', () => {
    it('keeps a note inside the usable area', () => {
        expect(clampPosition({ x: 100, y: 100 }, size, bounds)).toEqual({ x: 100, y: 100 });
    });

    it('does not let a note go above the toolbar', () => {
        expect(clampPosition({ x: 100, y: -40 }, size, bounds)).toEqual({ x: 100, y: 60 });
    });

    it('does not let a note leave the board on the left', () => {
        expect(clampPosition({ x: -500, y: 100 }, size, bounds)).toEqual({ x: 0, y: 100 });
    });

    it('does not let a note leave the board on the right or the bottom', () => {
        expect(clampPosition({ x: 5000, y: 5000 }, size, bounds)).toEqual({ x: 760, y: 640 });
    });

    it('returns the position untouched when the board was not measured yet', () => {
        const unmeasured: BoardBounds = { width: 0, height: 0, top: 60 };
        expect(clampPosition({ x: 10, y: 20 }, size, unmeasured)).toEqual({ x: 10, y: 20 });
    });
});

describe('generateRandomPosition', () => {
    it('spawns notes inside the usable area', () => {
        for (let index = 0; index < 50; index += 1) {
            const position = generateRandomPosition(size, bounds);

            expect(position.x).toBeGreaterThanOrEqual(0);
            expect(position.x).toBeLessThanOrEqual(760);
            expect(position.y).toBeGreaterThanOrEqual(60);
            expect(position.y).toBeLessThanOrEqual(640);
        }
    });

    it('uses the whole board width instead of a fixed range', () => {
        const positions = Array.from({ length: 100 }, () => generateRandomPosition(size, bounds));
        const maxX = Math.max(...positions.map((position) => position.x));

        expect(maxX).toBeGreaterThan(400);
    });
});

describe('computeDropPosition', () => {
    it('keeps the point the note was grabbed by', () => {
        const position = computeDropPosition({
            clientX: 300,
            clientY: 200,
            boardRect: { left: 0, top: 0 },
            grabOffset: { x: 10, y: 20 },
            size,
            bounds,
        });

        expect(position).toEqual({ x: 290, y: 180 });
    });

    it('takes the board offset into account', () => {
        const position = computeDropPosition({
            clientX: 300,
            clientY: 200,
            boardRect: { left: 50, top: 30 },
            grabOffset: { x: 0, y: 0 },
            size,
            bounds,
        });

        expect(position).toEqual({ x: 250, y: 170 });
    });

    it('clamps the resulting position to the board', () => {
        const position = computeDropPosition({
            clientX: 5000,
            clientY: 5000,
            boardRect: { left: 0, top: 0 },
            grabOffset: { x: 0, y: 0 },
            size,
            bounds,
        });

        expect(position).toEqual({ x: 760, y: 640 });
    });
});

describe('parseGrabOffset', () => {
    it('reads a serialized offset', () => {
        expect(parseGrabOffset(JSON.stringify({ x: 12, y: 34 }))).toEqual({ x: 12, y: 34 });
    });

    it('falls back to the top left corner for missing or broken payloads', () => {
        expect(parseGrabOffset(undefined)).toEqual({ x: 0, y: 0 });
        expect(parseGrabOffset('')).toEqual({ x: 0, y: 0 });
        expect(parseGrabOffset('not json')).toEqual({ x: 0, y: 0 });
        expect(parseGrabOffset(JSON.stringify({ x: 'a', y: null }))).toEqual({ x: 0, y: 0 });
    });
});
