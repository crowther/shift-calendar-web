import { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import { parseICS, getSelectedShiftsFromURL, getViewFromURL, updateURL } from './utils'
import ShiftToggles from './components/ShiftToggles'
import ViewSelector from './components/ViewSelector'
import ShiftTableView from './components/ShiftTableView'
import './App.css'

function App() {
  // Read initial state from URL
  const [selectedShifts, setSelectedShifts] = useState(() => getSelectedShiftsFromURL())
  const [view, setView] = useState(() => getViewFromURL())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const calendarRef = useRef(null)

  // Track the loaded date range
  const loadedRangeRef = useRef({ from: null, to: null })

  // Update URL when selection or view changes
  useEffect(() => {
    updateURL(selectedShifts, view)
  }, [selectedShifts, view])

  // Fetch calendar data for a specific date range
  const fetchDataForRange = async (dateFrom, dateTo, shiftsToFetch, append = false) => {
    try {
      const dateFromStr = dateFrom.toISOString().split('T')[0]
      const dateToStr = dateTo.toISOString().split('T')[0]

      // Build the calendar URL based on shifts to fetch
      let url
      if (shiftsToFetch.length === 5) {
        url = `/calendars/all_shifts.ics?date_from=${dateFromStr}&date_to=${dateToStr}`
      } else if (shiftsToFetch.length === 1) {
        url = `/calendars/shift${shiftsToFetch[0]}.ics?date_from=${dateFromStr}&date_to=${dateToStr}`
      } else {
        url = `/calendars/shift${shiftsToFetch.join(',')}.ics?date_from=${dateFromStr}&date_to=${dateToStr}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const icsData = await response.text()
      const parsedEvents = parseICS(icsData, shiftsToFetch)

      if (append) {
        // Merge with existing events, avoiding duplicates
        setEvents(prev => {
          const existingDates = new Set(prev.map(e => e.start))
          const newEvents = parsedEvents.filter(e => !existingDates.has(e.start))
          return [...prev, ...newEvents].sort((a, b) => a.start.localeCompare(b.start))
        })
      } else {
        setEvents(parsedEvents)
      }

      // Update loaded range
      loadedRangeRef.current = {
        from: dateFrom < (loadedRangeRef.current.from || dateFrom)
          ? dateFrom
          : (loadedRangeRef.current.from || dateFrom),
        to: dateTo > (loadedRangeRef.current.to || dateTo)
          ? dateTo
          : (loadedRangeRef.current.to || dateTo)
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err)
      setError(err.message)
      throw err
    }
  }

  // Fetch calendar data when shifts or view changes
  useEffect(() => {
    const fetchCalendarData = async () => {
      // In list view, always show all shifts
      const shiftsToFetch = view === 'listMonth' ? [1, 2, 3, 4, 5] : selectedShifts

      if (shiftsToFetch.length === 0) {
        setEvents([])
        loadedRangeRef.current = { from: null, to: null }
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Initial load: 1 year back and 1 year forward
        const today = new Date()
        const dateFrom = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
        const dateTo = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())

        await fetchDataForRange(dateFrom, dateTo, shiftsToFetch, false)
      } catch (err) {
        // Error already logged in fetchDataForRange
      } finally {
        setLoading(false)
      }
    }

    fetchCalendarData()
  }, [selectedShifts, view])

  // Check if a month is within the loaded range
  const isMonthLoaded = (year, month) => {
    if (!loadedRangeRef.current.from || !loadedRangeRef.current.to) {
      return false
    }

    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)

    return monthStart >= loadedRangeRef.current.from && monthEnd <= loadedRangeRef.current.to
  }

  // Load additional data when navigating to a month that's not loaded
  const ensureMonthLoaded = async (year, month) => {
    if (isMonthLoaded(year, month)) {
      return
    }

    const shiftsToFetch = view === 'listMonth' ? [1, 2, 3, 4, 5] : selectedShifts
    if (shiftsToFetch.length === 0) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Determine which direction to extend the range
      const targetDate = new Date(year, month, 1)
      const isInPast = !loadedRangeRef.current.from || targetDate < loadedRangeRef.current.from
      const isInFuture = !loadedRangeRef.current.to || targetDate > loadedRangeRef.current.to

      if (isInPast) {
        // Load 1 year before the current loaded range
        const newFrom = new Date(year, month - 12, 1)
        const newTo = loadedRangeRef.current.from || new Date(year, month, 1)
        await fetchDataForRange(newFrom, newTo, shiftsToFetch, true)
      } else if (isInFuture) {
        // Load 1 year after the current loaded range
        const newFrom = loadedRangeRef.current.to || new Date(year, month, 1)
        const newTo = new Date(year, month + 13, 0)
        await fetchDataForRange(newFrom, newTo, shiftsToFetch, true)
      }
    } catch (err) {
      // Error already logged
    } finally {
      setLoading(false)
    }
  }

  // Change calendar view when view state changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi()
      calendarApi.changeView(view)
    }
  }, [view])

  const toggleShift = (shiftNumber) => {
    setSelectedShifts(prev => {
      if (prev.includes(shiftNumber)) {
        return prev.filter(s => s !== shiftNumber)
      } else {
        return [...prev, shiftNumber].sort((a, b) => a - b)
      }
    })
  }

  const selectAllShifts = () => {
    setSelectedShifts([1, 2, 3, 4, 5])
  }

  const clearAllShifts = () => {
    setSelectedShifts([])
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Shift Calendar</h1>
        <p className="subtitle">
          {view === 'listMonth'
            ? 'Viewing all shifts'
            : selectedShifts.length === 0
              ? 'Select shifts to view'
              : `Viewing shift${selectedShifts.length > 1 ? 's' : ''}: ${selectedShifts.join(', ')}`
          }
        </p>
      </header>

      <div className="controls">
        {view !== 'listMonth' && (
          <ShiftToggles
            selectedShifts={selectedShifts}
            onToggle={toggleShift}
            onSelectAll={selectAllShifts}
            onClearAll={clearAllShifts}
          />
        )}
        <ViewSelector currentView={view} onViewChange={setView} />
      </div>

      {error && (
        <div className="error">
          Error loading calendar: {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          Loading calendar data...
        </div>
      )}

      <div className="calendar-container">
        {view === 'listMonth' ? (
          <ShiftTableView events={events} onMonthChange={ensureMonthLoaded} />
        ) : selectedShifts.length === 0 ? (
          <div className="empty-state">
            <p>👆 Select one or more shifts above to view the calendar</p>
          </div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, listPlugin]}
            initialView={view}
            events={events}
            firstDay={1}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            height="auto"
            eventDisplay="block"
            displayEventTime={false}
            eventColor="#3788d8"
            views={{
              listMonth: {
                buttonText: 'List'
              },
              dayGridMonth: {
                buttonText: 'Month'
              }
            }}
            datesSet={(dateInfo) => {
              // Called when the calendar view changes (navigation)
              const viewDate = dateInfo.view.currentStart
              ensureMonthLoaded(viewDate.getFullYear(), viewDate.getMonth())
            }}
          />
        )}
      </div>

      <footer className="footer">
        <p>
          Share this calendar: <code className="share-url">{window.location.href}</code>
        </p>
      </footer>
    </div>
  )
}

export default App
