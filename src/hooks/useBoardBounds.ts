import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { BoardBounds } from '@app-types/BoardBounds';
import { DEFAULT_TOP_INSET } from '@constants/board';

const fallbackBounds = (): BoardBounds => ({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
    top: DEFAULT_TOP_INSET,
});

/**
 * Measures the usable area of the board so that notes can be spawned and
 * clamped against the real canvas size instead of a hardcoded range.
 *
 * The top inset is the bottom edge of the board chrome, so the notes never
 * end up underneath it and the inset follows the chrome on its own.
 */
export const useBoardBounds = (
    boardRef: RefObject<HTMLElement | null>,
    chromeRef?: RefObject<HTMLElement | null>
): BoardBounds => {
    const [bounds, setBounds] = useState<BoardBounds>(fallbackBounds);

    useEffect(() => {
        const board = boardRef.current;
        if (!board) return;

        const measure = (): void => {
            const boardRect = board.getBoundingClientRect();
            const chrome = chromeRef?.current;

            const next: BoardBounds = {
                width: board.clientWidth,
                height: board.clientHeight,
                top: chrome
                    ? Math.max(0, Math.round(chrome.getBoundingClientRect().bottom - boardRect.top))
                    : DEFAULT_TOP_INSET,
            };

            setBounds((prev) =>
                prev.width === next.width &&
                prev.height === next.height &&
                prev.top === next.top
                    ? prev
                    : next
            );
        };

        measure();

        const observer =
            typeof ResizeObserver === 'undefined'
                ? null
                : new ResizeObserver(measure);

        if (observer) {
            observer.observe(board);
            if (chromeRef?.current) observer.observe(chromeRef.current);
        } else {
            window.addEventListener('resize', measure);
        }

        return () => {
            observer?.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [boardRef, chromeRef]);

    return bounds;
};
