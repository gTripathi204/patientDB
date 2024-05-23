import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilArrowCircleRight, cilDataTransferDown } from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import SpinnerOverlay from 'src/views/publicItems/ SpinnerOverlay'

const ReportModal = ({ setHide, popupData, problemSet }) => {
  console.log('fromMOdal', popupData, problemSet)
  let diagnosis = popupData?.diagnosis
  let url = process.env.REACT_APP_API_URL

  const [reversedDiagnosis, setReversedDiagnosis] = useState([])
  const [selectedFile, setSelectedFile] = useState(Array(diagnosis?.length).fill(''))
  const [loading, setLoading] = useState(false)

  const isFile = (value) => {
    const regex = /^\d{13}_/

    if (regex.test(value)) {
      return true
    } else {
      return false
    }
  }

  const showReportHandler = async (filename, index) => {
    try {
      setLoading(true)
      // Fetch the image data from the server
      const response = await axios.get(`${url}/api/user/getPatientReport/${filename}`, {
        responseType: 'blob', // Treat response data as blob
      })

      // Create a Blob object from the response data
      const blob = new Blob([response.data], { type: response.headers['content-type'] })

      // Generate a URL for the Blob
      const blobUrl = URL.createObjectURL(blob)

      // Open the URL in a new tab
      window.open(blobUrl)
    } catch (error) {
      console.error('Error fetching image:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (diagnosis && Array.isArray(diagnosis)) {
      setReversedDiagnosis([...diagnosis].reverse())
    }
  }, [diagnosis])

  const handleFileSelect = (e, index) => {
    const { value } = e.target
    const updatedSelectedFile = [...selectedFile]
    updatedSelectedFile[index] = value
    setSelectedFile(updatedSelectedFile)
  }
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

  const [hoveredFile, setHoveredFile] = useState(null)

  const handleMouseEnter = (fileName) => {
    const fileNamee = editNameFun(fileName)
    setHoveredFile(fileNamee)
  }

  const handleMouseLeave = () => {
    setHoveredFile(null)
  }

  return (
    <>
      <div
        className="modal modal-xl"
        tabIndex={-1}
        style={{
          display: 'block',
          backgroundColor: 'rgba(0,0,0,0.8)',
          maxHeight: '100%',
          color: 'black',
        }}
      >
        <div
          className="modal-dialog"
          // style={{ height: '30rem', width: '60rem', minWidth: '70rem' }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h5 className="modal-title">Diagnosis Details</h5>
                <p style={{ fontSize: '14px' }}>
                  <span style={{ fontWeight: 'bolder' }}>CR no.</span> {popupData?.crn}{' '}
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <span style={{ fontWeight: 'bolder' }}>Name : </span>
                  {popupData?.name}
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setHide(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  maxHeight: '300px',
                  overflowY: 'scroll',
                  overflowX: 'hidden',
                  marginTop: '20px',
                  padding: '0',
                }}
              >
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
                  let showProcedure = false
                  let showNotes = false

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
                                <th
                                  scope="col"
                                  className="tableTitle"
                                  style={{ background: '#FBF295' }}
                                >
                                  Problems
                                </th>
                                <th
                                  scope="col"
                                  className="tableTitle"
                                  style={{ background: '#FBF295' }}
                                >
                                  Sub Problem
                                </th>
                                <th
                                  scope="col"
                                  className="tableTitle"
                                  style={{ background: '#FBF295' }}
                                >
                                  Tests
                                </th>
                                <th
                                  scope="col"
                                  className="tableTitle"
                                  style={{ background: '#FBF295' }}
                                >
                                  Scales
                                </th>
                              </tr>
                            </thead>

                            {elem?.diagnosData?.map((element, innerIndex) => {
                              const { problem, subProblem, scale, test } = element
                              if (!problemSet.includes(problem)) {
                                // Skip rendering this problem if it's not included in problemSet
                                return null
                              }
                              showProcedure = true
                              showNotes = true
                              return (
                                <tbody key={innerIndex} style={{ borderBottom: '1px solid' }}>
                                  {loading && <SpinnerOverlay message="Opening File" />}
                                  {problemSet.includes(problem) ? (
                                    <>
                                      <td style={{ fontWeight: 'bolder' }}>
                                        &nbsp;&nbsp;{problem}
                                      </td>
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
                                                  {testData.name} :
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
                                                              const editedName = editNameFun(
                                                                file.fileName,
                                                              )
                                                              setHoveredFile(editedName)
                                                            }}
                                                            onMouseLeave={() => setHoveredFile('')}
                                                            onClick={() =>
                                                              showReportHandler(
                                                                file?.fileName,
                                                                fileIndex,
                                                              )
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
                                                  {scaleData.name}:
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
                                    </>
                                  ) : null}
                                  <hr style={{ width: '100%' }} />
                                </tbody>
                              )
                            })}
                          </table>

                          {elem?.procedure?.length !== 0 && showProcedure ? (
                            <table
                              className="table"
                              style={{
                                width: '100%',
                                border: '1px solid',
                                fontFamily: 'ui-rounded',
                                borderRadius: '10px',
                              }}
                            >
                              <tbody>
                                <tr>
                                  <td colSpan="4">
                                    <h5 style={{ fontWeight: 'bolder' }}>Procedures:</h5>
                                  </td>
                                </tr>
                                <tr>
                                  <td style={{ background: '#FBF295', fontWeight: 'bold' }}>
                                    &nbsp;&nbsp;Name
                                  </td>
                                  <td style={{ background: '#FBF295', fontWeight: 'bold' }}>
                                    Complications
                                  </td>
                                  <td style={{ background: '#FBF295', fontWeight: 'bold' }}>
                                    Done By
                                  </td>
                                  <td style={{ background: '#FBF295', fontWeight: 'bold' }}>
                                    Date
                                  </td>
                                </tr>
                                {elem?.procedure?.map((procedureData, procedureIndex) => {
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
                              </tbody>
                            </table>
                          ) : null}

                          {showNotes && (
                            <div className="row" style={{ margin: '1rem auto 1rem 0' }}>
                              <div>
                                <div className="row">
                                  <div className="card" style={{ padding: '1rem 2rem' }}>
                                    <div className="d-flex">
                                      <p style={{ margin: '0' }}>
                                        {' '}
                                        Notes :&nbsp;&nbsp;&nbsp;
                                        {elem.desc === '' ? '-' : elem.desc}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* <hr style={{ width: '100%' }} /> */}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => setHide(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

ReportModal.propTypes = {
  setHide: PropTypes.func.isRequired,
  popupData: PropTypes.func.isRequired,
  problemSet: PropTypes.func.isRequired,
}

export default ReportModal
