import './ShiftToggles.css'

const SHIFT_COLORS = {
  1: '#d4351c',
  2: '#00703c',
  3: '#1d70b8',
  4: '#b58840',
  5: '#4c2c92',
}

function ShiftToggles({ selectedShifts, onToggle, onSelectAll, onClearAll }) {
  return (
    <div className="shift-toggles">
      <div className="shift-buttons">
        {[1, 2, 3, 4, 5].map(shift => (
          <button
            key={shift}
            className={`shift-button ${selectedShifts.includes(shift) ? 'active' : ''}`}
            onClick={() => onToggle(shift)}
          >
            <span
              className="shift-dot"
              style={{ borderColor: SHIFT_COLORS[shift], background: selectedShifts.includes(shift) ? SHIFT_COLORS[shift] : 'transparent' }}
            />
            Shift {shift}
          </button>
        ))}
      </div>
      <div className="action-buttons">
        <button className="action-button" onClick={onSelectAll}>All</button>
        <button className="action-button" onClick={onClearAll}>None</button>
      </div>
    </div>
  )
}

export default ShiftToggles
