import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import type { Context } from '@app-types/Context';
import { NOTE_ID_DATA_KEY } from '@constants/drag';
import { CONTEXT_NAME_MAX_LENGTH } from '@constants/context';
import contextStyles from '@styles/contextFilter.module.css';

interface ContextFilterProps {
    contexts: Context[];
    activeContextId: string | null;
    onToggle: (id: string) => void;
    onCreate: (name: string) => void;
    onAssign: (noteId: string, contextId: string) => void;
    onDelete?: (id: string) => void;
}

/**
 * The row of context tags.
 *
 * A click filters the board by that context, and dropping a note on a tag
 * files the note in it, which reuses the drag payload of the notes.
 */
const ContextFilter: React.FC<ContextFilterProps> = ({
    contexts,
    activeContextId,
    onToggle,
    onCreate,
    onAssign,
    onDelete,
}): React.ReactElement => {
    const [isCreating, setIsCreating] = useState(false);
    const [draft, setDraft] = useState('');
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const draftRef = useRef('');
    const wasDraggedRef = useRef(false);

    useEffect(() => {
        if (isCreating) inputRef.current?.focus();
    }, [isCreating]);

    const handleSubmit = useCallback(() => {
        const name = draftRef.current.trim();

        draftRef.current = '';
        setDraft('');
        setIsCreating(false);

        if (name) onCreate(name);
    }, [onCreate]);

    const handleChipDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const handleChipDragEnter = useCallback((event: React.DragEvent, contextId: string) => {
        event.preventDefault();
        setDragOverId(contextId);
    }, []);

    const handleChipDragLeave = useCallback((event: React.DragEvent, contextId: string) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;

        setDragOverId((current) => (current === contextId ? null : current));
    }, []);

    const handleChipDrop = useCallback((event: React.DragEvent, contextId: string) => {
        // The chip lives inside the board, so the drop must not reach the
        // board handler that repositions the dropped note.
        event.preventDefault();
        event.stopPropagation();

        const noteId = event.dataTransfer.getData(NOTE_ID_DATA_KEY);

        wasDraggedRef.current = true;
        window.setTimeout(() => {
            wasDraggedRef.current = false;
        }, 0);

        setDragOverId(null);

        if (noteId) onAssign(noteId, contextId);
    }, [onAssign]);

    const handleChipClick = useCallback((contextId: string) => {
        if (wasDraggedRef.current) return;

        onToggle(contextId);
    }, [onToggle]);

    const activeContext = contexts.find((context) => context.id === activeContextId) ?? null;

    return (
        <ul className={contextStyles.filter} aria-label="Contextos de las notas">
            {contexts.map((context) => (
                <li key={context.id}>
                    <button
                        type="button"
                        className={`${contextStyles.chip} ${
                            dragOverId === context.id ? contextStyles.isDropTarget : ''
                        }`}
                        aria-pressed={activeContextId === context.id}
                        onClick={() => handleChipClick(context.id)}
                        onDragOver={handleChipDragOver}
                        onDragEnter={(event) => handleChipDragEnter(event, context.id)}
                        onDragLeave={(event) => handleChipDragLeave(event, context.id)}
                        onDrop={(event) => handleChipDrop(event, context.id)}
                    >
                        <span
                            className={contextStyles.dot}
                            style={{ backgroundColor: context.color }}
                            aria-hidden="true"
                        />
                        {context.name}
                    </button>
                </li>
            ))}

            <li>
                {isCreating ? (
                    <input
                        ref={inputRef}
                        className={contextStyles.input}
                        value={draft}
                        maxLength={CONTEXT_NAME_MAX_LENGTH}
                        placeholder="Name"
                        aria-label="Context name"
                        onChange={(event) => {
                            draftRef.current = event.target.value;
                            setDraft(event.target.value);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                handleSubmit();
                                return;
                            }

                            if (event.key === 'Escape') {
                                event.preventDefault();
                                draftRef.current = '';
                                setDraft('');
                                setIsCreating(false);
                            }
                        }}
                        onBlur={handleSubmit}
                    />
                ) : (
                    <button
                        type="button"
                        className={`${contextStyles.chip} ${contextStyles.addButton}`}
                        onClick={() => setIsCreating(true)}
                    >
                        + New
                    </button>
                )}
            </li>

            {activeContext && onDelete && (
                <li>
                    <button
                        type="button"
                        className={contextStyles.removeButton}
                        aria-label={`Delete the ${activeContext.name} context`}
                        onClick={() => onDelete(activeContext.id)}
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                </li>
            )}
        </ul>
    );
};

export default ContextFilter;
