import { describe, expect, it } from 'vitest';
import { sanitizeContext, sanitizeContexts, nextContextColor } from '@utils/contextValidation';
import { CONTEXT_COLORS } from '@constants/context';

const validContext = {
    id: 'context-1',
    name: 'Trabajo',
    color: '#3182ed',
};

describe('sanitizeContext', () => {
    it('accepts a well formed context', () => {
        expect(sanitizeContext(validContext)).toEqual(validContext);
    });

    it('rejects entries without an id or a name', () => {
        expect(sanitizeContext({ ...validContext, id: '' })).toBeNull();
        expect(sanitizeContext({ ...validContext, name: '   ' })).toBeNull();
        expect(sanitizeContext({ ...validContext, name: 42 })).toBeNull();
    });

    it('rejects values that are not objects', () => {
        expect(sanitizeContext(null)).toBeNull();
        expect(sanitizeContext('Trabajo')).toBeNull();
    });

    it('trims the name and falls back to a colour', () => {
        const result = sanitizeContext({ id: 'context-2', name: '  Casa  ' });

        expect(result?.name).toBe('Casa');
        expect(result?.color).toBe(CONTEXT_COLORS[0]);
    });
});

describe('sanitizeContexts', () => {
    it('drops the invalid entries of a corrupted payload', () => {
        const result = sanitizeContexts([validContext, { id: 'broken' }, null, 'nope']);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('context-1');
    });

    it('drops the duplicated ids', () => {
        const result = sanitizeContexts([validContext, validContext]);

        expect(result).toHaveLength(1);
    });

    it('returns an empty list for a payload that is not an array', () => {
        expect(sanitizeContexts({ contexts: [] })).toEqual([]);
        expect(sanitizeContexts(null)).toEqual([]);
    });
});

describe('nextContextColor', () => {
    it('walks through the curated colours', () => {
        expect(nextContextColor(0)).toBe(CONTEXT_COLORS[0]);
        expect(nextContextColor(1)).toBe(CONTEXT_COLORS[1]);
    });

    it('cycles back to the first colour', () => {
        expect(nextContextColor(CONTEXT_COLORS.length)).toBe(CONTEXT_COLORS[0]);
    });
});
