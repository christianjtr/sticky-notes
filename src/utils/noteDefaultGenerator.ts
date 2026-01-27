import type { Note } from '@app-types/Note'
import type { Position } from '@app-types/Position'

export const DEFAULT_NOTE_WIDTH = 240
export const DEFAULT_NOTE_HEIGHT = 160

export const generateRandomPosition = (): Position => ({
    x: 80 + Math.random() * 400,
    y: 80 + Math.random() * 300,
})

export const generateRandomColor = (): string => `hsl(${Math.random() * 360}, 70%, 85%)`

export const createDefaultNote = (): Omit<Note, 'id' | 'zIndex' | 'text'> => {
    const { x, y } = generateRandomPosition()
    const color = generateRandomColor()

    return {
        position: { x, y },
        size: { width: DEFAULT_NOTE_WIDTH, height: DEFAULT_NOTE_HEIGHT },
        color,
    }
}
