import type React from 'react';
import Button from './common/Button';
import toolbarStyles from '@styles/toolbar.module.css';

interface ToolbarProps {
  onAdd: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAdd }): React.ReactElement => {
  return (
    <div id='toolbar' className={toolbarStyles.toolbar}>
      <h1 id='toolbar-heading' className={toolbarStyles.title}>
        Sticky notes
      </h1>
      <Button id='add-note-button' className={toolbarStyles['add-note-btn']} onClick={onAdd}>
        Add note
      </Button>
    </div>
  );
};

export default Toolbar;
