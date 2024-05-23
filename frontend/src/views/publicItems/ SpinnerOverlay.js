// SpinnerOverlay.js
import React from 'react'
import { BarLoader } from 'react-spinners'

const SpinnerOverlay = (loading) => {
  const message = loading.message
  return (
    <div style={overlayStyle(loading)}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <BarLoader loading={loading} color="#36D7B7" />
        {message ? <p style={{ margin: 'auto' }}>{message}</p> : ''}
      </div>
    </div>
  )
}

const overlayStyle = (loading) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  display: loading ? 'flex' : 'none',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
})

export default SpinnerOverlay
