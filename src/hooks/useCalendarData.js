import { useState, useEffect, useRef, useCallback } from 'react'
import { parseICS, ALL_SHIFTS } from '../utils'

export function useCalendarData(selectedShifts, view) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const loadedRangeRef = useRef({ from: null, to: null })

  const fetchDataForRange = useCallback(async (dateFrom, dateTo, shiftsToFetch, append = false) => {
    try {
      const dateFromStr = dateFrom.toISOString().split('T')[0]
      const dateToStr   = dateTo.toISOString().split('T')[0]

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
        to:   dateTo   > (loadedRangeRef.current.to   || dateTo)   ? dateTo   : (loadedRangeRef.current.to   || dateTo),
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err)
      setError(err.message)
      throw err
    }
  }, [])

  useEffect(() => {
    const shiftsToFetch = view === 'listMonth' ? ALL_SHIFTS : selectedShifts
    if (shiftsToFetch.length === 0) {
      loadedRangeRef.current = { from: null, to: null }
      return
    }
    setLoading(true)
    setError(null)
    const today = new Date()
    fetchDataForRange(
      new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
      new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()),
      shiftsToFetch,
      false
    ).finally(() => setLoading(false))
  }, [selectedShifts, view, fetchDataForRange])

  const isMonthLoaded = useCallback((year, month) => {
    if (!loadedRangeRef.current.from || !loadedRangeRef.current.to) return false
    const monthStart = new Date(year, month, 1)
    const monthEnd   = new Date(year, month + 1, 0)
    return monthStart >= loadedRangeRef.current.from && monthEnd <= loadedRangeRef.current.to
  }, [])

  const ensureMonthLoaded = useCallback(async (year, month) => {
    if (isMonthLoaded(year, month)) return
    const shiftsToFetch = view === 'listMonth' ? ALL_SHIFTS : selectedShifts
    if (shiftsToFetch.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const targetDate = new Date(year, month, 1)
      const isInPast   = !loadedRangeRef.current.from || targetDate < loadedRangeRef.current.from
      if (isInPast) {
        await fetchDataForRange(new Date(year, month - 12, 1), loadedRangeRef.current.from || new Date(year, month, 1), shiftsToFetch, true)
      } else {
        await fetchDataForRange(loadedRangeRef.current.to || new Date(year, month, 1), new Date(year, month + 13, 0), shiftsToFetch, true)
      }
    } finally {
      setLoading(false)
    }
  }, [view, selectedShifts, fetchDataForRange, isMonthLoaded])

  const noShiftsSelected = view !== 'listMonth' && selectedShifts.length === 0
  return { events: noShiftsSelected ? [] : events, loading, error, ensureMonthLoaded }
}
