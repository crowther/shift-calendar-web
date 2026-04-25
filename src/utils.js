/**
 * Parse ICS calendar data and convert to FullCalendar event format
 */
export function parseICS(icsText, selectedShifts) {
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
          color: getShiftColor(currentEvent.title, selectedShifts)
        })
      }
      currentEvent = null
    } else if (currentEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.substring(8)
      } else if (line.startsWith('DTSTART')) {
        const dateMatch = line.match(/[:;](\d{8})/)
        if (dateMatch) {
          currentEvent.start = formatICSDate(dateMatch[1])
        }
      } else if (line.startsWith('DTEND')) {
        const dateMatch = line.match(/[:;](\d{8})/)
        if (dateMatch) {
          currentEvent.end = formatICSDate(dateMatch[1])
        }
      }
    }
  }

  return events
}

/**
 * Format ICS date (YYYYMMDD) to ISO date string
 */
function formatICSDate(icsDate) {
  const year = icsDate.substring(0, 4)
  const month = icsDate.substring(4, 6)
  const day = icsDate.substring(6, 8)
  return `${year}-${month}-${day}`
}

/**
 * Get color for shift based on shift number
 */
const SHIFT_COLORS = {
  1: '#e74c3c',
  2: '#3498db',
  3: '#2ecc71',
  4: '#f39c12',
  5: '#9b59b6'
}

function getShiftColor(eventTitle, selectedShifts) {
  // Extract shift number from title (e.g., "Shift 1", "Shift 3")
  const match = eventTitle.match(/Shift (\d)/)
  if (match) {
    const shiftNum = parseInt(match[1])
    return SHIFT_COLORS[shiftNum] || '#3788d8'
  }
  return '#3788d8'
}

/**
 * Get selected shifts from URL query parameters
 */
export function getSelectedShiftsFromURL() {
  const params = new URLSearchParams(window.location.search)
  const shiftsParam = params.get('shifts')

  if (!shiftsParam) {
    return []
  }

  // Parse hyphen-separated shift numbers (e.g., "1-3-5")
  return shiftsParam
    .split('-')
    .map(s => parseInt(s.trim()))
    .filter(s => s >= 1 && s <= 5)
    .sort((a, b) => a - b)
}

/**
 * Get view from URL query parameters
 */
export function getViewFromURL() {
  const params = new URLSearchParams(window.location.search)
  const viewParam = params.get('view')

  // Valid views: 'grid' or 'list'
  if (viewParam === 'list') {
    return 'listMonth'
  }

  // Default to grid view
  return 'dayGridMonth'
}

/**
 * Update URL with selected shifts and view (for shareable links)
 * In list view, shifts parameter is omitted since all shifts are visible
 */
export function updateURL(selectedShifts, view) {
  const params = new URLSearchParams()

  // Add view parameter
  if (view === 'listMonth') {
    params.set('view', 'list')
    // Don't include shifts in list view
  } else {
    params.set('view', 'grid')
    // Include shifts only in grid view
    if (selectedShifts.length > 0) {
      params.set('shifts', selectedShifts.join('-'))
    }
  }

  const newURL = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname

  window.history.replaceState({}, '', newURL)
}
