import { useState } from 'react'
import { ALL_SHIFTS, toggleShiftInList, buildCalendarPath } from '../utils'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import ShiftToggles from './ShiftToggles'
import './SubscribePage.css'

function CopyButton({ url }) {
  const [copied, copy] = useCopyToClipboard()
  return (
    <button className="sub-copy-btn" onClick={() => copy(url)}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function UrlRow({ label, url, className }) {
  return (
    <div className={['sub-row', className].filter(Boolean).join(' ')}>
      <span className="sub-label">{label}</span>
      <span className="sub-url"><code>{url}</code></span>
      <CopyButton url={url} />
    </div>
  )
}

function SubscribePage() {
  const [selectedShifts, setSelectedShifts] = useState([...ALL_SHIFTS])
  const base = window.location.origin + import.meta.env.BASE_URL.slice(0, -1)

  const toggleShift = (n) => setSelectedShifts((prev) => toggleShiftInList(prev, n))

  const customUrl =
    selectedShifts.length === 0 ? null : `${base}/${buildCalendarPath(selectedShifts)}`

  return (
    <div className="subscribe-page">
      <p className="subscribe-intro">
        Subscribe to a shift calendar from any app that supports iCal. The calendar will populate indefinitely.
      </p>

      <div className="sub-section">
        <div className="sub-section-header">Shift calendars</div>
        <div className="sub-table">
          <UrlRow label="All shifts" url={`${base}/${buildCalendarPath(ALL_SHIFTS)}`} />
          {ALL_SHIFTS.map((n) => (
            <UrlRow
              key={n}
              label={`Shift ${n}`}
              url={`${base}/${buildCalendarPath([n])}`}
              className={`sub-shift-${n}`}
            />
          ))}
        </div>
      </div>

      <div className="sub-section">
        <div className="sub-section-header">Custom combination</div>
        <div className="sub-table">
          <div className="sub-toggles-row">
            <ShiftToggles
              selectedShifts={selectedShifts}
              onToggle={toggleShift}
              onSelectAll={() => setSelectedShifts([...ALL_SHIFTS])}
            />
          </div>
          {customUrl ? (
            <UrlRow label="Your URL" url={customUrl} />
          ) : (
            <div className="sub-row sub-empty">Select at least one shift above</div>
          )}
        </div>
      </div>

      <div className="sub-section">
        <div className="sub-section-header">How to subscribe</div>
        <div className="sub-table sub-instructions">
          <div className="sub-row">
            <span className="sub-label">iPhone</span>
            <span className="sub-instruction">
              Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar
            </span>
          </div>
          <div className="sub-row">
            <span className="sub-label">Android</span>
            <span className="sub-instruction">
              Open calendar.google.com in a browser → Other calendars (+) → From URL
              <span className="sub-instruction-note">
                The Google Calendar app does not support subscribing directly — add it via the
                website and it will sync to your phone.
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscribePage
