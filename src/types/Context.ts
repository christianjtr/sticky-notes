/** A user defined grouping of notes, e.g. "Trabajo" or "Casa". */
export interface Context {
    id: string;
    name: string;
    /** Colour of the tab that marks the notes of this context. */
    color: string;
}
