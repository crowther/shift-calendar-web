import { useState, useEffect, useRef, useCallback } from 'react'
import { getSelectedShiftsFromURL, getViewFromURL, getMonthFromURL, updateURL, ALL_SHIFTS } from './utils'
import { useCalendarData } from './hooks/useCalendarData'
import ShiftToggles from './components/ShiftToggles'
import ViewSelector from './components/ViewSelector'
import GridView from './components/GridView'
import ListView from './components/ListView'
import SubscribePage from './components/SubscribePage'
import './App.css'

function App() {
  const [page, setPage] = useState(() => window.location.pathname === '/subscribe' ? 'subscribe' : 'calendar')
  const [selectedShifts, setSelectedShifts] = useState(() => getSelectedShiftsFromURL())
  const [view, setView] = useState(() => getViewFromURL())
  const [currentDate, setCurrentDate] = useState(() => getMonthFromURL() ?? new Date())
  const gridViewRef = useRef(null)

  const { events, loading, error, ensureMonthLoaded } = useCalendarData(selectedShifts, view)

  useEffect(() => {
    if (page === 'subscribe') return
    updateURL(selectedShifts, view, currentDate)
  }, [page, selectedShifts, view, currentDate])

  useEffect(() => {
    const onPop = () => setPage(window.location.pathname === '/subscribe' ? 'subscribe' : 'calendar')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigateTo = useCallback((path) => {
    window.history.pushState({}, '', path)
    setPage(path === '/subscribe' ? 'subscribe' : 'calendar')
  }, [])

  const handleMonthChange = useCallback((newDate) => {
    setCurrentDate(newDate)
    ensureMonthLoaded(newDate.getFullYear(), newDate.getMonth())
  }, [ensureMonthLoaded])

  const navigateMonth = useCallback((delta) => {
    if (view === 'listMonth') {
      const d = new Date(currentDate)
      d.setMonth(d.getMonth() + delta)
      handleMonthChange(d)
    } else {
      gridViewRef.current?.navigate(delta)
    }
  }, [view, currentDate, handleMonthChange])

  useEffect(() => {
    const onKey = (e) => {
      if (page === 'subscribe') return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft') navigateMonth(-1)
      else if (e.key === 'ArrowRight') navigateMonth(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [page, navigateMonth])

  const toggleShift = n => setSelectedShifts(prev => prev.includes(n) ? prev.filter(s => s !== n) : [...prev, n].sort((a, b) => a - b))
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
        {page === 'subscribe' ? (
          <button className="back-button" onClick={() => navigateTo('/')}>← Calendar</button>
        ) : (
          <>
            {view !== 'listMonth' && (
              <ShiftToggles
                selectedShifts={selectedShifts}
                onToggle={toggleShift}
                onSelectAll={selectAll}
                onClearAll={clearAll}
              />
            )}
            <ViewSelector currentView={view} onViewChange={setView} />
          </>
        )}
      </div>
      {page === 'calendar' && error   && <div className="app-error">Error loading calendar data: {error}</div>}
      {page === 'calendar' && loading && <div className="app-loading">Loading…</div>}
      <div className="app-calendar">
        {page === 'subscribe' ? (
          <SubscribePage />
        ) : view === 'listMonth' ? (
          <ListView events={events} currentDate={currentDate} onMonthChange={handleMonthChange} />
        ) : selectedShifts.length === 0 ? (
          <div className="app-empty">Select one or more shifts above to view the calendar</div>
        ) : (
          <GridView
            ref={gridViewRef}
            events={events}
            currentDate={currentDate}
            onMonthChange={handleMonthChange}
          />
        )}
      </div>
      <footer className="app-foot">
        <span>Share: <code>{window.location.href}</code></span>
        {page !== 'subscribe' && (
          <button className="subscribe-link" onClick={() => navigateTo('/subscribe')}>Subscribe to iCal ↗</button>
        )}
      </footer>
    </div>
  )
}

export default App
