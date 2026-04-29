import React, { useCallback } from 'react'
import Button from './common/Button'
import toolbarStyles from '@styles/toolbar.module.css'

interface ToolbarProps {
  onAdd: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAdd }): React.ReactElement => {
  const handleDragStart = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  return (
    <div id='toolbar' className={toolbarStyles.toolbar}>
      <h1 
        id='toolbar-heading' 
        className={toolbarStyles['toolbar__header']}
        onDragStart={handleDragStart}
        onPointerDown={(e) => e.preventDefault()}
      >
        Sticky notes
      </h1>
      <Button id='add-note-button' className={toolbarStyles['add-note-btn']} onClick={onAdd}>Add Note</Button>
    </div>
  )
}

export default Toolbar
