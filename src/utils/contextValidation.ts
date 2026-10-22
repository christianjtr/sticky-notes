import type { Context } from '@app-types/Context';
import { CONTEXT_COLORS, CONTEXT_NAME_MAX_LENGTH } from '@constants/context';

/**
 * Validates a single context read back from storage. Anything that does not
 * describe a usable context is rejected instead of being forwarded to the UI.
 */
export const sanitizeContext = (value: unknown): Context | null => {
    if (typeof value !== 'object' || value === null) return null;

    const candidate = value as Partial<Context>;
    if (typeof candidate.id !== 'string' || candidate.id.length === 0) return null;
    if (typeof candidate.name !== 'string') return null;

    const name = candidate.name.trim().slice(0, CONTEXT_NAME_MAX_LENGTH);
    if (!name) return null;

    return {
        id: candidate.id,
        name,
        color:
            typeof candidate.color === 'string' && candidate.color.length > 0
                ? candidate.color
                : CONTEXT_COLORS[0],
    };
};

/** Validates a whole payload read back from storage, dropping invalid entries. */
export const sanitizeContexts = (value: unknown): Context[] => {
    if (!Array.isArray(value)) return [];

    const seen = new Set<string>();

    return value
        .map(sanitizeContext)
        .filter((context): context is Context => context !== null)
        .filter((context) => {
            if (seen.has(context.id)) return false;
            seen.add(context.id);
            return true;
        });
};

/** Picks the colour of the next context, cycling through the curated list. */
export const nextContextColor = (existing: number): string =>
    CONTEXT_COLORS[existing % CONTEXT_COLORS.length];
