import React, { useCallback, useEffect, useRef, useState, memo } from 'react'
import type { Note as NoteType } from '@app-types/Note'
import noteStyles from '@styles/note.module.css'

interface NoteProps {
  note: NoteType;
  updateNote: (note: NoteType) => void;
  onDelete?: (id: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const Note: React.FC<NoteProps> = ({ note, updateNote, onDelete, onDragStart, onDragEnd }): React.ReactElement => {
  const [isTouchMoving, setIsTouchMoving] = useState(false)
  const touchStartRef = useRef<{ startX: number; startY: number; startNoteX: number; startNoteY: number } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null)
  const isResizing = useRef(false)
  const handlePointerMoveRef = useRef<(event: PointerEvent) => void>(() => {})
  const handlePointerUpRef = useRef<() => void>(() => {})

  const dynamicStyle: React.CSSProperties = {
    width: note.size.width,
    height: note.size.height,
    backgroundColor: note.color,
    zIndex: note.zIndex,
    transform: `translate(${note.position.x}px, ${note.position.y}px)`,
  }

  const handleDragStart = useCallback((event: React.DragEvent) => {
    event.dataTransfer.setData('noteId', note.id)
    event.dataTransfer.effectAllowed = 'move'

    const target = event.currentTarget as HTMLElement
    target.classList.add(noteStyles.isDraggingEffect)

    event.stopPropagation();
    onDragStart?.()
  }, [note.id, onDragStart])

  const handleDragEnd = useCallback((event: React.DragEvent) => {
    const target = event.currentTarget as HTMLElement
    target.classList.remove(noteStyles.isDraggingEffect)
    onDragEnd?.()
  }, [onDragEnd])

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!resizeRef.current || !isResizing.current) return

    const { startX, startY, startW, startH } = resizeRef.current
    updateNote({
      ...note,
      size: {
        width: Math.max(100, startW + (event.clientX - startX)),
        height: Math.max(100, startH + (event.clientY - startY)),
      }
    })
  }, [note, updateNote])

  const handlePointerUp = useCallback(() => {
    isResizing.current = false
    resizeRef.current = null
    document.removeEventListener('pointermove', handlePointerMoveRef.current)
    document.removeEventListener('pointerup', handlePointerUpRef.current)
  }, [])

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      touchStartRef.current = {
        startX: event.touches[0].clientX,
        startY: event.touches[0].clientY,
        startNoteX: note.position.x,
        startNoteY: note.position.y,
      }
      setIsTouchMoving(true)
    }
  }, [note.position])

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!touchStartRef.current || event.touches.length !== 1) return

    const touch = event.touches[0]
    const { startX, startY, startNoteX, startNoteY } = touchStartRef.current
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    updateNote({
      ...note,
      position: { x: startNoteX + deltaX, y: startNoteY + deltaY }
    })
  }, [note, updateNote])

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null
    setIsTouchMoving(false)
  }, [])

  useEffect(() => {
    handlePointerMoveRef.current = handlePointerMove
    handlePointerUpRef.current = handlePointerUp
  }, [handlePointerMove, handlePointerUp])

  const handleResize = useCallback((event: React.PointerEvent) => {
    event.preventDefault()

    isResizing.current = true
    resizeRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startW: note.size.width,
      startH: note.size.height,
    }

    document.addEventListener('pointermove', handlePointerMoveRef.current)
    document.addEventListener('pointerup', handlePointerUpRef.current)
  }, [note.size])

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNote({ ...note, text: event.target.value })
  }, [note, updateNote])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const moveAmount = event.shiftKey ? 50 : 10

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        updateNote({
          ...note,
          position: { x: note.position.x, y: note.position.y - moveAmount }
        })
        break
      case 'ArrowDown':
        event.preventDefault()
        updateNote({
          ...note,
          position: { x: note.position.x, y: note.position.y + moveAmount }
        })
        break
      case 'ArrowLeft':
        event.preventDefault()
        updateNote({
          ...note,
          position: { x: note.position.x - moveAmount, y: note.position.y }
        })
        break
      case 'ArrowRight':
        event.preventDefault()
        updateNote({
          ...note,
          position: { x: note.position.x + moveAmount, y: note.position.y }
        })
        break
      case 'Delete':
      case 'Backspace':
        event.preventDefault()
        onDelete?.(note.id)
        break
    }
  }, [note, updateNote, onDelete])

  useEffect(() => {
    return () => {
      document.removeEventListener('pointermove', handlePointerMoveRef.current)
      document.removeEventListener('pointerup', handlePointerUpRef.current)
    }
  }, [])

  return (
    <div
      id={`note-${note.id}`}
      tabIndex={0}
      role="application"
      aria-label={`Sticky note ${note.id}. Position: ${note.position.x}, ${note.position.y}. Size: ${note.size.width} by ${note.size.height}. Use arrow keys to move, drag to reposition.`}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`${noteStyles.note} ${isTouchMoving ? noteStyles.isDraggingEffect : ''}`}
      style={dynamicStyle}
      draggable
    >
      <textarea
        id={`note-textarea-${note.id}`}
        name={`note-text-${note.id}`}
        className={noteStyles.textarea}
        value={note.text}
        onChange={handleTextChange}
        placeholder="Type anything..."
        aria-label="Note content"
      />
      <div
        className={noteStyles.resizeHandle}
        onPointerDown={handleResize}
        aria-label="Resize note"
        role="button"
        tabIndex={-1}
      />
    </div>
  )
}

export default memo(Note)
