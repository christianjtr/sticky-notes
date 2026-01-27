import React from 'react'
import Button from './common/Button'
import toolbarStyles from '@styles/toolbar.module.css'

interface ToolbarProps {
  onAdd: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAdd }): React.ReactElement => {
  return (
    <div className={toolbarStyles.toolbar}>
      <h1 className={toolbarStyles['toolbar__header']}>Sticky notes</h1>
      <Button className={toolbarStyles['add-note-btn']} onClick={onAdd}>Add Note</Button>
    </div>
  )
}

export default Toolbar
