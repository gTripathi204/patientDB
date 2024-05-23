import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilDataTransferDown, cilPlus } from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import SpinnerOverlay from 'src/views/publicItems/ SpinnerOverlay'
import { CButton } from '@coreui/react'

const PatientShowDetails = ({ diagnosis }) => {
  // console.log('Guarva', diagnosis)
  const [reversedDiagnosis, setReversedDiagnosis] = useState([])
  const [loading, setLoading] = useState(false)
  const [requestedFileLoading, setRequestedFileLoading] = useState({})
  // const [selectedFile, setSelectedFile] = useState(Array(diagnosis?.length).fill(''))

  useEffect(() => {
    if (diagnosis && Array.isArray(diagnosis)) {
      const reversed = [...diagnosis].reverse()
      setReversedDiagnosis(reversed)
    }
  }, [diagnosis])

  const showReportHandler = async (filename, index) => {
    try {
      setLoading(true)

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/getPatientReport/${filename}`,
        {
          responseType: 'blob',
        },
      )

      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl)
    } catch (error) {
      setLoading(false)
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  // const handleFileSelect = (e, index) => {
  //   const { value } = e.target
  //   const updatedSelectedFile = [...selectedFile]
  //   updatedSelectedFile[index] = value
  //   setSelectedFile(updatedSelectedFile)
  // }
  const editNameFun = (name) => {
    if (name) {
      const fileName = name
      const parts = fileName.split('_')
      // Check if the file name contains underscores
      if (parts.length > 1) {
        // Exclude the first part of the file name and join the rest with underscores
        const editedFileName = parts.slice(1).join('_')
        const actualFileName = editedFileName.split('.')[0]
        return actualFileName
      } else {
        // If there are no underscores or only one part, return the original file name
        return fileName
      }
    } else {
      // If the file name is undefined, return an empty string
      return ''
    }
  }
  // console.log('guarva', reversedDiagnosis)

  const [hoveredFile, setHoveredFile] = useState(null)

  return (
    <div style={{ maxHeight: '300px', marginTop: '20px' }}>
      {reversedDiagnosis?.map((elem, index) => {
        const date = new Date(elem.date)
        const formattedDate = date
          .toLocaleDateString('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
          .replace(/\//g, '/')

        return (
          <div key={index} style={{ margin: '1rem' }}>
            <div className="row" style={{ overflowX: 'auto' }}>
              <div style={{ overflow: 'auto !important' }}>
                <h5>Diagnose Date: {formattedDate}</h5>

                <table
                  className="table"
                  style={{
                    width: '100%',
                    border: '1px solid',
                    fontFamily: 'ui-rounded',
                    borderRadius: '10px',
                  }}
                >
                  <colgroup>
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '30%' }} />
                    <col style={{ width: '30%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col" className="tableTitle" style={{ background: '#FBF295' }}>
                        Problems
                      </th>
                      <th scope="col" className="tableTitle" style={{ background: '#FBF295' }}>
                        Sub Problem
                      </th>
                      <th scope="col" className="tableTitle" style={{ background: '#FBF295' }}>
                        Tests
                      </th>
                      <th scope="col" className="tableTitle" style={{ background: '#FBF295' }}>
                        Scales
                      </th>
                    </tr>
                  </thead>
                  {elem?.diagnosData?.map((element, innerIndex) => {
                    const { problem, subProblem, scale, test } = element
                    console.log('hgsad', element)
                    return (
                      <>
                        <tbody key={innerIndex}>
                          {loading && <SpinnerOverlay message="Opening File" />}
                          <tr>
                            <td style={{ fontWeight: 'bolder' }}>{problem}</td>
                            <td style={{ fontWeight: 'bolder' }}>
                              {subProblem ? subProblem : '-'}
                            </td>
                            <td>
                              {test.map((testData, testIndex) => (
                                <div key={testIndex}>
                                  {testData.name === '' ? (
                                    '-'
                                  ) : (
                                    <div className="row" style={{ margin: 0 }}>
                                      <td
                                        // className="tableTitle"
                                        style={{
                                          width: '50%',
                                          paddingRight: '10px',
                                          margin: 'auto',
                                          fontWeight: 'bolder',
                                        }}
                                      >
                                        {testData.name}
                                      </td>
                                      <div style={{ width: '50%' }}>
                                        <td style={{ margin: '0', padding: 0 }}>
                                          {testData.testInput !== '' ? (
                                            <td
                                              style={{
                                                width: '40%',
                                                paddingRight: '10px',
                                                margin: 'auto',
                                              }}
                                            >
                                              {testData.testInput}
                                            </td>
                                          ) : (
                                            <div style={{ display: 'flex', margin: 0 }}>
                                              {testData.files?.map((file, fileIndex) => (
                                                <div
                                                  key={fileIndex}
                                                  value={file.fileName}
                                                  style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginRight: '10px',
                                                    margin: '0 5px 0 0', // Adjusted margin for files
                                                  }}
                                                  onMouseEnter={() => {
                                                    const editedName = editNameFun(file.fileName)
                                                    setHoveredFile(editedName)
                                                  }}
                                                  onMouseLeave={() => setHoveredFile('')}
                                                  onClick={() =>
                                                    showReportHandler(file?.fileName, fileIndex)
                                                  }
                                                >
                                                  <button
                                                    type="button"
                                                    className="btn btn-sm btn-primary"
                                                    data-toggle="popover"
                                                    title={hoveredFile}
                                                    style={{ margin: '0' }}
                                                  >
                                                    <CIcon icon={cilDataTransferDown} />
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </td>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </td>
                            <td>
                              {scale.map((scaleData, scaleIndex) => (
                                <div key={scaleIndex}>
                                  {scaleData.name === '' ? (
                                    '-'
                                  ) : (
                                    <div className="row" style={{ margin: 0 }}>
                                      <div
                                        className="col-md-6"
                                        style={{
                                          fontWeight: 'bolder',
                                          paddingRight: '10px',
                                          margin: 'auto',
                                          wordWrap: 'break-word',
                                        }}
                                      >
                                        {scaleData.name}
                                      </div>

                                      <div
                                        className="col-md-6 tableTitle"
                                        style={{
                                          margin: '0',
                                          padding: 0,
                                          wordWrap: 'break-word',
                                        }}
                                      >
                                        {scaleData.value}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </td>
                          </tr>
                        </tbody>
                      </>
                    )
                  })}
                  {elem?.procedure.length !== 0 ? (
                    <>
                      <tr>
                        <td colSpan="4">
                          <h5 style={{ fontWeight: 'bolder' }}>Procedures:</h5>
                        </td>
                      </tr>
                      <tr>
                        {/* <th scope="col" className="tableTitle" style={{ background: '#FBF295' }}> */}
                        <td
                          className="tableTitle"
                          style={{ background: '#FBF295', fontWeight: 'bold' }}
                        >
                          Name
                        </td>
                        <td
                          className="tableTitle"
                          style={{ background: '#FBF295', fontWeight: 'bold' }}
                        >
                          Complications
                        </td>
                        <td
                          className="tableTitle"
                          style={{ background: '#FBF295', fontWeight: 'bold' }}
                        >
                          Done By
                        </td>
                        <td
                          className="tableTitle"
                          style={{ background: '#FBF295', fontWeight: 'bold' }}
                        >
                          Date
                        </td>
                      </tr>
                      {elem?.procedure.map((procedureData, procedureIndex) => {
                        const date = new Date(procedureData.date)
                        const formattedDate = date
                          .toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })
                          .replace(/\//g, '/')
                        return (
                          <tr key={procedureIndex}>
                            <td>&nbsp;&nbsp;{procedureData.name}</td>
                            <td>{procedureData.complications}</td>
                            <td>{procedureData.doneBy}</td>
                            <td>{formattedDate}</td>
                          </tr>
                        )
                      })}
                    </>
                  ) : (
                    ''
                  )}
                </table>

                <div className="row" style={{ margin: '1rem auto 1rem 0' }}>
                  <div>
                    <div className="row">
                      <div className="col-md-11">
                        <div className="card" style={{ padding: '1rem 2rem' }}>
                          <div className="d-flex">
                            <p style={{ margin: '0' }}>
                              {' '}
                              Notes :&nbsp;&nbsp;&nbsp;{elem.desc === '' ? '-' : elem.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-1 justify-content-center align-items-center">
                        <CIcon icon={cilPlus} size="xl"></CIcon>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr style={{ width: '100%' }} />
          </div>
        )
      })}
      <ToastContainer />
    </div>
  )
}

PatientShowDetails.propTypes = {
  diagnosis: PropTypes.array.isRequired,
}

export default PatientShowDetails
