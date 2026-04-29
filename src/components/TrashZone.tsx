import React, { useState, useCallback } from 'react'
import trashZoneStyles from '@styles/trashZone.module.css'

interface TrashZoneProps {
  onDrop: (event: React.DragEvent) => void;
  isDragging?: boolean;
}

const TrashZone: React.FC<TrashZoneProps> = ({ onDrop, isDragging = false }) => {
  const [isOver, setIsOver] = useState<boolean>(false)

  const handleOnDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDragEnter = useCallback((event: React.DragEvent): void => {
    event.preventDefault()
    setIsOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsOver(false)
  }, [])

  const handleOnDrop = useCallback((event: React.DragEvent): void => {
    setIsOver(false)
    onDrop(event)
  }, [onDrop])

  return (
    <div
      id="trash-zone"
      role="button"
      aria-label="Drop zone to delete notes. Drag notes here to remove them."
      aria-dropeffect="move"
      className={`${trashZoneStyles.trashZone} ${isOver ? trashZoneStyles.isOver : ''} ${isDragging && !isOver ? trashZoneStyles.isDragNear : ''}`}
      onDragOver={handleOnDragOver}
      onDrop={handleOnDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <span 
        role="img" 
        aria-label="trash" 
        style={{ 
          transform: isOver ? 'rotate(15deg) scale(1.1)' : isDragging ? 'scale(1.05)' : 'none',
          transition: 'transform 0.2s ease'
        }}
      >
        🗑️
      </span>
      {isOver && (
        <span style={{ 
          position: 'absolute', 
          bottom: '8px', 
          fontSize: '12px',
          fontWeight: 600
        }}>
          Drop to delete
        </span>
      )}
    </div>
  )
}

export default TrashZone
