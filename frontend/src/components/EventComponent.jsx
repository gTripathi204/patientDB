// import React from 'react'
// import PropTypes from 'prop-types'

// const EventComponent = ({ event }) => {
//   console.log('Event Component ', event)
//   return (
//     <div className="event-container">
//       <strong>{event.title}</strong>
//       <p>CRN Number: {event.details.CRN_Number}</p>
//       <p>Phone Number: {event.details.Phone_Number}</p>
//       {/* Add more details here as needed */}
//     </div>
//   )
// }

// EventComponent.propTypes = {
//   event: PropTypes.shape({
//     title: PropTypes.string.isRequired,
//     start: PropTypes.instanceOf(Date).isRequired,
//     end: PropTypes.instanceOf(Date).isRequired,
//     details: PropTypes.shape({
//       CRN_Number: PropTypes.string.isRequired,
//       sex: PropTypes.string.isRequired,
//       Phone_Number: PropTypes.string.isRequired,
//     }).isRequired,
//   }).isRequired,
// }

// export default EventComponent
// import { Popover } from 'react-bootstrap'

import React, { useState } from 'react'
import PropTypes from 'prop-types'

const EventComponent = ({ event }) => {
  const [showPopover, setShowPopover] = useState(false)

  const handleMouseEnter = () => {
    setShowPopover(true)
  }

  const handleMouseLeave = () => {
    setShowPopover(false)
  }

  console.log('gaurav', event)

  return (
    <div
      className="event-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <strong>{event.title}</strong>
      {showPopover && (
        <div className="popover" style={{ position: 'absolute', zIndex: 9999 }}>
          <div className="popover-content">
            <p>CRN Number: {event.details.CRN_Number}</p>
            <p>Phone Number: {event.details.Phone_Number}</p>
          </div>
        </div>
      )}
    </div>
  )
}

EventComponent.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string.isRequired,
    start: PropTypes.instanceOf(Date).isRequired,
    end: PropTypes.instanceOf(Date).isRequired,
    details: PropTypes.shape({
      CRN_Number: PropTypes.string.isRequired,
      sex: PropTypes.string.isRequired,
      Phone_Number: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
}

export default EventComponent
