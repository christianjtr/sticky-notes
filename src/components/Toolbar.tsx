import type React from 'react';
import Button from './common/Button';
import toolbarStyles from '@styles/toolbar.module.css';

interface ToolbarProps {
  onAdd: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAdd }): React.ReactElement => {
  return (
    <div id='toolbar' className={toolbarStyles.toolbar}>
      <div className={toolbarStyles.brand}>
        <svg
          className={toolbarStyles.mark}
          viewBox="0 0 20 20"
          width="20"
          height="20"
          aria-hidden="true"
        >
          <rect x="0.5" y="0.5" width="10" height="10" rx="1" fill="#FFD1C1" />
          <rect x="4.5" y="4.5" width="10" height="10" rx="1" fill="#A8D8F0" />
          <rect
            x="8.5"
            y="8.5"
            width="10"
            height="10"
            rx="1"
            fill="#FFF48C"
            transform="rotate(-8 13.5 13.5)"
          />
        </svg>
        <h1 id='toolbar-heading' className={toolbarStyles.title}>
          Sticky notes
        </h1>
      </div>
      <Button id='add-note-button' className={toolbarStyles['add-note-btn']} onClick={onAdd}>
        Add note
      </Button>
    </div>
  );
};

export default Toolbar;
