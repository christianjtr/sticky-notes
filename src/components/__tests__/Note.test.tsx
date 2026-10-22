import { useCallback, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Note from '@components/Note';
import type { Note as NoteType } from '@app-types/Note';
import type { NotePatch } from '@hooks/useBoard';

const note: NoteType = {
    id: '4a880261-813e-47cb-b0b3-0a37029f4c98',
    title: 'Note 1',
    text: '',
    position: { x: 100, y: 100 },
    size: { width: 240, height: 160 },
    color: '#ffffff',
    zIndex: 100,
};

interface HarnessProps {
    onUpdate: (id: string, patch: NotePatch) => void;
    onDelete: (id: string) => void;
    onBringToFront: (id: string) => void;
}

/** Mirrors the controlled behaviour of the note inside the board. */
const StatefulNote = ({ onUpdate, onDelete, onBringToFront }: HarnessProps) => {
    const [current, setCurrent] = useState<NoteType>(note);

    const updateNote = useCallback((id: string, patch: NotePatch) => {
        onUpdate(id, patch);
        setCurrent((previous) => ({ ...previous, ...patch }));
    }, [onUpdate]);

    return (
        <Note
            note={current}
            updateNote={updateNote}
            onDelete={onDelete}
            onBringToFront={onBringToFront}
        />
    );
};

const renderNote = () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const onBringToFront = vi.fn();

    render(
        <StatefulNote
            onUpdate={onUpdate}
            onDelete={onDelete}
            onBringToFront={onBringToFront}
        />
    );

    return { onUpdate, onDelete, onBringToFront };
};

const positionUpdates = (onUpdate: ReturnType<typeof vi.fn>) =>
    onUpdate.mock.calls.filter(([, patch]) => patch && 'position' in patch);

describe('Note', () => {
    it('does not delete the note when backspace is pressed inside the textarea', async () => {
        const user = userEvent.setup();
        const { onDelete, onUpdate } = renderNote();

        const textarea = screen.getByLabelText('Note 1 content');
        await user.type(textarea, 'hello');
        await user.keyboard('{Backspace}');

        expect(textarea).toHaveValue('hell');
        expect(onDelete).not.toHaveBeenCalled();
        expect(positionUpdates(onUpdate)).toHaveLength(0);
    });

    it('does not move the note when the arrow keys are used inside the textarea', async () => {
        const user = userEvent.setup();
        const { onUpdate } = renderNote();

        const textarea = screen.getByLabelText('Note 1 content');
        textarea.focus();
        await user.keyboard('{ArrowDown}{ArrowUp}{ArrowLeft}{ArrowRight}');

        expect(positionUpdates(onUpdate)).toHaveLength(0);
    });

    it('moves the note with the arrow keys when the note itself is focused', async () => {
        const user = userEvent.setup();
        const { onUpdate } = renderNote();

        screen.getByRole('group').focus();
        await user.keyboard('{ArrowRight}');

        expect(onUpdate).toHaveBeenCalledWith(note.id, {
            position: { x: note.position.x + 10, y: note.position.y },
        });
    });

    it('moves the note further with shift and the arrow keys', async () => {
        const user = userEvent.setup();
        const { onUpdate } = renderNote();

        screen.getByRole('group').focus();
        await user.keyboard('{Shift>}{ArrowRight}{/Shift}');

        expect(onUpdate).toHaveBeenCalledWith(note.id, {
            position: { x: note.position.x + 50, y: note.position.y },
        });
    });

    it('deletes the note with the delete key when the note itself is focused', async () => {
        const user = userEvent.setup();
        const { onDelete } = renderNote();

        screen.getByRole('group').focus();
        await user.keyboard('{Delete}');

        expect(onDelete).toHaveBeenCalledWith(note.id);
    });

    it('reveals the delete button when the note is hovered', async () => {
        const user = userEvent.setup();
        renderNote();

        const button = screen.getByRole('button', { name: 'Delete Note 1' });
        expect(button).toHaveStyle({ pointerEvents: 'none' });

        await user.hover(screen.getByRole('group'));

        expect(button).toHaveStyle({ pointerEvents: 'auto' });
    });

    it('deletes the note from the delete button', () => {
        const { onDelete } = renderNote();

        // jsdom has no layout, so moving the pointer onto a child of the note
        // makes the note report a leave. The click is fired directly instead.
        fireEvent.click(screen.getByRole('button', { name: 'Delete Note 1' }));

        expect(onDelete).toHaveBeenCalledWith(note.id);
    });

    it('keeps the delete button unhittable while the note is not hovered', () => {
        renderNote();

        expect(screen.getByRole('button', { name: 'Delete Note 1' })).toHaveStyle({
            pointerEvents: 'none',
        });
    });

    it('resizes the note with the arrow keys on the resize handle', async () => {
        const user = userEvent.setup();
        const { onUpdate } = renderNote();

        // The handle is a control only on the active note, and the note is
        // reached first with the keyboard.
        screen.getByRole('group').focus();
        const handle = await screen.findByRole('button', { name: /Resize Note 1/ });
        handle.focus();
        await user.keyboard('{ArrowRight}');

        expect(onUpdate).toHaveBeenCalledWith(note.id, {
            size: { width: note.size.width + 10, height: note.size.height },
        });
    });

    it('does not move the note when the resize handle is used', async () => {
        const user = userEvent.setup();
        const { onUpdate } = renderNote();

        screen.getByRole('group').focus();
        const handle = await screen.findByRole('button', { name: /Resize Note 1/ });
        handle.focus();
        await user.keyboard('{ArrowRight}');

        expect(positionUpdates(onUpdate)).toHaveLength(0);
    });

    it('only offers the resize handle on the active note', async () => {
        const user = userEvent.setup();
        renderNote();

        expect(screen.queryByRole('button', { name: /Resize Note 1/ })).not.toBeInTheDocument();

        await user.hover(screen.getByRole('group'));

        expect(screen.getByRole('button', { name: /Resize Note 1/ })).toBeInTheDocument();
    });

    it('announces a readable label instead of the raw id', () => {
        renderNote();

        const label = screen.getByRole('group').getAttribute('aria-label') ?? '';

        expect(label).toContain('Note 1');
        expect(label).not.toContain(note.id);
        expect(label).toContain('100');
    });

    it('brings the note to the front when it is focused', async () => {
        const user = userEvent.setup();
        const { onBringToFront } = renderNote();

        screen.getByRole('group').focus();
        await user.tab();

        expect(onBringToFront).toHaveBeenCalledWith(note.id);
    });
});
