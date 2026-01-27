import React from 'react'
import trashZoneStyles from '@styles/trashZone.module.css'

const TrashZone: React.FC = (): React.ReactElement => {
  return (
    <div
      id="trash-zone"
      className={trashZoneStyles.trashZone}
    >
      <span role="img" aria-label="trash">🗑️</span>
    </div>
  )
}

export default TrashZone
