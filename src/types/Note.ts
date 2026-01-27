import { type Position } from "./Position";
import { type Size } from "./Size";

export interface Note {
    id: string;
    text?: string;
    position: Position;
    size: Size;
    color?: string;
    zIndex: number;
}