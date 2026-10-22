import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TrashZone from '@components/TrashZone';

/** jsdom does not implement DragEvent, so the events are built by hand. */
const fireDrag = (element: HTMLElement, type: string, relatedTarget: Node | null = null): void => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'relatedTarget', { value: relatedTarget });
    fireEvent(element, event);
};

describe('TrashZone', () => {
    it('is exposed as a labelled region', () => {
        render(<TrashZone onDrop={vi.fn()} />);

        expect(screen.getByRole('region', { name: /Trash zone/ })).toBeInTheDocument();
    });

    it('highlights the zone while a note is dragged over it', () => {
        render(<TrashZone onDrop={vi.fn()} />);

        const zone = screen.getByRole('region', { name: /Trash zone/ });
        fireDrag(zone, 'dragenter');

        expect(screen.getByText('Drop to delete')).toBeInTheDocument();
    });

    it('keeps the highlight when the pointer moves over a child of the zone', () => {
        render(<TrashZone onDrop={vi.fn()} />);

        const zone = screen.getByRole('region', { name: /Trash zone/ });
        fireDrag(zone, 'dragenter');
        fireDrag(zone, 'dragleave', zone.querySelector('span'));

        expect(screen.getByText('Drop to delete')).toBeInTheDocument();
    });

    it('removes the highlight when the pointer leaves the zone', () => {
        render(<TrashZone onDrop={vi.fn()} />);

        const zone = screen.getByRole('region', { name: /Trash zone/ });
        fireDrag(zone, 'dragenter');
        fireDrag(zone, 'dragleave', document.body);

        expect(screen.queryByText('Drop to delete')).not.toBeInTheDocument();
    });

    it('forwards the drop event', async () => {
        const onDrop = vi.fn();
        render(<TrashZone onDrop={onDrop} />);

        const zone = screen.getByRole('region', { name: /Trash zone/ });
        fireDrag(zone, 'drop');

        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('Drop to delete')).not.toBeInTheDocument();
    });

    it('can be reached with the keyboard', async () => {
        const user = userEvent.setup();
        render(<TrashZone onDrop={vi.fn()} />);

        await user.tab();

        expect(screen.getByRole('region', { name: /Trash zone/ })).toBeInTheDocument();
    });
});
