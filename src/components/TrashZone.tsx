import { useState, useCallback } from 'react';
import type React from 'react';
import trashZoneStyles from '@styles/trashZone.module.css';

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

  const handleDragLeave = useCallback((event: React.DragEvent): void => {
    // Moving the pointer over a child of the zone also fires `dragleave` on
    // the zone itself, so the highlight is only removed when the pointer
    // actually leaves the zone.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return

    setIsOver(false)
  }, [])

  const handleOnDrop = useCallback((event: React.DragEvent): void => {
    setIsOver(false)
    onDrop(event)
  }, [onDrop])

  return (
    <div
      id="trash-zone"
      role="region"
      aria-label="Trash zone. Drag notes here to remove them."
      className={`${trashZoneStyles.trashZone} ${isOver ? trashZoneStyles.isOver : ''} ${isDragging && !isOver ? trashZoneStyles.isDragNear : ''}`}
      onDragOver={handleOnDragOver}
      onDrop={handleOnDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <span role="img" aria-label="trash" className={trashZoneStyles.icon}>
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 7h16" />
          <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
          <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </span>
      {isOver && <span className={trashZoneStyles.hint}>Drop to delete</span>}
    </div>
  );
};

export default TrashZone;
