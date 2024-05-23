import React, { useState, useEffect } from 'react'
import { Calendar, globalizeLocalizer } from 'react-big-calendar'
import globalize from 'globalize'
import { getFetch } from 'src/api/Api'
import PropTypes from 'prop-types'
import SpinnerOverlay from 'src/views/publicItems/ SpinnerOverlay'
// import EventComponent from 'src/components/EventComponent'
import { useNavigate } from 'react-router-dom'

const localizer = globalizeLocalizer(globalize)

const DoctorsCalendar = () => {
  let API_URL = process.env.REACT_APP_API_URL
  const [visibleRange, setVisibleRange] = useState({ start: new Date(), end: new Date() })
  const [appointments, setAppointments] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleNavigate = (date, view) => {
    let start, end

    if (view === 'month') {
      start = new Date(date.getFullYear(), date.getMonth(), 1)
      end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    } else if (view === 'week') {
      const firstDayOfWeek = date.getDate() - date.getDay()
      start = new Date(date.getFullYear(), date.getMonth(), firstDayOfWeek)
      const lastDayOfWeek = firstDayOfWeek + 6
      end = new Date(date.getFullYear(), date.getMonth(), lastDayOfWeek)
    } else {
      start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      end = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    }

    setVisibleRange({ start, end })
  }

  const handleViewChange = (view) => {
    const currentDate = new Date()
    handleNavigate(currentDate, view)
  }

  const dateSubmit = async (e) => {
    try {
      setLoading(true)
      const res = await getFetch(
        `${API_URL}/api/patient/nextAppointmentDate?startDate=${visibleRange.start}&endDate=${
          visibleRange.end
        }&resultPerPage=${1000}`,
      )
      if (res?.status === 200) {
        setAppointments(res?.data?.data)
        setLoading(false)
      } else {
        console.log('No patient appointment found')
        setLoading(false)
      }
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  useEffect(() => {
    const currentDate = new Date()
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    setVisibleRange({ start: start, end: end })
  }, [])

  useEffect(() => {
    dateSubmit()
  }, [visibleRange])

  useEffect(() => {
    console.log(appointments)
  }, [appointments])

  const events =
    appointments && Array.isArray(appointments)
      ? appointments.map((appointment) => ({
          title: `${appointment.name}'s Appointment`,
          start: new Date(appointment.nextApointmentDate),
          end: new Date(appointment.nextApointmentDate),
          appointmentData: appointment,
        }))
      : []
  const eventFormats = {
    eventTimeRangeFormat: () => null, // Hides event times
  }

  // const handleEventClick = (data) => {
  //   const crn = data?.appointmentData.crn
  //   console.log('CRN', crn)
  //   navigate(`/patientPage?crn=${crn}`, { state: data?.appointmentData })
  // }
  const handleEventClick = (data) => {
    const crn = data?.appointmentData.crn
    const url = `/patientPage?crn=${crn}`
    window.open(url, '_blank')
  }
  return (
    <div style={{ height: '85vh' }}>
      {loading && <SpinnerOverlay message="Loading Calendar" />}
      <Calendar
        localizer={localizer}
        startAccessor="start"
        endAccessor="end"
        // style={{ height: 500 }}
        date={visibleRange.start}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        events={events}
        formats={eventFormats}
        defaultView="week"
        onSelectEvent={handleEventClick}
        // tooltipAccessor={(event) => event.title}
      />
    </div>
  )
}

export default DoctorsCalendar
