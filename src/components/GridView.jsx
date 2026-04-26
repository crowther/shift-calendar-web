import { useRef, forwardRef, useImperativeHandle } from 'react'
import './GridView.css'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'

const GridView = forwardRef(function GridView({ events, currentDate, onMonthChange }, ref) {
  const calendarRef = useRef(null)

  useImperativeHandle(ref, () => ({
    navigate: (delta) => {
      if (delta < 0) calendarRef.current?.getApi().prev()
      else calendarRef.current?.getApi().next()
    },
  }))

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      initialDate={currentDate}
      events={events}
      firstDay={1}
      headerToolbar={{ left: 'prev,next today', center: '', right: 'title' }}
      height="auto"
      eventDisplay="block"
      displayEventTime={false}
      eventColor="#0a1f44"
      eventClassNames={(info) => {
        const n = info.event.extendedProps.shiftNumber
        return n ? [`shift-event-${n}`] : []
      }}
      eventContent={(info) => {
        const { shiftNumber, shiftType, shiftCode } = info.event.extendedProps
        return (
          <div className="event-inner">
            <span className="event-num">Shift {shiftNumber}</span>
            <span className="event-type">{shiftType}</span>
            <span className="event-code">{shiftCode}</span>
          </div>
        )
      }}
      datesSet={(dateInfo) => {
        const d = dateInfo.view.currentStart
        onMonthChange(new Date(d.getFullYear(), d.getMonth(), 1))
      }}
    />
  )
})

export default GridView
