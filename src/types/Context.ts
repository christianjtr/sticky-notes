/** A user defined grouping of notes, e.g. "Work" or "Home". */
export interface Context {
    id: string;
    name: string;
    /** Colour of the tab that marks the notes of this context. */
    color: string;
}
