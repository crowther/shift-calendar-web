import { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import { parseICS, getSelectedShiftsFromURL, getViewFromURL, updateURL, ALL_SHIFTS } from './utils'
import ShiftToggles from './components/ShiftToggles'
import ViewSelector from './components/ViewSelector'
import ShiftTableView from './components/ShiftTableView'
import './App.css'

function App() {
  const [selectedShifts, setSelectedShifts] = useState(() => getSelectedShiftsFromURL())
  const [view, setView] = useState(() => getViewFromURL())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const calendarRef = useRef(null)
  const loadedRangeRef = useRef({ from: null, to: null })

  useEffect(() => {
    updateURL(selectedShifts, view)
  }, [selectedShifts, view])

  const fetchDataForRange = async (dateFrom, dateTo, shiftsToFetch, append = false) => {
    try {
      const dateFromStr = dateFrom.toISOString().split('T')[0]
      const dateToStr = dateTo.toISOString().split('T')[0]

      let url
      if (shiftsToFetch.length === ALL_SHIFTS.length) {
        url = `/calendars/all_shifts.ics?date_from=${dateFromStr}&date_to=${dateToStr}`
      } else if (shiftsToFetch.length === 1) {
        url = `/calendars/shift${shiftsToFetch[0]}.ics?date_from=${dateFromStr}&date_to=${dateToStr}`
      } else {
        url = `/calendars/shift${shiftsToFetch.join(',')}.ics?date_from=${dateFromStr}&date_to=${dateToStr}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const parsedEvents = parseICS(await response.text())

      if (append) {
        setEvents(prev => {
          const existing = new Set(prev.map(e => `${e.title}-${e.start}`))
          const newEvents = parsedEvents.filter(e => !existing.has(`${e.title}-${e.start}`))
          return [...prev, ...newEvents].sort((a, b) => a.start.localeCompare(b.start))
        })
      } else {
        setEvents(parsedEvents)
      }

      loadedRangeRef.current = {
        from: dateFrom < (loadedRangeRef.current.from || dateFrom) ? dateFrom : (loadedRangeRef.current.from || dateFrom),
        to:   dateTo  > (loadedRangeRef.current.to   || dateTo)   ? dateTo   : (loadedRangeRef.current.to   || dateTo),
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err)
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    const fetchCalendarData = async () => {
      const shiftsToFetch = view === 'listMonth' ? ALL_SHIFTS : selectedShifts
      if (shiftsToFetch.length === 0) { setEvents([]); loadedRangeRef.current = { from: null, to: null }; return }
      setLoading(true); setError(null)
      try {
        const today = new Date()
        await fetchDataForRange(
          new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
          new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()),
          shiftsToFetch,
          false
        )
      } finally { setLoading(false) }
    }
    fetchCalendarData()
  }, [selectedShifts, view])

  const isMonthLoaded = (year, month) => {
    if (!loadedRangeRef.current.from || !loadedRangeRef.current.to) return false
    const monthStart = new Date(year, month, 1)
    const monthEnd   = new Date(year, month + 1, 0)
    return monthStart >= loadedRangeRef.current.from && monthEnd <= loadedRangeRef.current.to
  }

  const ensureMonthLoaded = async (year, month) => {
    if (isMonthLoaded(year, month)) return
    const shiftsToFetch = view === 'listMonth' ? ALL_SHIFTS : selectedShifts
    if (shiftsToFetch.length === 0) return
    setLoading(true); setError(null)
    try {
      const targetDate = new Date(year, month, 1)
      const isInPast   = !loadedRangeRef.current.from || targetDate < loadedRangeRef.current.from
      if (isInPast) {
        await fetchDataForRange(new Date(year, month - 12, 1), loadedRangeRef.current.from || new Date(year, month, 1), shiftsToFetch, true)
      } else {
        await fetchDataForRange(loadedRangeRef.current.to || new Date(year, month, 1), new Date(year, month + 13, 0), shiftsToFetch, true)
      }
    } finally { setLoading(false) }
  }

  useEffect(() => {
    if (calendarRef.current) calendarRef.current.getApi().changeView(view)
  }, [view])

  const toggleShift = n => setSelectedShifts(prev => prev.includes(n) ? prev.filter(s => s !== n) : [...prev, n].sort((a,b)=>a-b))
  const selectAll   = () => setSelectedShifts(ALL_SHIFTS)
  const clearAll    = () => setSelectedShifts([])

  return (
    <div className="app">
      <div className="tartan" />
      <header className="app-banner">
        <div className="app-banner-left">
          <div className="app-crest">SC</div>
          <h1 className="app-title">Shift Calendar</h1>
        </div>
      </header>
      <div className="app-toolbar">
        {view !== 'listMonth' && (
          <ShiftToggles
            selectedShifts={selectedShifts}
            onToggle={toggleShift}
            onSelectAll={selectAll}
            onClearAll={clearAll}
          />
        )}
        <ViewSelector currentView={view} onViewChange={setView} />
      </div>
      {error && <div className="app-error">Error loading calendar data: {error}</div>}
      {loading && <div className="app-loading">Loading…</div>}
      <div className="app-calendar">
        {view === 'listMonth' ? (
          <ShiftTableView events={events} onMonthChange={ensureMonthLoaded} />
        ) : selectedShifts.length === 0 ? (
          <div className="app-empty">Select one or more shifts above to view the calendar</div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, listPlugin]}
            initialView={view}
            events={events}
            firstDay={1}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
            height="auto"
            eventDisplay="block"
            displayEventTime={false}
            eventColor="#0a1f44"
            eventClassNames={info => {
              const match = info.event.title.match(/Shift (\d)/)
              return match ? [`shift-event-${match[1]}`] : []
            }}
            datesSet={dateInfo => ensureMonthLoaded(dateInfo.view.currentStart.getFullYear(), dateInfo.view.currentStart.getMonth())}
          />
        )}
      </div>
      <footer className="app-foot">
        <span>Share: <code>{window.location.href}</code></span>
        <span>Subscribe via <code>/calendars/shift{'{n}'}.ics</code></span>
      </footer>
    </div>
  )
}

export default App
