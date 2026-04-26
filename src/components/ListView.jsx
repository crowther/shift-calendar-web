import { useMemo } from 'react'
import { ALL_SHIFTS } from '../utils'
import './ListView.css'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const todayStr = new Date().toISOString().slice(0, 10)

function ListView({ events, currentDate, onMonthChange }) {
  const shiftMonth = (delta) => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() + delta)
    onMonthChange(d)
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const filteredEvents = useMemo(
    () =>
      events.filter((e) => {
        const d = new Date(e.start + 'T00:00:00')
        return d.getFullYear() === year && d.getMonth() === month
      }),
    [events, year, month]
  )

  const eventsByDate = useMemo(() => {
    const grouped = {}
    filteredEvents.forEach((e) => {
      if (!e.shiftNumber) return
      if (!grouped[e.start]) grouped[e.start] = {}
      grouped[e.start][e.shiftNumber] = e
    })
    return grouped
  }, [filteredEvents])

  const dates = useMemo(() => Object.keys(eventsByDate).sort(), [eventsByDate])

  const today = new Date(todayStr)
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  const toolbar = (
    <div className="shift-table-toolbar">
      <div className="toolbar-nav">
        <div className="toolbar-nav-arrows">
          <button className="nav-button" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <span className="fc-icon fc-icon-chevron-left" />
          </button>
          <button
            className="nav-button nav-button-last"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
          >
            <span className="fc-icon fc-icon-chevron-right" />
          </button>
        </div>
        <button
          className="today-button"
          onClick={() => onMonthChange(new Date())}
          disabled={isCurrentMonth}
        >
          today
        </button>
      </div>
      <h2 className="toolbar-title">
        {MONTH_NAMES[month]} {year}
      </h2>
    </div>
  )

  if (dates.length === 0) {
    return (
      <div className="shift-table-wrapper">
        {toolbar}
        <div className="shift-table-empty">
          No events in {MONTH_NAMES[month]} {year}
        </div>
      </div>
    )
  }

  return (
    <div className="shift-table-wrapper">
      {toolbar}
      <div className="shift-table-container">
        <table className="shift-table">
          <thead>
            <tr>
              <th className="date-column" />
              {ALL_SHIFTS.map((n) => (
                <th key={n} className="shift-column">
                  Shift {n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map((dateStr) => {
              const d = new Date(dateStr + 'T00:00:00')
              const isToday = dateStr === todayStr
              const isMonday = d.getDay() === 1
              const isFirstRow = dateStr === dates[0]
              const dayName = d.toLocaleDateString('en-GB', { weekday: 'short' })
              const dayNum = d.getDate()

              return (
                <tr
                  key={dateStr}
                  className={[isToday && 'today', isMonday && !isFirstRow && 'week-start']
                    .filter(Boolean)
                    .join(' ')}
                >
                  <td className="date-cell">
                    <div className="date-info">
                      <span className="day-name">{dayName}</span>
                      <span className="day-number">{dayNum}</span>
                    </div>
                  </td>
                  {ALL_SHIFTS.map((n) => {
                    const event = eventsByDate[dateStr]?.[n]
                    return (
                      <td
                        key={n}
                        className={[
                          'shift-cell',
                          event && `has-event shift-bg-${n}`,
                          isToday && 'today-cell',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {event ? (
                          <div className="shift-type">{event.shiftType}</div>
                        ) : (
                          <span className="shift-empty">–</span>
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

export default ListView
