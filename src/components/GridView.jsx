import { useRef, forwardRef, useImperativeHandle } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'

const GridView = forwardRef(function GridView({ events, currentDate, onMonthChange }, ref) {
  const calendarRef = useRef(null)

  useImperativeHandle(ref, () => ({
    navigate: (delta) => {
      if (delta < 0) calendarRef.current?.getApi().prev()
      else calendarRef.current?.getApi().next()
    }
  }))

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      initialDate={currentDate}
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
      datesSet={dateInfo => {
        const d = dateInfo.view.currentStart
        onMonthChange(new Date(d.getFullYear(), d.getMonth(), 1))
      }}
    />
  )
})

export default GridView
