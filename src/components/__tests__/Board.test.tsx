import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import Board from '@components/Board';

describe('Board', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders the workspace, the toolbar and the trash zone', () => {
        render(<Board />);

        expect(screen.getByRole('main', { name: 'Sticky notes workspace' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Sticky notes' })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: /Trash zone/ })).toBeInTheDocument();
    });

    it('creates a note and announces it', async () => {
        const user = userEvent.setup();
        render(<Board />);

        await user.click(screen.getByRole('button', { name: 'Add note' }));

        expect(screen.getAllByRole('group', { name: /arrow keys/ })).toHaveLength(1);
        expect(screen.getByText(/Note added/)).toBeInTheDocument();
    });

    it('gives every note a unique stacking order', async () => {
        const user = userEvent.setup();
        render(<Board />);

        const addButton = screen.getByRole('button', { name: 'Add note' });
        await user.click(addButton);
        await user.click(addButton);
        await user.click(addButton);

        const zIndexes = screen
            .getAllByRole('group', { name: /arrow keys/ })
            .map((note) => Number(note.style.zIndex));

        expect(new Set(zIndexes).size).toBe(3);
    });

    it('deletes a note from its delete button and announces it', async () => {
        const user = userEvent.setup();
        render(<Board />);

        await user.click(screen.getByRole('button', { name: 'Add note' }));
        fireEvent.click(screen.getByRole('button', { name: /Delete Note/ }));

        expect(screen.queryAllByRole('group', { name: /arrow keys/ })).toHaveLength(0);
        expect(screen.getByText(/Note deleted/)).toBeInTheDocument();
    });

    it('restores the persisted notes', () => {
        localStorage.setItem(
            'sticky-notes-app-notes',
            JSON.stringify([
                {
                    id: 'note-1',
                    title: 'Note 1',
                    text: 'persisted',
                    position: { x: 10, y: 70 },
                    size: { width: 240, height: 160 },
                    color: '#ffffff',
                    zIndex: 100,
                },
            ])
        );

        render(<Board />);

        expect(screen.getAllByRole('group', { name: /arrow keys/ })).toHaveLength(1);
        expect(screen.getByLabelText('Note 1 content')).toHaveValue('persisted');
    });

    it('ignores a corrupted payload', () => {
        localStorage.setItem('sticky-notes-app-notes', JSON.stringify([{ id: 'broken' }]));

        render(<Board />);

        expect(screen.queryAllByRole('group', { name: /arrow keys/ })).toHaveLength(0);
    });

    it('keeps the notes on the board when a context is created', async () => {
        const user = userEvent.setup();
        render(<Board />);

        await user.click(screen.getByRole('button', { name: 'Add note' }));
        await user.click(screen.getByRole('button', { name: '+ New' }));
        await user.type(screen.getByLabelText('Context name'), 'Work');
        await user.keyboard('{Enter}');

        expect(screen.getAllByRole('group', { name: /arrow keys/ })).toHaveLength(1);
        expect(screen.getByRole('button', { name: 'Work' })).toHaveAttribute(
            'aria-pressed',
            'false'
        );
    });

    it('explains an empty context', async () => {
        const user = userEvent.setup();
        render(<Board />);

        await user.click(screen.getByRole('button', { name: '+ New' }));
        await user.type(screen.getByLabelText('Context name'), 'Work');
        await user.keyboard('{Enter}');

        await user.click(screen.getByRole('button', { name: 'Work' }));

        expect(screen.getByText(/No notes in Work yet/)).toBeInTheDocument();
    });
});
