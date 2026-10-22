import type { Position } from '@app-types/Position';
import type { Size } from '@app-types/Size';
import type { BoardBounds } from '@app-types/BoardBounds';

export interface GrabOffset {
    x: number;
    y: number;
}

export interface BoardRect {
    left: number;
    top: number;
}

const isMeasurable = (bounds: BoardBounds): boolean => bounds.width > 0 && bounds.height > 0;

/** Largest x a note of `size` can occupy without overflowing the board. */
const maxX = (size: Size, bounds: BoardBounds): number =>
    Math.max(0, bounds.width - size.width);

/** Largest y a note of `size` can occupy without overflowing the board. */
const maxY = (size: Size, bounds: BoardBounds): number =>
    Math.max(bounds.top, bounds.height - size.height);

/**
 * Keeps a note inside the usable area of the board. Positions are expressed in
 * board-local pixels, where `0,0` is the top-left corner of the board.
 */
export const clampPosition = (
    position: Position,
    size: Size,
    bounds: BoardBounds
): Position => {
    if (!isMeasurable(bounds)) return position;

    return {
        x: Math.min(Math.max(position.x, 0), maxX(size, bounds)),
        y: Math.min(Math.max(position.y, bounds.top), maxY(size, bounds)),
    };
};

/**
 * Picks a random spawn position inside the usable area of the board. The
 * random range follows the board size so notes spread over the whole canvas
 * instead of piling up in a fixed corner.
 */
export const generateRandomPosition = (
    size: Size,
    bounds: BoardBounds
): Position => {
    if (!isMeasurable(bounds)) return { x: 0, y: bounds.top };

    const rangeX = maxX(size, bounds);
    const rangeY = maxY(size, bounds) - bounds.top;

    return {
        x: Math.round(Math.random() * rangeX),
        y: Math.round(bounds.top + Math.random() * rangeY),
    };
};

/**
 * Converts the pointer position of a drop event into a board-local position
 * for the dropped note, keeping the point the user grabbed the note by.
 */
export const computeDropPosition = ({
    clientX,
    clientY,
    boardRect,
    grabOffset,
    size,
    bounds,
}: {
    clientX: number;
    clientY: number;
    boardRect: BoardRect;
    grabOffset: GrabOffset;
    size: Size;
    bounds: BoardBounds;
}): Position => {
    const position = {
        x: clientX - boardRect.left - grabOffset.x,
        y: clientY - boardRect.top - grabOffset.y,
    };

    return clampPosition(position, size, bounds);
};

/**
 * Reads the grab offset stored on the drag event. Falls back to the top-left
 * corner when the payload is missing or malformed.
 */
export const parseGrabOffset = (raw: string | undefined | null): GrabOffset => {
    if (!raw) return { x: 0, y: 0 };

    try {
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null) return { x: 0, y: 0 };

        const { x, y } = parsed as Partial<GrabOffset>;
        return {
            x: typeof x === 'number' && Number.isFinite(x) ? x : 0,
            y: typeof y === 'number' && Number.isFinite(y) ? y : 0,
        };
    } catch {
        return { x: 0, y: 0 };
    }
};
