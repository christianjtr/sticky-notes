import { useCallback, useRef, useState, memo } from 'react';
import type React from 'react';
import type { Note as NoteType } from '@app-types/Note';
import type { NotePatch } from '@hooks/useBoard';
import { useNoteResize } from '@hooks/useNoteResize';
import { NOTE_GRAB_OFFSET_DATA_KEY, NOTE_ID_DATA_KEY } from '@constants/drag';
import { KEYBOARD_MOVE_STEP, KEYBOARD_MOVE_STEP_LARGE } from '@constants/note';
import { getNoteShadow } from '@utils/noteShadow';
import noteStyles from '@styles/note.module.css';

interface NoteProps {
    note: NoteType;
    updateNote: (id: string, patch: NotePatch) => void;
    onDelete?: (id: string) => void;
    onBringToFront?: (id: string) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    /** Colour of the tab that marks the context of the note. */
    contextColor?: string;
}

const Note: React.FC<NoteProps> = ({
    note,
    updateNote,
    onDelete,
    onBringToFront,
    onDragStart,
    onDragEnd,
    contextColor,
}): React.ReactElement => {
    const [isDragging, setIsDragging] = useState(false);
    const [isTouchMoving, setIsTouchMoving] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const touchStartRef = useRef<{
        startX: number;
        startY: number;
        startNoteX: number;
        startNoteY: number;
    } | null>(null);

    const { isResizing, handleResizeStart, handleResizeKeyDown } = useNoteResize({
        note,
        updateNote,
    });

    const dynamicStyle = {
        width: note.size.width,
        height: note.size.height,
        backgroundColor: note.color,
        zIndex: note.zIndex,
        transform: `translate(${note.position.x}px, ${note.position.y}px)`,
        // The shadow is seeded with the id of the note, so the board looks
        // hand placed without a single note moving.
        '--note-shadow': getNoteShadow(note.id),
    } as React.CSSProperties;

    const handleDragStart = useCallback((event: React.DragEvent) => {
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        event.dataTransfer.setData(NOTE_ID_DATA_KEY, note.id);
        // Firefox only starts a drag when some payload was set, and the title
        // is a sensible fallback for dropping the note as plain text.
        event.dataTransfer.setData('text/plain', note.title);
        event.dataTransfer.setData(
            NOTE_GRAB_OFFSET_DATA_KEY,
            JSON.stringify({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            })
        );
        event.dataTransfer.effectAllowed = 'move';

        event.stopPropagation();
        setIsDragging(true);
        onDragStart?.();
    }, [note.id, note.title, onDragStart]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        onDragEnd?.();
    }, [onDragEnd]);

    const handleTouchStart = useCallback((event: React.TouchEvent) => {
        if (event.touches.length !== 1) return;

        touchStartRef.current = {
            startX: event.touches[0].clientX,
            startY: event.touches[0].clientY,
            startNoteX: note.position.x,
            startNoteY: note.position.y,
        };
        setIsTouchMoving(true);
    }, [note.position]);

    const handleTouchMove = useCallback((event: React.TouchEvent) => {
        const origin = touchStartRef.current;
        if (!origin || event.touches.length !== 1) return;

        const touch = event.touches[0];

        updateNote(note.id, {
            position: {
                x: origin.startNoteX + (touch.clientX - origin.startX),
                y: origin.startNoteY + (touch.clientY - origin.startY),
            },
        });
    }, [note.id, updateNote]);

    const handleTouchEnd = useCallback(() => {
        touchStartRef.current = null;
        setIsTouchMoving(false);
    }, []);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        // Keys pressed inside the textarea belong to the textarea: the caret
        // must move and the text must be editable.
        if (event.target !== event.currentTarget) return;

        const moveAmount = event.shiftKey ? KEYBOARD_MOVE_STEP_LARGE : KEYBOARD_MOVE_STEP;
        const { x, y } = note.position;

        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                updateNote(note.id, { position: { x, y: y - moveAmount } });
                break;
            case 'ArrowDown':
                event.preventDefault();
                updateNote(note.id, { position: { x, y: y + moveAmount } });
                break;
            case 'ArrowLeft':
                event.preventDefault();
                updateNote(note.id, { position: { x: x - moveAmount, y } });
                break;
            case 'ArrowRight':
                event.preventDefault();
                updateNote(note.id, { position: { x: x + moveAmount, y } });
                break;
            case 'Delete':
            case 'Backspace':
                event.preventDefault();
                onDelete?.(note.id);
                break;
            default:
                break;
        }
    }, [note.id, note.position, updateNote, onDelete]);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        onBringToFront?.(note.id);
    }, [note.id, onBringToFront]);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
    }, []);

    const handlePointerEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handlePointerLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    const handlePointerDown = useCallback(() => {
        onBringToFront?.(note.id);
    }, [note.id, onBringToFront]);

    const handleDeleteClick = useCallback(() => {
        onDelete?.(note.id);
    }, [note.id, onDelete]);

    const handleButtonDragStart = useCallback((event: React.DragEvent) => {
        event.stopPropagation();
    }, []);

    const ariaLabel = `${note.title}. Position ${Math.round(note.position.x)}, ${Math.round(
        note.position.y
    )}. Size ${Math.round(note.size.width)} by ${Math.round(
        note.size.height
    )}. Use arrow keys to move this note.`;

    const classNames = [
        noteStyles.note,
        isDragging || isTouchMoving ? noteStyles.isDraggingEffect : '',
        isResizing ? noteStyles.isResizing : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            id={`note-${note.id}`}
            tabIndex={0}
            role="group"
            aria-label={ariaLabel}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={classNames}
            style={dynamicStyle}
            draggable
        >
            {contextColor && (
                <span
                    className={noteStyles.contextTab}
                    style={{ backgroundColor: contextColor }}
                    aria-hidden="true"
                />
            )}
            <textarea
                id={`note-textarea-${note.id}`}
                name={`note-text-${note.id}`}
                className={noteStyles.textarea}
                value={note.text}
                onChange={(event) => updateNote(note.id, { text: event.target.value })}
                placeholder="Type anything..."
                aria-label={`${note.title} content`}
            />
            <button
                type="button"
                className={`${noteStyles.deleteButton} ${
                    isHovered || isFocused ? noteStyles.isDeleteVisible : ''
                }`}
                aria-label={`Delete ${note.title}`}
                onClick={handleDeleteClick}
                onDragStart={handleButtonDragStart}
                draggable={false}
            >
                <span aria-hidden="true">×</span>
            </button>
            <div
                className={noteStyles.resizeHandle}
                onPointerDown={handleResizeStart}
                onKeyDown={handleResizeKeyDown}
                aria-label={`Resize ${note.title}. Use arrow keys to change its size.`}
                role="button"
                tabIndex={0}
            />
        </div>
    );
};

// The React Compiler already memoizes this component, the explicit memo keeps
// the guarantee even if the compiler decides not to optimise it.
export default memo(Note);
