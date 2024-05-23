import * as React from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

const AddPatientLoader = () => {
  return (
    <Box
      style={{
        width: '100%',
        height: '100%',
        lineHeight: '20vh',
        textAlign: 'center',
        marginTop: '10px',
      }}
    >
      <CircularProgress />
    </Box>
  )
}

export default AddPatientLoader
