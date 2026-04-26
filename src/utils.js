export const ALL_SHIFTS = [1, 2, 3, 4, 5]

const getParams = () => new URLSearchParams(window.location.search)

export function toggleShiftInList(list, n) {
  return list.includes(n) ? list.filter((s) => s !== n) : [...list, n].sort((a, b) => a - b)
}

export function buildCalendarPath(shifts) {
  if (shifts.length === ALL_SHIFTS.length) return 'calendars/all_shifts.ics'
  if (shifts.length === 1) return `calendars/shift${shifts[0]}.ics`
  return `calendars/shift${shifts.join(',')}.ics`
}

export function parseICS(icsText) {
  const events = []
  const lines = icsText.split(/\r\n|\n|\r/)
  let currentEvent = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line === 'BEGIN:VEVENT') {
      currentEvent = {}
    } else if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.start && currentEvent.title) {
        events.push({
          title: currentEvent.title,
          start: currentEvent.start,
          end: currentEvent.end,
          allDay: true,
          shiftNumber: currentEvent.shiftNumber,
          shiftType: currentEvent.shiftType,
          shiftCode: currentEvent.shiftCode,
        })
      }
      currentEvent = null
    } else if (currentEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.slice(8)
      } else if (line.startsWith('DTSTART')) {
        const dateMatch = line.match(/[:;](\d{8})/)
        if (dateMatch) currentEvent.start = formatICSDate(dateMatch[1])
      } else if (line.startsWith('DTEND')) {
        const dateMatch = line.match(/[:;](\d{8})/)
        if (dateMatch) currentEvent.end = formatICSDate(dateMatch[1])
      } else if (line.startsWith('X-SHIFT-NUMBER:')) {
        currentEvent.shiftNumber = parseInt(line.slice(15))
      } else if (line.startsWith('X-SHIFT-TYPE:')) {
        currentEvent.shiftType = line.slice(13)
      } else if (line.startsWith('X-SHIFT-CODE:')) {
        currentEvent.shiftCode = line.slice(13)
      }
    }
  }

  return events
}

function formatICSDate(icsDate) {
  return `${icsDate.slice(0, 4)}-${icsDate.slice(4, 6)}-${icsDate.slice(6, 8)}`
}

export function getSelectedShiftsFromURL() {
  const params = getParams()
  const shiftsParam = params.get('shifts')
  if (!shiftsParam) return []
  return shiftsParam
    .split('-')
    .map((s) => parseInt(s.trim()))
    .filter((s) => s >= 1 && s <= 5)
    .sort((a, b) => a - b)
}

export function getViewFromURL() {
  const params = getParams()
  const v = params.get('view')
  if (v === 'list') return 'listMonth'
  if (v === 'grid') return 'dayGridMonth'
  return window.innerWidth < 600 ? 'listMonth' : 'dayGridMonth'
}

export function getMonthFromURL() {
  const params = getParams()
  const m = params.get('month')
  if (!m) return null
  const [year, month] = m.split('-').map(Number)
  if (!year || !month) return null
  return new Date(year, month - 1, 1)
}

export function updateURL(selectedShifts, view, date) {
  const params = new URLSearchParams()
  if (view === 'listMonth') {
    params.set('view', 'list')
  } else {
    params.set('view', 'grid')
    if (selectedShifts.length > 0) params.set('shifts', selectedShifts.join('-'))
  }
  if (date) {
    params.set('month', `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
  }
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
}
