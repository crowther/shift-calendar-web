export const ALL_SHIFTS = [1, 2, 3, 4, 5]

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
        })
      }
      currentEvent = null
    } else if (currentEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.substring(8)
      } else if (line.startsWith('DTSTART')) {
        const dateMatch = line.match(/[:;](\d{8})/)
        if (dateMatch) currentEvent.start = formatICSDate(dateMatch[1])
      } else if (line.startsWith('DTEND')) {
        const dateMatch = line.match(/[:;](\d{8})/)
        if (dateMatch) currentEvent.end = formatICSDate(dateMatch[1])
      }
    }
  }

  return events
}

function formatICSDate(icsDate) {
  return `${icsDate.slice(0, 4)}-${icsDate.slice(4, 6)}-${icsDate.slice(6, 8)}`
}

export function getSelectedShiftsFromURL() {
  const params = new URLSearchParams(window.location.search)
  const shiftsParam = params.get('shifts')
  if (!shiftsParam) return []
  return shiftsParam
    .split('-')
    .map((s) => parseInt(s.trim()))
    .filter((s) => s >= 1 && s <= 5)
    .sort((a, b) => a - b)
}

export function getViewFromURL() {
  const params = new URLSearchParams(window.location.search)
  return params.get('view') === 'list' ? 'listMonth' : 'dayGridMonth'
}

export function getMonthFromURL() {
  const params = new URLSearchParams(window.location.search)
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
