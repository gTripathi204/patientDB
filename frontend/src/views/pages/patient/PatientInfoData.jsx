import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import PatientShowDetails from './PatientShowDetails'
import PatientAddNewRecord from './PatientAddNewRecord'

const PatientInfoData = ({ patientSearch, getSearchByPatient }) => {
  // console.log('patientSearch', patientSearch)
  // console.log('getSearchByPatient', getSearchByPatient)

  const [isAddNewDiagnosis, setIsAddNewDiagnosis] = useState(false)
  const [isDetails, setIsDetailed] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [addDiagnosisPatientId, setAddDiagnosisPatientId] = useState('')

  const handleToggleDetails = (patientId) => {
    setSelectedPatientId((prevState) => (prevState === patientId ? '' : patientId))
    setAddDiagnosisPatientId('')
    // setIsAddNewDiagnosis(false)
    setIsDetailed(true)
  }

  const handleAddDiagnosis = (patientId) => {
    setAddDiagnosisPatientId(patientId)
    setSelectedPatientId(patientId)
    setIsAddNewDiagnosis(true)
    setIsDetailed(false)
  }

  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth <= 768) // Adjust the breakpoint as needed
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div>
      {isSmallScreen ? (
        <>
          {patientSearch?.map((patient) => {
            const { name, crn, phone, age, sex, diagnosis, _id, desc, nextApointmentDate } = patient
            const isDetailsOpen = selectedPatientId === _id
            const isAddDiagnosisOpen = addDiagnosisPatientId === _id
            const inputDate = nextApointmentDate
            const diagnosisProp = diagnosis
            const date = new Date(inputDate)
            const formattedDate = date
              .toLocaleString('en-IN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
              .replace(/\//g, '/')

            return (
              <div key={_id}>
                <div style={{ marginTop: '2rem' }}>
                  <div className="card" style={{ width: '100%' }}>
                    <div className="card-body overflow-auto ">
                      <div className="row" style={{ marginBottom: '1rem' }}>
                        <div style={{ width: '40%' }}>
                          <span>
                            <span className="boldFont">CR No :</span> {crn}
                          </span>
                          <br />
                          <span>
                            <span className="boldFont">Age : </span> {age}
                          </span>
                          <br />
                          <span>
                            <span className="boldFont">Sex. </span> {sex}
                          </span>
                        </div>
                        <div style={{ width: '60%' }}>
                          <span>
                            <span className="boldFont">Name : </span> {name}
                          </span>
                          <br />
                          <span>
                            <span className="boldFont">Mob. No.</span> {phone}
                          </span>
                          <br />
                          <span>
                            <span className="boldFont">Next Appointment Date.</span>{' '}
                            {nextApointmentDate ? formattedDate : '-'}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-success patientInfoButton"
                          onClick={() => handleToggleDetails(_id)}
                          // style={{ fontSize: '15px', whiteSpace: 'none', padding: '5px 10px' }}
                        >
                          Show Diagnosis
                        </button>
                        <button
                          type="button"
                          className="btn btn-warning"
                          style={{ marginLeft: '2rem' }}
                          onClick={() => handleAddDiagnosis(_id)}
                        >
                          {diagnosis ? 'Add New Follow-Up' : 'Add New Diagnosis'}
                        </button>
                      </div>

                      {isDetailsOpen && isDetails && (
                        <div>
                          <PatientShowDetails diagnosis={diagnosis} desc={desc} />
                        </div>
                      )}
                      {isAddDiagnosisOpen && isAddNewDiagnosis && (
                        <div>
                          <PatientAddNewRecord
                            _id={_id}
                            getSearchByPatient={getSearchByPatient}
                            setIsAddNewDiagnosis={setIsAddNewDiagnosis}
                            setIsDetailed={setIsDetailed}
                            diagnosisProp={diagnosisProp}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </>
      ) : (
        <div className="mb-4">
          {patientSearch?.map((patient) => {
            const { name, crn, phone, age, sex, diagnosis, _id, desc, nextApointmentDate } = patient
            const isDetailsOpen = selectedPatientId === _id
            const isAddDiagnosisOpen = addDiagnosisPatientId === _id
            const inputDate = nextApointmentDate
            const diagnosisProp = diagnosis
            const date = new Date(inputDate)
            const formattedDate = date
              .toLocaleString('en-IN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
              .replace(/\//g, '/')

            return (
              <div key={_id} className="row">
                <div style={{ marginTop: '2rem' }}>
                  <div className="card" style={{ width: '100%' }}>
                    <div className="card-body overflow-auto ">
                      <h5 className="card-title"> CR No : {crn}</h5>
                      <h6 className="card-subtitle mt-2">
                        <h5>Name : {name}</h5>
                      </h6>
                      <div style={{ display: 'flex', marginTop: '1rem' }}>
                        {/* <p className="card-text">CRN No. {crn}</p> */}
                        <span style={{ display: 'flex' }}>
                          <h6>Phone No. &nbsp;</h6>{' '}
                          <h6 style={{ fontWeight: 'normal' }}>{phone}</h6>
                        </span>
                        <span style={{ display: 'flex', marginLeft: '2rem' }}>
                          <h6>Age. &nbsp;</h6> <h6 style={{ fontWeight: 'normal' }}>{age}</h6>
                        </span>
                        <span style={{ display: 'flex', marginLeft: '2rem' }}>
                          <h6> Sex. &nbsp;</h6> <h6 style={{ fontWeight: 'normal' }}>{sex}</h6>
                        </span>
                        <span style={{ display: 'flex', marginLeft: '2rem' }}>
                          <h6>Next Appointment Date. &nbsp;</h6>{' '}
                          <h6 style={{ fontWeight: 'normal' }}>
                            {nextApointmentDate ? formattedDate : '-'}
                          </h6>
                        </span>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() => handleToggleDetails(_id)}
                          style={{ fontSize: '15px', whiteSpace: 'none', padding: '5px 10px' }}
                        >
                          Show Diagnosis
                        </button>
                        <button
                          type="button"
                          className="btn btn-warning"
                          style={{ marginLeft: '2rem' }}
                          onClick={() => handleAddDiagnosis(_id)}
                        >
                          {diagnosis ? 'Add New Follow-Up' : 'Add New Diagnosis'}
                        </button>
                      </div>

                      {isDetailsOpen && isDetails && (
                        <div>
                          <PatientShowDetails diagnosis={diagnosis} desc={desc} />
                        </div>
                      )}
                      {isAddDiagnosisOpen && isAddNewDiagnosis && (
                        <div>
                          <PatientAddNewRecord
                            _id={_id}
                            getSearchByPatient={getSearchByPatient}
                            setIsAddNewDiagnosis={setIsAddNewDiagnosis}
                            setIsDetailed={setIsDetailed}
                            diagnosisProp={diagnosisProp}
                          />
                          <PatientShowDetails diagnosis={diagnosis} desc={desc} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

PatientInfoData.propTypes = {
  patientSearch: PropTypes.array.isRequired,
  getSearchByPatient: PropTypes.func.isRequired,
}

export default PatientInfoData
