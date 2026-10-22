import type { Position } from './Position';
import type { Size } from './Size';

export interface Note {
    id: string;
    /** Human readable label, e.g. "Note 3". Used for announcements. */
    title: string;
    text: string;
    position: Position;
    size: Size;
    color: string;
    zIndex: number;
}
