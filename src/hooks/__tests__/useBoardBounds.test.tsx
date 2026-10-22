import { useRef } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useBoardBounds } from '@hooks/useBoardBounds';
import { DEFAULT_TOP_INSET } from '@constants/board';
import type { BoardBounds } from '@app-types/BoardBounds';

interface HarnessProps {
    onBounds: (bounds: BoardBounds) => void;
    withChrome?: boolean;
}

const Harness = ({ onBounds, withChrome = false }: HarnessProps) => {
    const boardRef = useRef<HTMLDivElement>(null);
    const chromeRef = useRef<HTMLDivElement>(null);

    const bounds = useBoardBounds(boardRef, withChrome ? chromeRef : undefined);

    onBounds(bounds);

    return (
        <>
            <div ref={boardRef} data-testid="board" />
            {withChrome && <div ref={chromeRef} data-testid="chrome" />}
        </>
    );
};

const lastBounds = (onBounds: ReturnType<typeof vi.fn>): BoardBounds =>
    onBounds.mock.calls.at(-1)?.[0] as BoardBounds;

const mockRects = (): (() => void) => {
    const spy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
        function (this: Element) {
            if (this.getAttribute('data-testid') === 'chrome') {
                return { top: 16, bottom: 100, left: 16, right: 220 } as DOMRect;
            }

            return { top: 0, bottom: 800, left: 0, right: 1280 } as DOMRect;
        }
    );

    return () => spy.mockRestore();
};

describe('useBoardBounds', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('measures the board element', () => {
        const width = vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(800);
        const height = vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(600);

        const onBounds = vi.fn();
        render(<Harness onBounds={onBounds} />);

        expect(lastBounds(onBounds).width).toBe(800);
        expect(lastBounds(onBounds).height).toBe(600);

        width.mockRestore();
        height.mockRestore();
    });

    it('falls back to a default inset while the chrome is not measured', () => {
        const onBounds = vi.fn();
        render(<Harness onBounds={onBounds} />);

        expect(lastBounds(onBounds).top).toBe(DEFAULT_TOP_INSET);
    });

    it('uses the bottom edge of the chrome as the inset', () => {
        const restoreRects = mockRects();

        const onBounds = vi.fn();
        render(<Harness onBounds={onBounds} withChrome />);

        expect(lastBounds(onBounds).top).toBe(100);

        restoreRects();
    });

    it('re-measures the board when the window is resized', () => {
        const width = vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(640);

        const onBounds = vi.fn();
        render(<Harness onBounds={onBounds} />);

        expect(lastBounds(onBounds).width).toBe(640);

        width.mockReturnValue(1024);
        act(() => {
            window.dispatchEvent(new Event('resize'));
        });

        expect(lastBounds(onBounds).width).toBe(1024);

        width.mockRestore();
    });
});
