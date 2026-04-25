import './ViewSelector.css'

function ViewSelector({ currentView, onViewChange }) {
  return (
    <div className="view-selector">
      <button
        className={`view-button ${currentView === 'dayGridMonth' ? 'active' : ''}`}
        onClick={() => onViewChange('dayGridMonth')}
      >
        📅 Grid
      </button>
      <button
        className={`view-button ${currentView === 'listMonth' ? 'active' : ''}`}
        onClick={() => onViewChange('listMonth')}
      >
        📋 List
      </button>
    </div>
  )
}

export default ViewSelector
