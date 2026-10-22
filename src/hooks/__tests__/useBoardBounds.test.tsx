import { useRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useBoardBounds } from '@hooks/useBoardBounds';
import type { BoardBounds } from '@app-types/BoardBounds';

interface HarnessProps {
    onBounds: (bounds: BoardBounds) => void;
}

const Harness = ({ onBounds }: HarnessProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const bounds = useBoardBounds(ref);

    onBounds(bounds);

    return <div ref={ref} data-testid="board" />;
};

describe('useBoardBounds', () => {
    it('measures the board element', () => {
        const width = vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(800);
        const height = vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(600);

        const onBounds = vi.fn();
        render(<Harness onBounds={onBounds} />);

        const lastCall = onBounds.mock.calls.at(-1)?.[0] as BoardBounds;
        expect(lastCall.width).toBe(800);
        expect(lastCall.height).toBe(600);
        expect(lastCall.top).toBe(60);

        width.mockRestore();
        height.mockRestore();
    });

    it('re-measures the board when the window is resized', () => {
        const width = vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(640);

        const onBounds = vi.fn();
        render(<Harness onBounds={onBounds} />);

        expect((onBounds.mock.calls.at(-1)?.[0] as BoardBounds).width).toBe(640);

        width.mockReturnValue(1024);
        act(() => {
            window.dispatchEvent(new Event('resize'));
        });

        expect((onBounds.mock.calls.at(-1)?.[0] as BoardBounds).width).toBe(1024);

        width.mockRestore();
    });

    it('keeps the toolbar out of the usable area', () => {
        const onBounds = vi.fn();
        render(<Harness onBounds={onBounds} />);

        expect((onBounds.mock.calls.at(-1)?.[0] as BoardBounds).top).toBe(60);
        expect(screen.getByTestId('board')).toBeInTheDocument();
    });
});
