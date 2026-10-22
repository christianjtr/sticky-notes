import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Toolbar from '@components/Toolbar';
import Button from '@components/common/Button';

describe('Toolbar', () => {
    it('renders the heading and the add button', () => {
        render(<Toolbar onAdd={vi.fn()} />);

        expect(screen.getByRole('heading', { name: 'Sticky notes' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Note' })).toBeInTheDocument();
    });

    it('adds a note when the button is pressed', async () => {
        const user = userEvent.setup();
        const onAdd = vi.fn();

        render(<Toolbar onAdd={onAdd} />);
        await user.click(screen.getByRole('button', { name: 'Add Note' }));

        expect(onAdd).toHaveBeenCalledTimes(1);
    });
});

describe('Button', () => {
    it('renders its children', () => {
        render(<Button>Click me</Button>);

        expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('defaults to a button type that does not submit a form', () => {
        render(<Button>Click me</Button>);

        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('forwards the click and the extra attributes', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(
            <Button id="my-button" className="my-class" disabled onClick={onClick}>
                Click me
            </Button>
        );

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('id', 'my-button');
        expect(button).toHaveClass('my-class');
        expect(button).toBeDisabled();

        await user.click(button);
        expect(onClick).not.toHaveBeenCalled();
    });
});
