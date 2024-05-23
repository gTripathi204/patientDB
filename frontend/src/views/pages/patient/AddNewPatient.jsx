import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { getFetch, postFetch, postFetchContent, postFetchData, postFetchFile } from 'src/api/Api'
import PatientInfoData from './PatientInfoData'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Loader from '../loader/Loader'
import AddPatientLoader from '../loader/AddPatientLoader'
import { useLocation } from 'react-router-dom'
import SpinnerOverlay from 'src/views/publicItems/ SpinnerOverlay'
import { DatePicker } from 'antd'
import dayjs from 'dayjs'
import PropTypes from 'prop-types'
import CIcon from '@coreui/icons-react'
import { cibAddthis, cilMinus, cilPlaylistAdd, cilPlus, cilTrash } from '@coreui/icons'

const AddNewPatient = ({ setData, setUpdatedSearch, getSearchByPatient, updatedSearch }) => {
  const location = useLocation()
  // console.log('location', Number(location?.state?.crn))
  const currentDate = new Date()
  // console.log('today date', currentDate)
  let API_URL = process.env.REACT_APP_API_URL
  // const API_URL = process.env.API_URL
  let patientData = localStorage.getItem('patientRecord')
  let patientRecord = JSON.parse(patientData)
  const [updateState, setUpdateState] = useState(false)
  const [loader, setLoader] = useState(false)
  const [addPatientLoader, setaddPatientLoader] = useState(false)

  const [startingDate, setStartingDate] = React.useState(null)

  const [problems, setProblems] = useState([])
  const [tests, setTests] = useState([])
  const [scales, setScales] = useState([])
  const [queryCRN, setQueryCRN] = useState('')
  const randomCRN = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
  let [fileUploadingSpinner, setfileUploadingSpinner] = useState(false)
  const [addProcedureToggle, setAddProcedureToggle] = useState(false)
  const [desc, setDesc] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: 'male',
    phone: '',
    crn: `${randomCRN}`,
    diagnosis: [],
    desc: '',
    doctor_id: patientRecord?._id,
  })

  const [inputs, setInputs] = useState([
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
  const [procedure, setProcedure] = useState([
    {
      name: '',
      complications: '',
      doneBy: '',
      date: dayjs(currentDate),
    },
  ])

  const handleStartingDateChange = (date) => {
    setStartingDate(date)
  }

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

  /////////////////////////////////////START OF HANDLE SUBMIT/////////////////////

  const handleSubmit = async () => {
    // console.log('updatedFormData', inputs)

    // setSearch('')

    // Check if required fields are filled
    if (!formData.name || !formData.age || !formData.sex || !formData.phone || !formData.crn) {
      return toast.warning('Please fill all Patient details')
    }

    if (inputs.length === 1 && inputs[0].problem === '') {
      return toast.warning('Please select at least one Chief complaint')
    }
    // const filteredInputs = inputs.filter((data) => data.problem !== '')
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

    // toast.warning('Uploading Files and Reports')
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
    console.log('final input', updatedFormData)

    try {
      // console.log('pre', updatedFormData)\
      const doctorRecord = await localStorage.getItem('patientRecord')
      const doctorId = JSON.parse(doctorRecord)?._id
      // console.log('Guarav', JSON.parse(doctorRecord)?._id)
      const data = await postFetchData(`${API_URL}/api/patient/create/${doctorId}`, updatedFormData)
      if (data.success === true) {
        toast.success('Patient Created Successfully', {
          autoClose: 2000,
        })
        setfileUploadingSpinner(false)

        setaddPatientLoader(true)
        setData(false)

        // toast.success('Patient Created Successfully')
        setUpdateState(true)
        setaddPatientLoader(false)
        // setDiagnosis([])
        setDesc('')
        setStartingDate(null)
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
        setProcedure({
          name: '',
          complications: '',
          doneBy: '',
          date: dayjs(currentDate),
        })
        setFormData({
          name: '',
          age: '',
          sex: 'male',
          phone: '',
          crn: `${randomCRN}`,
          diagnosis: [],
          desc: '',
          doctor_id: patientRecord?._id,
        })
      }
      if (data.message === 'phone Already Exists') {
        toast.warning('phone Already Exists')
        setfileUploadingSpinner(false)
      }
      if (data.message === 'Crn Already Exists') {
        toast.warning('Crn Already Exists')
        setfileUploadingSpinner(false)
      }

      setUpdatedSearch(data?.data?.crn)
    } catch (error) {
      toast.warning('Something went wrong')
      setfileUploadingSpinner(false)
      console.error('Error submitting data:', error)
    }
  }

  /////////////////////////////////////// END OF HANDLE SUBMIT ////////////

  let [removeAndAddInput, setremoveAndAddInput] = useState(false)
  let [removeAndAddInputProcedure, setremoveAndAddInputProcedure] = useState(false)

  const handleInputChange = (index, event) => {
    const { name, value } = event.target
    const updatedInputs = [...inputs]
    updatedInputs[index][name] = value
    setInputs(updatedInputs)
  }

  const handleInputChangeProcedure = (index, event) => {
    const { name, value } = event.target
    const updatedProcedure = [...procedure]
    updatedProcedure[index][name] = value
    setProcedure(updatedProcedure)
  }
  const handleInputTestText = (index, testIndex, event) => {
    const { name, value } = event.target
    const updatedInputs = [...inputs]
    updatedInputs[index].test[testIndex][name] = value
    console.log('guarav', updatedInputs)
    // setInputs(updatedInputs)
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
  const handleRemoveInput = (index) => {
    const updatedInputs = [...inputs]
    updatedInputs.splice(index, 1)
    setInputs(updatedInputs)
  }
  const handleRemoveInputProcedure = (index) => {
    const updatedInputs = [...procedure]
    updatedInputs.splice(index, 1)
    setProcedure(updatedInputs)
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
    handleAddInputProcedure,
    handleInputChangeProcedure,
  ])
  useEffect(() => {
    console.log('Updated inputs:', inputs, procedure)
  }, [inputs])

  const clearAllDataInputs = () => {
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
    setFormData({
      name: '',
      age: '',
      sex: 'male',
      phone: '',
      crn: `${randomCRN}`,
      diagnosis: [],
      desc: '',
      doctor_id: patientRecord?._id,
    })
  }

  const handleInputTestChange = (index, testIndex, event) => {
    const { name, value } = event.target
    const newInputs = [...inputs]
    newInputs[index].test[testIndex][name] = value
    setInputs(newInputs)
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

  const handleInputChangeScale = (index, scaleIndex, event) => {
    const { name, value } = event.target
    const newInputs = [...inputs]
    newInputs[index].scale[scaleIndex][name] = value
    setInputs(newInputs)
  }
  const handleRemoveTestInput = (e, index, testIndex) => {
    e.preventDefault()
    const updateData = [...inputs]
    updateData[index].test.splice(testIndex, 1)
    setInputs(updateData)
  }

  const handleRemoveScaleInput = (e, index, scaleIndex) => {
    e.preventDefault()
    const updateData = [...inputs]
    updateData[index].scale.splice(scaleIndex, 1)
    setInputs(updateData)
  }

  return (
    <>
      <div>
        {fileUploadingSpinner && <SpinnerOverlay loading={fileUploadingSpinner} />}
        <div className="content-to-be-blurred">
          <div style={{ marginTop: '1rem' }}>
            <div>
              <hr />
              <h4>Patient Details</h4>

              <div>
                <div className="row">
                  <div className="col-md-4">
                    <div>
                      <label className="col-sm-4 mt-2 patientNamediv">
                        Name <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div className="col-sm-8">
                        <input
                          type="text"
                          className="form-control "
                          name="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div>
                      <label className="col-sm-4 mt-2 patientNamediv">
                        Age <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div className="col-sm-8">
                        <input
                          type="number"
                          className="form-control "
                          name="age"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div>
                      <label className="col-sm-4 mt-2 patientNamediv">
                        Sex <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div className="col-sm-8">
                        <select
                          className="form-control "
                          name="sex"
                          value={formData.sex}
                          onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row ">
                  <div className="col-md-4 mt-2">
                    <div>
                      <label className="col-lg-4 patientNamediv">
                        Contact <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div className=" col-lg-8 col-sm-8">
                        <input
                          className="form-control "
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={(e) => {
                            if (/^\d*$/.test(e.target.value) || e.target.value === '') {
                              setFormData({ ...formData, phone: e.target.value })
                            }
                          }}
                          required={true}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mt-2">
                    <div>
                      <label className="col-sm-4  patientNamediv">
                        CR No <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div className="col-sm-8">
                        <input
                          className="form-control "
                          type="test"
                          name="crn"
                          value={formData.crn}
                          onChange={(e) => setFormData({ ...formData, crn: e.target.value })}
                          required={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <hr />
              <div className="addPatientDataInnerDiv">
                <h4>Diagnosis: ({patientRecord?.department_id?.departmentName})</h4>
              </div>
              <div>
                <form className="mb-3">
                  {inputs.map((input, index) => (
                    <div key={index} className="row mt-1 mb-2">
                      <div className="col-md-2 col-12">
                        <label>
                          <select
                            className="form-control addPatientDataSelectDiv mb-1"
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
                                  onChange={(event) =>
                                    handleInputTestChange(index, testIndex, event)
                                  }
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
                              <div style={{ width: '40%', marginLeft: '4px' }}>
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
                              <div style={{ width: '40%', marginLeft: '4px' }}>
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
                                  onChange={(event) =>
                                    handleInputChangeScale(index, scaleIndex, event)
                                  }
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
                                  onChange={(event) =>
                                    handleInputChangeScale(index, scaleIndex, event)
                                  }
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
                    <button
                      className="btn btn-outline-primary me-4"
                      type="button"
                      onClick={handleAddInput}
                    >
                      Add More
                    </button>
                  </div>
                </form>
              </div>
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
                          className="btn btn-outline-primary me-4"
                          type="button"
                          onClick={handleAddInputProcedure}
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
            </div>
            <div>
              <div className="d-flex mt-2">
                <div className="w-auto">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateTimePicker']}>
                      <DateTimePicker
                        label="Next Appointment Date"
                        value={startingDate}
                        onChange={handleStartingDateChange}
                        // ampm={false}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </div>
              </div>
            </div>
            <div className="text-end m-4">
              <button className="btn btn-info mt-3 mx-2 w-auto" onClick={handleSubmit}>
                Submit
              </button>
              <button
                className="btn btn-info mt-3 w-auto"
                onClick={() => {
                  setData(false)
                  clearAllDataInputs()
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  )
}

AddNewPatient.propTypes = {
  setData: PropTypes.array.isRequired,
  setUpdatedSearch: PropTypes.array.isRequired,
  getSearchByPatient: PropTypes.array.isRequired,
  updatedSearch: PropTypes.array.isRequired,
}

export default AddNewPatient
