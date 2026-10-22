import { describe, expect, it } from 'vitest';
import { sanitizeNote, sanitizeNotes } from '@utils/noteValidation';

const validNote = {
    id: 'note-1',
    title: 'Note 1',
    text: 'hello',
    position: { x: 10, y: 20 },
    size: { width: 240, height: 160 },
    color: '#fff',
    zIndex: 3,
};

describe('sanitizeNote', () => {
    it('accepts a well formed note', () => {
        expect(sanitizeNote(validNote)).toEqual(validNote);
    });

    it('rejects entries without an id', () => {
        expect(sanitizeNote({ ...validNote, id: undefined })).toBeNull();
        expect(sanitizeNote({ ...validNote, id: '' })).toBeNull();
    });

    it('rejects entries with an invalid position or size', () => {
        expect(sanitizeNote({ ...validNote, position: { x: 'a', y: 2 } })).toBeNull();
        expect(sanitizeNote({ ...validNote, size: { width: 10 } })).toBeNull();
        expect(sanitizeNote({ ...validNote, position: undefined })).toBeNull();
    });

    it('rejects values that are not objects', () => {
        expect(sanitizeNote(null)).toBeNull();
        expect(sanitizeNote('note')).toBeNull();
        expect(sanitizeNote(42)).toBeNull();
    });

    it('fills in the optional fields of a legacy note', () => {
        const legacy = { id: 'note-2', position: { x: 1, y: 2 }, size: { width: 3, height: 4 } };

        expect(sanitizeNote(legacy)).toEqual({
            id: 'note-2',
            title: 'Note',
            text: '',
            position: { x: 1, y: 2 },
            size: { width: 3, height: 4 },
            color: expect.any(String),
            zIndex: 1,
        });
    });
});

describe('sanitizeNotes', () => {
    it('drops the invalid entries of a corrupted payload', () => {
        const result = sanitizeNotes([validNote, { id: 'broken' }, null, 'nope']);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('note-1');
    });

    it('returns an empty list for a payload that is not an array', () => {
        expect(sanitizeNotes({ notes: [] })).toEqual([]);
        expect(sanitizeNotes(null)).toEqual([]);
    });
});
