import { useState, useMemo } from 'react'
import './ShiftTableView.css'

const SHIFT_COLORS = {
  1: '#e74c3c',
  2: '#3498db',
  3: '#2ecc71',
  4: '#f39c12',
  5: '#9b59b6'
}

const SHIFT_NAMES = {
  1: 'Shift 1',
  2: 'Shift 2',
  3: 'Shift 3',
  4: 'Shift 4',
  5: 'Shift 5'
}

function ShiftTableView({ events, onMonthChange }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Always show all shifts in list view
  const allShifts = [1, 2, 3, 4, 5]

  // Notify parent when month changes
  const handleMonthChange = (newDate) => {
    setCurrentDate(newDate)
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth())
    }
  }

  // Filter events by current month
  const filteredEvents = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    return events.filter(event => {
      const eventDate = new Date(event.start + 'T00:00:00')
      return eventDate.getFullYear() === year && eventDate.getMonth() === month
    })
  }, [events, currentDate])

  // Group events by date and shift
  const eventsByDate = useMemo(() => {
    const grouped = {}

    filteredEvents.forEach(event => {
      const date = event.start
      if (!grouped[date]) {
        grouped[date] = {}
      }

      // Extract shift number from title
      const match = event.title.match(/Shift (\d)/)
      if (match) {
        const shiftNum = parseInt(match[1])
        grouped[date][shiftNum] = event
      }
    })

    return grouped
  }, [filteredEvents])

  // Get sorted dates for current month
  const dates = useMemo(() => {
    return Object.keys(eventsByDate).sort()
  }, [eventsByDate])

  // Navigation handlers
  const goToPrevMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    handleMonthChange(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    handleMonthChange(newDate)
  }

  const goToToday = () => {
    handleMonthChange(new Date())
  }

  // Format current month/year for display
  const currentMonthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00')
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    const dayNumber = date.getDate()
    // Get day of week (0 = Sunday, 6 = Saturday)
    // For Monday start: weekend is Saturday (6) and Sunday (0)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    // Check if this is today
    const today = new Date()
    const isToday = date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()
    return { dayName, dayNumber, date, isWeekend, isToday }
  }

  // Get shift type from event title
  const getShiftType = (event) => {
    if (!event) return ''
    const match = event.title.match(/- (.+)$/)
    return match ? match[1] : ''
  }

  if (dates.length === 0) {
    return (
      <div className="shift-table-wrapper">
        <div className="shift-table-toolbar">
          <div className="toolbar-chunk">
            <button onClick={goToPrevMonth} className="nav-button">
              <span className="fc-icon fc-icon-chevron-left"></span>
            </button>
            <button onClick={goToNextMonth} className="nav-button">
              <span className="fc-icon fc-icon-chevron-right"></span>
            </button>
            <button onClick={goToToday} className="today-button">today</button>
          </div>
          <div className="toolbar-chunk">
            <h2 className="toolbar-title">{currentMonthYear}</h2>
          </div>
          <div className="toolbar-chunk"></div>
        </div>
        <div className="shift-table-empty">
          <p>No events in {currentMonthYear}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="shift-table-wrapper">
      <div className="shift-table-toolbar">
        <div className="toolbar-chunk">
          <button onClick={goToPrevMonth} className="nav-button">
            <span className="fc-icon fc-icon-chevron-left"></span>
          </button>
          <button onClick={goToNextMonth} className="nav-button">
            <span className="fc-icon fc-icon-chevron-right"></span>
          </button>
          <button onClick={goToToday} className="today-button">today</button>
        </div>
        <div className="toolbar-chunk">
          <h2 className="toolbar-title">{currentMonthYear}</h2>
        </div>
        <div className="toolbar-chunk"></div>
      </div>
      <div className="shift-table-container">
        <table className="shift-table">
        <thead>
          <tr>
            <th className="date-column"></th>
            {allShifts.map(shiftNum => (
              <th
                key={shiftNum}
                className="shift-column active"
                style={{ '--shift-color': SHIFT_COLORS[shiftNum] }}
              >
                {SHIFT_NAMES[shiftNum]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.map(dateStr => {
            const { dayName, dayNumber, isWeekend, isToday } = formatDate(dateStr)

            return (
              <tr key={dateStr} className={`${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''}`}>
                <td className="date-cell">
                  <div className="date-info">
                    <span className="day-name">{dayName}</span>
                    <span className="day-number">{dayNumber}</span>
                  </div>
                </td>
                {allShifts.map(shiftNum => {
                  const event = eventsByDate[dateStr]?.[shiftNum]
                  const shiftType = getShiftType(event)

                  return (
                    <td
                      key={shiftNum}
                      className={`shift-cell ${event ? 'has-event' : ''}`}
                      style={{ '--shift-color': SHIFT_COLORS[shiftNum] }}
                    >
                      {event && (
                        <div className="shift-type">{shiftType}</div>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </div>
  )
}

export default ShiftTableView
