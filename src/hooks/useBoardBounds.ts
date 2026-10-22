import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { BoardBounds } from '@app-types/BoardBounds';
import { TOOLBAR_HEIGHT } from '@constants/board';

const fallbackBounds = (): BoardBounds => ({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
    top: TOOLBAR_HEIGHT,
});

/**
 * Measures the usable area of the board so that notes can be spawned and
 * clamped against the real canvas size instead of a hardcoded range.
 */
export const useBoardBounds = (ref: RefObject<HTMLElement | null>): BoardBounds => {
    const [bounds, setBounds] = useState<BoardBounds>(fallbackBounds);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const measure = (): void => {
            const next: BoardBounds = {
                width: element.clientWidth,
                height: element.clientHeight,
                top: TOOLBAR_HEIGHT,
            };

            setBounds((prev) =>
                prev.width === next.width && prev.height === next.height ? prev : next
            );
        };

        measure();

        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', measure);
            return () => window.removeEventListener('resize', measure);
        }

        const observer = new ResizeObserver(measure);
        observer.observe(element);

        return () => observer.disconnect();
    }, [ref]);

    return bounds;
};
