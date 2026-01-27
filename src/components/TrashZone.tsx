import React, { useState } from 'react'
import trashZoneStyles from '@styles/trashZone.module.css'

interface TrashZoneProps {
  onDrop: (event: React.DragEvent) => void;
}

const TrashZone: React.FC<TrashZoneProps> = ({ onDrop }) => {
  const [isOver, setIsOver] = useState<boolean>(false)

  const handleOnDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDragEnter = (event: React.DragEvent): void => {
    event.preventDefault()
    setIsOver(true)
  };

  const handleDragLeave = () => {
    setIsOver(false)
  };

  const handleOnDrop = (event: React.DragEvent): void => {
    setIsOver(false)
    onDrop(event)
  };

  return (
    <div
      id="trash-zone"
      role="button"
      aria-label="Drop zone to delete notes. Drag notes here to remove them."
      aria-dropeffect="move"
      className={`${trashZoneStyles.trashZone} ${isOver ? trashZoneStyles.isOver : ''}`}
      onDragOver={handleOnDragOver}
      onDrop={handleOnDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <span role="img" aria-label="trash" style={{ transform: isOver ? 'rotate(15deg)' : 'none' }}>🗑️</span>
    </div>
  )
}

export default TrashZone
