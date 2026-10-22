/**
 * Usable area of the board, in board-local pixels.
 *
 * `top` is the offset of the first row that is not covered by the toolbar, so
 * notes can never be pushed underneath the board chrome.
 */
export interface BoardBounds {
  width: number;
  height: number;
  top: number;
}
