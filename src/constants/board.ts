/**
 * Layout constants for the board chrome.
 *
 * The z-index scale is mirrored by the CSS custom properties declared in
 * `src/index.css` (`--z-toolbar`, `--z-note-base`, `--z-trash`). Keep both in
 * sync: notes always paint above the toolbar, and the trash zone always paints
 * above every note.
 */
export const TOOLBAR_HEIGHT = 60

/** Keep in sync with `--z-note-base` in src/index.css. */
export const BASE_Z_INDEX = 100

/** Keep in sync with `--z-trash` in src/index.css. */
export const TRASH_Z_INDEX = 100_000
