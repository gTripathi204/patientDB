import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { getFetch, postFetchFile, putFetchData } from 'src/api/Api'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import SpinnerOverlay from 'src/views/publicItems/ SpinnerOverlay'
import CIcon from '@coreui/icons-react'
import { cilMinus, cilPlus, cilTrash } from '@coreui/icons'
import dayjs from 'dayjs'
// import { API_URL } from 'src/constant'

const PatientAddNewRecord = ({
  _id,
  getSearchByPatient,
  setIsAddNewDiagnosis,
  setIsDetailed,
  diagnosisProp,
}) => {
  console.log('Gaurav', diagnosisProp)
  console.log(
    'PEErablem',
    diagnosisProp[0]?.diagnosData[diagnosisProp[0]?.diagnosData?.length - 1]?.problem,
  )
  let API_URL = process.env.REACT_APP_API_URL
  let patientData = localStorage.getItem('patientRecord')
  let patientRecord = JSON.parse(patientData)
  PatientAddNewRecord.propTypes = {
    _id: PropTypes.string.isRequired,
    getSearchByPatient: PropTypes.string.isRequired,
    setIsAddNewDiagnosis: PropTypes.string.isRequired,
    setIsDetailed: PropTypes.string.isRequired,
    diagnosisProp: PropTypes.string.isRequired,
  }
  const currentDate = new Date()
  const [inputs, setInputs] = useState([
    {
      problem: diagnosisProp[0]?.diagnosData[diagnosisProp[0]?.diagnosData?.length - 1]?.problem,
      subProblem: '',
      test: [
        {
          name: '',
          testInput: '',
          files: [],
        },
      ],
      scale: [
        {
          name: '',
          value: '',
        },
      ],
    },
  ])

  const [procedure, setProcedure] = useState([
    {
      name: '',
      complications: '',
      doneBy: '',
      date: dayjs(currentDate),
    },
  ])

  const [lastDiagnosis, setLastDiagnosis] = useState('')
  const [addProcedureToggle, setAddProcedureToggle] = useState(false)
  let [removeAndAddInputProcedure, setremoveAndAddInputProcedure] = useState(false)

  useEffect(() => {
    const lastRecords = diagnosisProp[diagnosisProp.length - 1]
    const lastDiagnosis = lastRecords?.diagnosData[lastRecords?.diagnosData.length - 1]
    setLastDiagnosis(lastDiagnosis)
    console.log('Guarssadva', lastDiagnosis)
    setInputs([
      {
        problem: diagnosisProp[0]?.diagnosData[diagnosisProp[0]?.diagnosData?.length - 1]?.problem,
        subProblem: '',
        test: [
          {
            name: '',
            testInput: '',
            files: [],
          },
        ],
        scale: [
          {
            name: '',
            value: '',
          },
        ],
      },
    ])
  }, [])

  const [startingDate, setStartingDate] = React.useState(null)
  const [patientById, setPatientById] = useState({})
  const [desc, setDesc] = useState('')
  const [formData, setFormData] = useState({
    diagnosis: [],
    desc: '',
  })
  const [diagnosis, setDiagnosis] = useState([])
  let [fileUploadingSpinner, setfileUploadingSpinner] = useState(false)
  const [problems, setProblems] = useState([])
  const [tests, setTests] = useState([])
  const [scales, setScales] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProblems()
  }, [])

  const fetchProblems = async () => {
    try {
      const problemsResponse = await getFetch(
        `${API_URL}/api/problem/${patientRecord?.department_id?._id}`,
      )
      const problemsData = problemsResponse?.data?.data[0]
      if (problemsData) {
        const problemFilter = problemsData.problemName
          .filter((item) => item.type === 'problem')
          .map((problem) => problem.name)
        const scaleFilter = problemsData.problemName
          .filter((item) => item.type === 'scale')
          .map((scale) => scale.name)
        const testFilter = problemsData.problemName
          .filter((item) => item.type === 'test')
          .map(({ name, inputType }) => ({ name: name, inputType }))
        setTests(testFilter)
        setScales(scaleFilter)
        setProblems(problemFilter)
      }
    } catch (error) {
      console.error('Error fetching problems:', error)
    }
  }

  const handleStartingDateChange = (date) => {
    setStartingDate(date)
  }

  const getPatientById = async () => {
    try {
      const data = await getFetch(`${API_URL}/api/patient/${_id}`)
      setPatientById(data.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (inputs.length === 1 && inputs[0].problem === '') {
      return toast.warning('Please select at least one Chief complaint')
    }
    const filteredInputs = inputs
      .map((data) => ({
        ...data,
        test: data.test.filter((test) => test.name !== ''),
        scale: data.scale.filter((scale) => scale.name !== ''),
      }))
      .filter((data) => data.problem !== '')
    const filterProcedure = procedure.filter((data) => data.name !== '')

    for (const data of filteredInputs) {
      if (
        data.test.length > 0 &&
        data.test.some((test) => test.testInput === '' && test.files.length === 0)
      ) {
        toast.warning('Please provide input or upload file(s) for selected test(s)')
        return
      }

      if (data.scale.length > 0 && data.scale.some((scale) => scale.value === '')) {
        toast.warning('Please provide input for selected scale(s)')
        return
      }
    }

    // for (const data of inputs) {
    //   if (data.test !== '' && data.testInput === '' && data.files.length === 0) {
    //     toast.warning('Please give input for selected test')
    //     return // Stop further execution
    //   }

    //   if (data.scale !== '' && data.value === '') {
    //     toast.warning('Please give input for selected scale')
    //     return // Stop further execution
    //   }
    //   console.log('data', data)
    // }
    // toast.warning('Uploading Files and Reports')z
    setfileUploadingSpinner(true)
    try {
      await Promise.all(
        filteredInputs.map(async (data, index) => {
          await Promise.all(
            data.test.map(async (presentTest, testIndex) => {
              if (presentTest.files) {
                const files = presentTest.files
                if (files.length > 0) {
                  const formData = new FormData()
                  files.forEach((file) => {
                    // Check if the file type is allowed
                    const allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf']
                    if (allowedFileTypes.includes(file.type)) {
                      formData.append('files', file) // Append each allowed file to the FormData
                    } else {
                      console.warn('File type not allowed:', file.type)
                    }
                  })
                  if (formData.has('files')) {
                    const response = await postFetchFile(
                      `${API_URL}/api/user/uploadPatientReport`,
                      formData,
                    )
                    if (response) {
                      setfileUploadingSpinner(false)
                      filteredInputs[index].test[testIndex].files = response.filesInfo
                    }
                  } else {
                    setfileUploadingSpinner(false)
                    console.warn('No valid files to upload')
                  }
                }
              } else {
                filteredInputs[index].test[testIndex].files = null
                setfileUploadingSpinner(false)
              }
            }),
          )
        }),
      )
    } catch (error) {
      setfileUploadingSpinner(false)
      console.error('Error uploading files:', error)
      return
    }
    // if (addProcedureToggle) {
    //   filteredInputs.forEach((data, index) => {
    //     data.procedure = filterProcedure
    //   })
    // }

    try {
      setLoading(true)
      const updatedFormData = {
        ...formData,
        diagnosis: [
          {
            diagnosData: filteredInputs,
            procedure: filterProcedure,
            date: Date(),
            desc,
          },
        ],
        nextApointmentDate: startingDate,
      }
      // console.log('updatedFormData', updatedFormData)

      const data = await putFetchData(`${API_URL}/api/patient/update/${_id}`, updatedFormData)

      // console.log('Gaurav', data)
      if (data) {
        setDiagnosis([])
        setDesc('')
        toast.success('Patient Updated Successfully', {
          autoClose: 1000,
        })

        setIsAddNewDiagnosis(false)
        setIsDetailed(true)
        setInputs([
          {
            problem: '',
            subProblem: '',
            test: [
              {
                name: '',
                testInput: '',
                files: [],
              },
            ],
            scale: [
              {
                name: '',
                value: '',
              },
            ],
          },
        ])
        setLoading(false)

        getSearchByPatient()
        // window.location.reload()
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleClose = () => {
    setIsAddNewDiagnosis(false)
    setIsDetailed(true)
  }

  useEffect(() => {
    if (patientById.desc) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        desc: patientById.desc,
      }))
    }
  }, [patientById])

  useEffect(() => {
    getPatientById()
  }, [])

  /// new updates by Gaurav 28 march 2024 for updating the diagnoses data and formate to add problems tests and scales

  let [removeAndAddInput, setremoveAndAddInput] = useState(false)

  const handleInputChange = (index, event) => {
    const { name, value } = event.target
    const updatedInputs = [...inputs]
    updatedInputs[index][name] = value
    setInputs(updatedInputs)
  }

  const handleFileInputChange = (index, testindex, event) => {
    const { name, files } = event.target
    const allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf']
    const maxFiles = 3 // Maximum number of files allowed

    // Check if the number of selected files exceeds the limit
    if (files.length > maxFiles) {
      event.target.value = '' // Clear the file input
      toast.warning('You can only upload up to 3 files', { autoClose: 1500 })
      return
    }

    const updatedInputs = [...inputs]

    // Convert FileList to array and filter out files that exceed the size limit or are not of allowed types
    const filesArray = Array.from(files).filter((file) => {
      if (file.size > 31457280) {
        toast.warning('File size should be less than 30 MB', { autoClose: 1500 })
        return false
      }
      if (!allowedFileTypes.includes(file.type)) {
        toast.warning('Only images and PDFs are allowed', { autoClose: 1500 })
        return false
      }
      return true
    })

    updatedInputs[index].test[testindex].files = filesArray // Store the array of files
    setInputs(updatedInputs)
  }

  const handleAddInput = () => {
    const allInputsHaveProblem = inputs.every((input) => input.problem !== '')
    if (allInputsHaveProblem) {
      setInputs([
        ...inputs,
        {
          problem: '',
          subProblem: '',
          test: [
            {
              name: '',
              testInput: '',
              files: [],
            },
          ],
          scale: [
            {
              name: '',
              value: '',
            },
          ],
        },
      ])
    } else {
      toast.warning('Please Fill Details of previous Record before adding new!!', {
        autoClose: 1500,
      })
    }
  }

  const handleRemoveInput = (index) => {
    const updatedInputs = [...inputs]
    updatedInputs.splice(index, 1)
    setInputs(updatedInputs)
  }

  const handleInputTestText = (index, testIndex, event) => {
    const { name, value } = event.target
    const updatedInputs = [...inputs]
    updatedInputs[index].test[testIndex][name] = value
    setInputs(updatedInputs)
  }
  useEffect(() => {
    if (inputs.length > 1) {
      setremoveAndAddInput(true)
    } else {
      setremoveAndAddInput(false)
    }
  }, [handleRemoveInput, handleAddInput, handleInputChange])

  const handleInputTestChange = (index, testIndex, event) => {
    // console.log('asd', index, testIndex, event)
    const { name, value } = event.target
    const newInputs = [...inputs]
    newInputs[index].test[testIndex][name] = value
    setInputs(newInputs)
  }
  const handleRemoveTestInput = (e, index, testIndex) => {
    e.preventDefault()
    const updateData = [...inputs]
    updateData[index].test.splice(testIndex, 1)
    setInputs(updateData)
  }
  const handleAddTestInput = (e, index) => {
    e.preventDefault()
    if (inputs[index].test[inputs[index].test.length - 1].name) {
      const updatedInputs = [...inputs]
      updatedInputs[index].test.push({
        name: '',
        testInput: '',
        files: [],
      })
      setInputs(updatedInputs)
    } else {
      toast.warning('Please Enter Previous test field before adding new')
    }
  }

  const handleInputChangeScale = (index, scaleIndex, event) => {
    const { name, value } = event.target
    const newInputs = [...inputs]
    newInputs[index].scale[scaleIndex][name] = value
    setInputs(newInputs)
  }

  const handleRemoveScaleInput = (e, index, scaleIndex) => {
    e.preventDefault()
    const updateData = [...inputs]
    updateData[index].scale.splice(scaleIndex, 1)
    setInputs(updateData)
  }

  const handleAddScaleInput = (e, index) => {
    e.preventDefault()
    if (inputs[index].scale[inputs[index].scale.length - 1].name) {
      const updatedInputs = [...inputs]
      updatedInputs[index].scale.push({
        name: '',
        value: '',
      })
      setInputs(updatedInputs)
    } else {
      toast.warning('Please Enter Previous Scale field before adding new')
    }
  }

  const handleInputChangeProcedure = (index, event) => {
    const { name, value } = event.target
    const updatedProcedure = [...procedure]
    updatedProcedure[index][name] = value
    setProcedure(updatedProcedure)
  }

  const handleRemoveInputProcedure = (index) => {
    const updatedInputs = [...procedure]
    updatedInputs.splice(index, 1)
    setProcedure(updatedInputs)
  }
  const handleAddInputProcedure = () => {
    const allInputsHaveProblem = procedure.every((input) => input.name !== '')
    if (allInputsHaveProblem) {
      setProcedure([
        ...procedure,
        { name: '', complications: '', doneBy: '', date: dayjs(currentDate) },
      ])
    } else {
      toast.warning('Please Fill Details of previous Record before adding new!!', {
        autoClose: 1500,
      })
    }
  }

  useEffect(() => {
    if (inputs.length > 1) {
      setremoveAndAddInput(true)
    } else {
      setremoveAndAddInput(false)
    }
    if (procedure.length > 1) {
      setremoveAndAddInputProcedure(true)
    } else {
      setremoveAndAddInputProcedure(false)
    }
  }, [
    handleRemoveInput,
    handleAddInput,
    handleInputChange,
    handleAddInputProcedure,
    handleInputChangeProcedure,
  ])
  useEffect(() => {
    console.log('Inputs ', inputs)
  })
  return (
    <>
      {fileUploadingSpinner && (
        <SpinnerOverlay loading={fileUploadingSpinner} message="Uploading Files" />
      )}
      {loading && <SpinnerOverlay message="Adding Diagnosis" />}
      <div style={{ margin: '1rem auto 1rem 1rem' }}>
        <div className="addPatientDataInnerDiv">
          <h4>Diagnosis: ({patientRecord?.department_id?.departmentName})</h4>
        </div>
        <form onSubmit={handleSubmit}>
          <form className="mb-3">
            {inputs.map((input, index) => (
              <div key={index} className="row mt-1 mb-2">
                <div className="col-md-2 col-12">
                  <label>
                    <select
                      className="form-control addPatientDataSelectDiv"
                      // style={{ width: '100%', appearance: 'auto', height: '38px' }}
                      name="problem"
                      value={input.problem}
                      onChange={(event) => handleInputChange(index, event)}
                    >
                      <option value="">Chief complaint</option>
                      {problems.map((problem, problemIndex) => (
                        <option key={problemIndex} value={problem}>
                          {problem}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter sub problem"
                      name="subProblem"
                      onChange={(event) => handleInputChange(index, event)}
                    ></input>
                  </label>
                </div>
                <div className="col-md-4 col-12">
                  {input.test.map((testInput, testIndex) => (
                    <div key={testInput} className="d-flex mb-1">
                      <div style={{ width: '40%' }}>
                        <label>
                          <select
                            className="form-control addPatientDataSelectDiv"
                            name="name"
                            value={testInput.name}
                            onChange={(event) => handleInputTestChange(index, testIndex, event)}
                          >
                            <option value="">Select Test</option>
                            {tests.map((test, testIndex) => (
                              <option key={testIndex} value={test.name}>
                                {test.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      {testInput.name === '' ? (
                        <div style={{ width: '40%', marginLeft: '3px' }}>
                          <label>
                            <input
                              className="form-control addPatientDataInputDiv"
                              placeholder="Select a Test"
                              type="text"
                              disabled="true"
                            />
                          </label>
                        </div>
                      ) : (
                        <div style={{ width: '40%', marginLeft: '3px' }}>
                          {tests.map((test) => {
                            if (test.name === input.test[testIndex].name) {
                              if (test.inputType === 'text') {
                                return (
                                  <label key={testIndex}>
                                    <input
                                      className="form-control"
                                      style={{ width: '100%' }}
                                      placeholder="Enter test Value"
                                      type="text"
                                      name="testInput"
                                      value={input.test[testIndex].text} // Here is the issue
                                      onChange={(event) =>
                                        handleInputTestText(index, testIndex, event)
                                      }
                                    />
                                  </label>
                                )
                              } else if (test.inputType === 'file') {
                                return (
                                  <label key={testIndex}>
                                    <input
                                      className="form-control"
                                      style={{ width: '100%' }}
                                      type="file"
                                      multiple
                                      name="files"
                                      accept="image/jpeg, image/png, application/pdf"
                                      onChange={(event) =>
                                        handleFileInputChange(index, testIndex, event)
                                      }
                                    />
                                  </label>
                                )
                              }
                            }
                            return null
                          })}
                        </div>
                      )}
                      <div style={{ width: '20%', marginLeft: '3px' }}>
                        {testIndex !== input.test.length - 1 && (
                          <button
                            className="btn btn-outline-dark"
                            onClick={(e) => handleRemoveTestInput(e, index, testIndex)}
                          >
                            <CIcon icon={cilMinus} />
                          </button>
                        )}
                        {testIndex === input.test.length - 1 && (
                          <button
                            className="btn btn-outline-success"
                            onClick={(e) => handleAddTestInput(e, index)}
                          >
                            <CIcon icon={cilPlus} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="col-md-4 col-12 ">
                  {input.scale.map((scaleInput, scaleIndex) => (
                    <div key={scaleIndex} className="d-flex mb-1">
                      <div style={{ width: '40%' }}>
                        <label>
                          <select
                            className="form-control addPatientDataSelectDiv"
                            name="name"
                            value={input.scale[scaleIndex].name}
                            onChange={(event) => handleInputChangeScale(index, scaleIndex, event)}
                          >
                            <option value="">Select Scale</option>
                            {scales.map((scale, scaleIndex) => (
                              <option key={scaleIndex} value={scale}>
                                {scale}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div style={{ width: '40%', marginLeft: '3px' }}>
                        <label>
                          <input
                            className="form-control addPatientDataInputDiv"
                            // style={{ width: '100%', appearance: 'auto' }}
                            placeholder="Enter Scale Value"
                            type="text"
                            name="value"
                            value={input.scale[scaleIndex].value}
                            onChange={(event) => handleInputChangeScale(index, scaleIndex, event)}
                          />
                        </label>
                      </div>
                      <div style={{ width: '20%', marginLeft: '3px' }}>
                        {scaleIndex !== input.scale.length - 1 && (
                          <button
                            className="btn btn-outline-dark"
                            onClick={(e) => handleRemoveScaleInput(e, index, scaleIndex)}
                          >
                            <CIcon icon={cilMinus} />
                          </button>
                        )}
                        {scaleIndex === input.scale.length - 1 && (
                          <button
                            className="btn btn-outline-success"
                            onClick={(e) => handleAddScaleInput(e, index)}
                          >
                            <CIcon icon={cilPlus} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="col-md-2 d-flex justify-content-end col-12">
                  {removeAndAddInput && (
                    <button
                      className="btn me-4 mt-1"
                      type="button"
                      onClick={() => handleRemoveInput(index)}
                    >
                      <CIcon icon={cilTrash} size="xl" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="d-flex justify-content-end">
              <button className="btn btn-primary me-4" type="button" onClick={handleAddInput}>
                Add More
              </button>
            </div>
          </form>
          <div>
            <div>
              <input
                type="checkbox"
                checked={addProcedureToggle}
                onChange={() => setAddProcedureToggle(!addProcedureToggle)}
              ></input>
              <label> &nbsp;&nbsp;&nbsp;Add Procedure</label>
            </div>
            {addProcedureToggle ? (
              <>
                <form>
                  {procedure.map((input, index) => (
                    <div key={index}>
                      <div>
                        <div className="row">
                          <div className="col-md-2 col-sm-10 ">
                            <label>
                              <input
                                onChange={(event) => handleInputChangeProcedure(index, event)}
                                value={input.name}
                                name="name"
                                className="form-control addPatientDataInputDiv"
                                placeholder="Procedure Name"
                                type="text"
                              />
                            </label>
                          </div>
                          <div className="col-md-2 col-sm-10">
                            <label>
                              <input
                                onChange={(event) => handleInputChangeProcedure(index, event)}
                                value={input.complications}
                                name="complications"
                                className="form-control addPatientDataInputDiv"
                                placeholder="Complications"
                                type="text"
                              />
                            </label>
                          </div>
                          <div className="col-md-2 col-sm-10">
                            <label>
                              <input
                                onChange={(event) => handleInputChangeProcedure(index, event)}
                                value={input.doneBy}
                                name="doneBy"
                                className="form-control addPatientDataInputDiv"
                                placeholder="Done By"
                                type="text"
                              />
                            </label>
                          </div>
                          <div className="col-md-4 col-sm-10">
                            <div className="d-flex">
                              <div className="w-auto">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DemoContainer components={['DateTimePicker']}>
                                    <DateTimePicker
                                      label="To"
                                      value={input.date}
                                      // onChange={handleEndDateChange}
                                      inputFormat="YYYY-MM-DD"
                                      ampm={false}
                                      ampmInClock={false}
                                      views={['year', 'month', 'day']}
                                      slotProps={{ textField: { size: 'small' } }}
                                    />
                                  </DemoContainer>
                                </LocalizationProvider>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-2 d-flex ">
                            {removeAndAddInputProcedure && (
                              <button
                                className="btn me-4 mt-1"
                                type="button"
                                onClick={() => handleRemoveInputProcedure(index)}
                              >
                                <CIcon icon={cilTrash} size="xl" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="d-flex justify-content-end">
                    <button
                      className="btn btn-primary me-4"
                      type="button"
                      onClick={() => handleAddInputProcedure()}
                    >
                      Add More
                    </button>
                  </div>
                </form>
              </>
            ) : (
              ''
            )}
          </div>
          <div>
            <textarea
              rows={4}
              className="form-control col-12"
              placeholder="Notes (Optional)"
              name="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            ></textarea>
          </div>

          <div className="d-flex mt-2">
            <div className="w-auto">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DateTimePicker']}>
                  <DateTimePicker
                    label="Next Appointment Date"
                    value={startingDate}
                    onChange={handleStartingDateChange}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </div>
          </div>
          <div className="text-end">
            <button type="submit" className="btn btn-primary mt-4" style={{ width: '10rem' }}>
              Submit
            </button>
            <button
              type="submit"
              className="btn btn-danger mt-4 ms-2"
              style={{ width: '10rem' }}
              onClick={() => handleClose()}
            >
              Close
            </button>
          </div>
        </form>
        <ToastContainer />
      </div>
    </>
  )
}

export default PatientAddNewRecord
