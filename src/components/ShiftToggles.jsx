import './ShiftToggles.css'

const SHIFT_COLORS = {
  1: '#e74c3c',
  2: '#3498db',
  3: '#2ecc71',
  4: '#f39c12',
  5: '#9b59b6'
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
            style={{
              '--shift-color': SHIFT_COLORS[shift]
            }}
          >
            Shift {shift}
          </button>
        ))}
      </div>
      <div className="action-buttons">
        <button className="action-button" onClick={onSelectAll}>
          Select All
        </button>
        <button className="action-button" onClick={onClearAll}>
          Clear All
        </button>
      </div>
    </div>
  )
}

export default ShiftToggles
