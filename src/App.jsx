import { useState, useEffect, useRef, useCallback } from 'react'
import {
  getSelectedShiftsFromURL,
  getViewFromURL,
  getMonthFromURL,
  updateURL,
  ALL_SHIFTS,
  toggleShiftInList,
} from './utils'
import { useCalendarData } from './hooks/useCalendarData'
import { useCopyToClipboard } from './hooks/useCopyToClipboard'
import ShiftToggles from './components/ShiftToggles'
import ViewSelector from './components/ViewSelector'
import GridView from './components/GridView'
import ListView from './components/ListView'
import SubscribePage from './components/SubscribePage'
import './App.css'

const SUBSCRIBE_PATH = `${import.meta.env.BASE_URL}subscribe`

function formatBuildInfo() {
  const raw = import.meta.env.VITE_BUILD_DATE
  if (!raw || raw === 'local') return `v${__APP_VERSION__}`
  const d = new Date(raw)
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  return `v${__APP_VERSION__} · Built: ${date} ${time}`
}

function App() {
  const [page, setPage] = useState(() =>
    window.location.pathname === SUBSCRIBE_PATH ? 'subscribe' : 'calendar'
  )
  const [selectedShifts, setSelectedShifts] = useState(() => getSelectedShiftsFromURL())
  const [view, setView] = useState(() => getViewFromURL())
  const [currentDate, setCurrentDate] = useState(() => getMonthFromURL() ?? new Date())
  const gridViewRef = useRef(null)

  const { events, loading, error, ensureMonthLoaded } = useCalendarData(selectedShifts, view)
  const [copied, copyToClipboard] = useCopyToClipboard()

  useEffect(() => {
    if (page === 'subscribe') return
    updateURL(selectedShifts, view, currentDate)
  }, [page, selectedShifts, view, currentDate])

  useEffect(() => {
    const onPop = () =>
      setPage(window.location.pathname === SUBSCRIBE_PATH ? 'subscribe' : 'calendar')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigateTo = useCallback((path) => {
    window.history.pushState({}, '', path)
    setPage(path === SUBSCRIBE_PATH ? 'subscribe' : 'calendar')
  }, [])

  const handleMonthChange = useCallback(
    (newDate) => {
      setCurrentDate(newDate)
      ensureMonthLoaded(newDate.getFullYear(), newDate.getMonth())
    },
    [ensureMonthLoaded]
  )

  const navigateMonth = useCallback(
    (delta) => {
      if (view === 'listMonth') {
        const d = new Date(currentDate)
        d.setMonth(d.getMonth() + delta)
        handleMonthChange(d)
      } else {
        gridViewRef.current?.navigate(delta)
      }
    },
    [view, currentDate, handleMonthChange]
  )

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

  const copyLink = useCallback(() => copyToClipboard(window.location.href), [copyToClipboard])

  const handlePrint = useCallback(() => {
    const style = document.createElement('style')
    style.textContent =
      view === 'listMonth'
        ? '@page { size: A4 portrait; margin: 0.5cm; }'
        : '@page { size: A4 landscape; margin: 0.5cm; }'
    document.head.appendChild(style)
    window.print()
    document.head.removeChild(style)
  }, [view])

  const toggleShift = (n) => setSelectedShifts((prev) => toggleShiftInList(prev, n))
  const selectAll = () => setSelectedShifts(ALL_SHIFTS)
  const clearAll = () => setSelectedShifts([])

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
          <button className="back-button" onClick={() => navigateTo(import.meta.env.BASE_URL)}>
            ↖ Calendar
          </button>
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
      {page === 'calendar' && error && (
        <div className="app-error">Error loading calendar data: {error}</div>
      )}
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
        <span className="app-foot-share">
          <span className="app-foot-url" onClick={copyLink} title="Click to copy">
            Share: <code>{copied ? 'Copied!' : window.location.href}</code>
          </span>
          <button className="copy-link-button app-foot-copy" onClick={copyLink}>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </span>
        <span className="app-foot-build">{formatBuildInfo()}</span>
        <span className="app-foot-right">
          {page !== 'subscribe' && (
            <>
              <button className="print-button" onClick={handlePrint}>
                Print / Save as PDF
              </button>
              <button className="subscribe-link" onClick={() => navigateTo(SUBSCRIBE_PATH)}>
                Subscribe to iCal ↗
              </button>
            </>
          )}
        </span>
      </footer>
    </div>
  )
}

export default App
