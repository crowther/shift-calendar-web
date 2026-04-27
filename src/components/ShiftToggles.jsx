import { ALL_SHIFTS } from '../utils'
import './ShiftToggles.css'

function ShiftToggles({ selectedShifts, onToggle, onSelectAll, onClearAll }) {
  return (
    <div className="shift-toggles">
      <div className="shift-buttons">
        {ALL_SHIFTS.map((shift) => (
          <button
            key={shift}
            className={`shift-button ${selectedShifts.includes(shift) ? 'active' : ''}`}
            aria-pressed={selectedShifts.includes(shift)}
            onClick={() => onToggle(shift)}
          >
            <span
              className="shift-swatch"
              style={{ background: `var(--s${shift})` }}
            />
            <span className="shift-label">Shift {shift}</span>
          </button>
        ))}
      </div>
      <div className="action-buttons">
        <button className="action-button" onClick={onSelectAll}>
          All
        </button>
        {onClearAll && (
          <button className="action-button" onClick={onClearAll}>
            None
          </button>
        )}
      </div>
    </div>
  )
}

export default ShiftToggles
