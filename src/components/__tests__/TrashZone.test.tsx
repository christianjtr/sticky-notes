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

    it('says what it does while a note is being dragged', () => {
        render(<TrashZone onDrop={vi.fn()} isDragging />);

        expect(screen.getByText('Drop to delete')).toBeInTheDocument();
    });

    it('is quiet while no note is being dragged', () => {
        render(<TrashZone onDrop={vi.fn()} />);

        expect(screen.getByText('Trash')).toBeInTheDocument();
        expect(screen.queryByText('Drop to delete')).not.toBeInTheDocument();
    });

    it('keeps the hint when the pointer moves over a child of the zone', () => {
        render(<TrashZone onDrop={vi.fn()} isDragging />);

        const zone = screen.getByRole('region', { name: /Trash zone/ });
        fireDrag(zone, 'dragenter');
        fireDrag(zone, 'dragleave', zone.querySelector('span'));

        expect(screen.getByText('Drop to delete')).toBeInTheDocument();
    });

    it('marks the zone while the pointer is over it', () => {
        render(<TrashZone onDrop={vi.fn()} />);

        const zone = screen.getByRole('region', { name: /Trash zone/ });
        const before = zone.className;

        fireDrag(zone, 'dragenter');
        expect(zone.className).not.toBe(before);

        fireDrag(zone, 'dragleave', document.body);
        expect(zone.className).toBe(before);
    });

    it('forwards the drop event', async () => {
        const onDrop = vi.fn();
        render(<TrashZone onDrop={onDrop} />);

        const zone = screen.getByRole('region', { name: /Trash zone/ });
        fireDrag(zone, 'drop');

        expect(onDrop).toHaveBeenCalledTimes(1);
    });

    it('can be reached with the keyboard', async () => {
        const user = userEvent.setup();
        render(<TrashZone onDrop={vi.fn()} />);

        await user.tab();

        expect(screen.getByRole('region', { name: /Trash zone/ })).toBeInTheDocument();
    });
});
