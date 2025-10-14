import { DEPARTMENT_ICONS } from '../lib/departmentIcons'
import './css-components/IconPicker.css'

export default function IconPicker({ selectedIcon, onSelectIcon, color = '#8b5cf6' }) {
  return (
    <div className="icon-picker">
      <div className="icon-picker-grid">
        {Object.entries(DEPARTMENT_ICONS).map(([iconName, iconData]) => {
          const IconComponent = iconData.component
          const isSelected = selectedIcon === iconName
          
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onSelectIcon(iconName)}
              className={`icon-picker-item ${isSelected ? 'selected' : ''}`}
              title={iconData.label}
              style={{
                borderColor: isSelected ? color : undefined,
                backgroundColor: isSelected ? `${color}15` : undefined
              }}
            >
              <IconComponent 
                className="icon-picker-icon" 
                style={{ color: isSelected ? color : undefined }}
              />
              <span className="icon-picker-label">{iconData.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
