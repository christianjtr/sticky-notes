import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ContextFilter from '@components/ContextFilter';
import type { Context } from '@app-types/Context';
import { NOTE_ID_DATA_KEY } from '@constants/drag';

const contexts: Context[] = [
    { id: 'context-1', name: 'Work', color: '#3182ed' },
    { id: 'context-2', name: 'Home', color: '#099268' },
];

const renderFilter = (overrides: Partial<React.ComponentProps<typeof ContextFilter>> = {}) => {
    const onToggle = vi.fn();
    const onCreate = vi.fn();
    const onAssign = vi.fn();
    const onDelete = vi.fn();

    render(
        <ContextFilter
            contexts={contexts}
            activeContextId={null}
            onToggle={onToggle}
            onCreate={onCreate}
            onAssign={onAssign}
            onDelete={onDelete}
            {...overrides}
        />
    );

    return { onToggle, onCreate, onAssign, onDelete };
};

/** jsdom does not implement DragEvent, so the event is built by hand. */
const fireDrop = (element: HTMLElement, noteId: string): void => {
    const event = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', {
        value: { getData: (key: string) => (key === NOTE_ID_DATA_KEY ? noteId : '') },
    });

    fireEvent(element, event);
};

describe('ContextFilter', () => {
    it('renders a tag per context', () => {
        renderFilter();

        expect(screen.getByRole('button', { name: 'Work' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
    });

    it('filters the board when a tag is pressed', async () => {
        const user = userEvent.setup();
        const { onToggle } = renderFilter();

        await user.click(screen.getByRole('button', { name: 'Work' }));

        expect(onToggle).toHaveBeenCalledWith('context-1');
    });

    it('marks the active context as pressed', () => {
        renderFilter({ activeContextId: 'context-2' });

        expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute(
            'aria-pressed',
            'true'
        );
        expect(screen.getByRole('button', { name: 'Work' })).toHaveAttribute(
            'aria-pressed',
            'false'
        );
    });

    it('files a note in a context when it is dropped on its tag', () => {
        const { onAssign } = renderFilter();

        fireDrop(screen.getByRole('button', { name: 'Work' }), 'note-1');

        expect(onAssign).toHaveBeenCalledWith('note-1', 'context-1');
    });

    it('creates a context from the inline input', async () => {
        const user = userEvent.setup();
        const { onCreate } = renderFilter();

        await user.click(screen.getByRole('button', { name: '+ New' }));

        const input = screen.getByLabelText('Context name');
        await user.type(input, 'Ideas');
        await user.keyboard('{Enter}');

        expect(onCreate).toHaveBeenCalledWith('Ideas');
    });

    it('abandons the inline input with escape', async () => {
        const user = userEvent.setup();
        const { onCreate } = renderFilter();

        await user.click(screen.getByRole('button', { name: '+ New' }));
        await user.type(screen.getByLabelText('Context name'), 'Ideas');
        await user.keyboard('{Escape}');

        expect(onCreate).not.toHaveBeenCalled();
        expect(screen.queryByLabelText('Context name')).not.toBeInTheDocument();
    });

    it('offers to delete the active context only', () => {
        const { onDelete } = renderFilter({ activeContextId: 'context-1' });

        expect(
            screen.getByRole('button', { name: 'Delete the Work context' })
        ).toBeInTheDocument();
        expect(onDelete).not.toHaveBeenCalled();
    });

    it('deletes the active context', async () => {
        const user = userEvent.setup();
        const { onDelete } = renderFilter({ activeContextId: 'context-1' });

        await user.click(
            screen.getByRole('button', { name: 'Delete the Work context' })
        );

        expect(onDelete).toHaveBeenCalledWith('context-1');
    });
});
