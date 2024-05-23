import React, { useEffect, useState } from 'react'
import { getFetch, postFetch, postFetchData } from 'src/api/Api'
import { Divider, Radio, Table } from 'antd'
import { useNavigate } from 'react-router-dom'
import { Pagination, Stack } from '@mui/material'

import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { DateTimePicker } from '@mui/x-date-pickers'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import SpinnerOverlay from 'src/views/publicItems/ SpinnerOverlay'
import Loader from '../loader/Loader'
import ReportModal from './ReportModal'
import Select from 'react-select'
import { CChart } from '@coreui/react-chartjs'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const PatientReport = () => {
  let API_URL = process.env.REACT_APP_API_URL
  let patientData = localStorage.getItem('patientRecord')
  let patientRecord = JSON.parse(patientData)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const [hide, setHide] = useState(false)
  const [popupData, setPopuoData] = useState({})
  const [updateState, setUpdateState] = useState(false)
  const [problemSet, setProblemSet] = useState('')
  const [pageCount, setPageCount] = useState(1)
  const [page, setPage] = useState(1)
  const [problems, setProblems] = useState([])
  const [tests, setTests] = useState([])
  const [scales, setScales] = useState([])
  const [patientProblems, setPatientProblems] = useState([])
  const [selectDropdownValue, setSelectDropdownValue] = useState('')
  const colorPalette = ['#41B883', '#E46651', '#00D8FF', '#DD1B16', '#8A2BE2', '#FFA500', '#32CD32']

  const fetchProblems = async () => {
    try {
      setLoading(true)
      const problemsResponse = await getFetch(
        `${API_URL}/api/problem/${patientRecord?.department_id?._id}`,
      )
      const problemsData = problemsResponse?.data?.data[0]
      if (problemsData) {
        const problemFilter = problemsData.problemName
          .filter((item) => item.type === 'problem')
          .map((problem) => problem.name)
        const testFilter = problemsData.problemName
          .filter((item) => item.type === 'test')
          .map((test) => test.name)
        const scaleFilter = problemsData.problemName
          .filter((item) => item.type === 'scale')
          .map((scale) => scale.name)

        const options = problemFilter.map((problem) => ({
          value: problem,
          label: problem,
        }))
        setTests(testFilter)
        setScales(scaleFilter)
        setProblems(options)
        setSelectDropdownValue(options)
        setProblemSet(
          options.map((el) => {
            return el.value
          }),
        )
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      console.error('Error fetching problems:', error)
    }
  }

  const handlSetPoblem = (elem) => {
    // if (elem.length < 8) {
    setSelectDropdownValue(elem)
    setProblemSet(
      elem.map((el) => {
        return el.value
      }),
    )
    // }
    // else {
    //   toast.warning('You can only select chief complaints upto 7 ')
    // }
  }

  // const getPatientByProblem = async () => {
  //   try {
  //     console.log('ashish', problemSet)
  //     if (problemSet?.length === 0) {
  //       return
  //     }
  //     const res = await getFetch(
  //       `${API_URL}/api/patient/problems?problem=${problemSet}&doctor_id=${patientRecord._id}&page=${page}`,
  //     )
  //     console.log('response', res)
  //     setPageCount(res?.data?.pageCount)
  //     setPatientProblems(res.data.data)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  const columns = [
    {
      title: 'CR no',
      dataIndex: 'crn',
    },
    // {
    //   title: 'Phone no',
    //   dataIndex: 'phone',
    //   render: (text) => <a>{text}</a>,
    // },
    {
      title: 'Name',
      dataIndex: 'name',
      // render: (text) => <p>{text}</p>,
      // sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Age',
      dataIndex: 'age',
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'Sex',
      dataIndex: 'sex',
      sorter: (a, b) => a.sex.localeCompare(b.sex),
    },
    {
      title: 'Action',
      render: (text) => {
        // console.log('text', text)
        return (
          <button className="btn btn-primary" onClick={() => handleOpenMOdal(text)}>
            View Diagnosis
          </button>
        )
      },
    },
    {
      title: 'Action',

      render: (text) => {
        // console.log('text', text)
        return (
          <button
            className="btn btn-primary"
            onClick={(e) => navigate('/patientPage', { state: text })}
          >
            Show Details
          </button>
        )
      },
    },
  ]
  const todayDate = dayjs()
  const [startingDate, setStartingDate] = useState(dayjs().subtract(7, 'day'))
  const [endDate, setEndDate] = useState(todayDate)

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleStartingDateChange = (date) => {
    if (date > new Date()) {
      toast.warning('Stating date not be in the future')
      return setStartingDate(todayDate)
    }
    setStartingDate(date)
  }
  const handleEndDateChange = (date) => {
    if (date > new Date()) {
      toast.warning('End date not be in the future')
      return setEndDate(todayDate)
    }
    setEndDate(date)
  }

  const filterDataAccordingToProblemSet = (response, problemSet) => {
    for (const diagnosis of response) {
      diagnosis.diagnosData = diagnosis.diagnosData.filter((data) =>
        problemSet.includes(data.problem),
      )
    }
    return response.filter((diagnosis) => diagnosis.diagnosData.length > 0)
  }

  const [filterDatatResponse, setFilterDataResponse] = useState('')

  const dateSubmit = async () => {
    if (problemSet === '') {
      return toast.warning('Please select any one Chief Complaint')
    }
    if (endDate.isBefore(startingDate, 'day')) {
      toast.warning('End date cannot be earlier than start date')
      return
    }
    setLoading(true)
    const date = new Date(startingDate)
    const date1 = new Date(endDate)

    console.log(`Report Start ${date} and Report End ${date1}`)
    ////////////FOR SINGLE PROBLEM FIND PATIENTS////////////////////
    // const res = await getFetch(
    //   `${API_URL}/api/patient/problems?problem=${problemSet}&doctor_id=${patientRecord._id}&startDate=${date}&endDate=${date1}&page=${page}`,
    // )

    // console.log('ashdata', res)

    // working perfectly

    //////////////////////////////////////////////
    console.log('selected problems', problemSet)
    const data = {
      problems: problemSet,
    }

    const res = await postFetchData(
      `${API_URL}/api/patient/multipleProblems?problem=${problemSet}&doctor_id=${patientRecord._id}&startDate=${date}&endDate=${date1}&page=${page}`,
      data,
    )

    if (res?.success === true) {
      console.log('searched data', res)

      const filterDataArray = await Promise.all(
        res?.data?.map(async (obj) => {
          const filteredDiagnosis = await filterDataAccordingToProblemSet(obj.diagnosis, problemSet)
          return { ...obj, diagnosis: filteredDiagnosis }
        }),
      )

      setFilterDataResponse(filterDataArray)

      console.log('filtered Data', filterDataArray)

      setPageCount(res?.pageCount)
      setPatientProblems(res?.data)

      const problemCounts = {}

      console.log('response', res)

      res?.data?.forEach((patient) => {
        const patientProblemSet = new Set()
        patient?.diagnosis?.forEach((element) => {
          element?.diagnosData?.forEach((diagnosis) => {
            const problem = diagnosis.problem

            if (problemSet.includes(problem) && !patientProblemSet.has(problem)) {
              problemCounts[problem] = (problemCounts[problem] || 0) + 1
              patientProblemSet.add(problem)
            }
          })
        })
      })
      let maleCount = 0
      let femaleCount = 0
      let otherCount = 0
      res?.data?.forEach((patient) => {
        if (patient.sex === 'male') {
          maleCount = maleCount + 1
        } else if (patient.sex === 'female') {
          femaleCount = femaleCount + 1
        } else {
          otherCount = otherCount + 1
        }
      })
      setFilterDataBySex({
        male: maleCount,
        female: femaleCount,
        other: otherCount,
      })
      console.log('Count male female', filterDataBySex)

      setTest(problemCounts)
      setLoading(false)
    } else {
      setLoading(false)
      console.log('not find')
    }
  }

  const [test, setTest] = useState('')
  console.log('Test', test)
  const [filterDataBySex, setFilterDataBySex] = useState({
    male: 0,
    female: 0,
    other: 0,
  })
  console.log('filterDataBySex', filterDataBySex)

  const dateReset = () => {
    setStartingDate(todayDate)
    setEndDate(todayDate)
    setUpdateState(!updateState)
    setProblemSet('Select Problem')
    setPatientProblems('')
    setFilterDataBySex('')
    setTest('')
    setSelectDropdownValue('')
    setFilterDataResponse('')
  }

  const handleOpenMOdal = (text) => {
    setHide(true)
    console.log('datafromdiagbutton', text)
    setPopuoData(text)
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchProblems()

      if (problemSet.length) {
        dateSubmit()
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (problemSet.length) {
      dateSubmit()
    }
  }, [problemSet, page, updateState])

  const handleDropdownChange = (selectedOptions) => {
    if (!selectedOptions || selectedOptions.length === 0) {
      dateReset()
    } else {
      handlSetPoblem(selectedOptions)
    }
  }

  const exportToExcel = () => {
    setLoading(true)

    const workbook = XLSX.utils.book_new()

    const titleRow = [
      'CRN',
      'Name',
      'Age',
      'Sex',
      'Phone',
      'Next Appointment Date',
      'Problem',
      'Sub Problem',
      'Notes',
      // 'Test Name',
      // 'Test Input',
      'Scale Name',
      'Scale Value',
      'Procedure Name',
      'Procedure Complications',
      'Procedure Done By',
      'Procedure Date',
    ]

    const worksheet = XLSX.utils.aoa_to_sheet([titleRow])

    filterDatatResponse.forEach((item) => {
      const { _id, name, age, sex, crn, phone, nextApointmentDate, diagnosis } = item
      const bbb = new Date(nextApointmentDate)
      const nextAppointmentDateFormateed = `${bbb.getDate()}/${
        bbb.getMonth() + 1
      }/${bbb.getFullYear()}`

      diagnosis.forEach((diagnosisItem) => {
        const { diagnosData, procedure, desc } = diagnosisItem

        diagnosData.forEach((diagnosDataItem) => {
          const { problem, subProblem, test, scale } = diagnosDataItem
          let shownProcedure = false

          // test.forEach((testItem) => {
          //   const { name: testName, testInput } = testItem

          // scale.forEach((scaleItem) => {
          //   const { name: scaleName, value: scaleValue } = scaleItem

          const scaleName = scale.map((scale) => scale.name).join(', ')
          const scaleValue = scale.map((scale) => scale.value).join(', ')
          if (procedure.length) {
            procedure.forEach((procedureItem) => {
              const { name: procedureName, complications, doneBy, date } = procedureItem
              if (shownProcedure === false) {
                console.log('Datessss', date)
                const aaa = new Date(date)

                const formattedDate = `${aaa.getDate()}/${aaa.getMonth() + 1}/${aaa.getFullYear()}`

                const dataRow = [
                  crn,
                  name,
                  age,
                  sex,
                  phone,
                  nextAppointmentDateFormateed,
                  problem,
                  subProblem,
                  desc,
                  // testName,
                  // testInput,
                  scaleName,
                  scaleValue,
                  procedureName,
                  complications,
                  doneBy,
                  formattedDate,
                ]
                shownProcedure = true
                // Append the row to the worksheet
                XLSX.utils.sheet_add_aoa(worksheet, [dataRow], { origin: -1 }) // -1 to append rows after the title row
              } else {
                const aaa = new Date(date)

                const formattedDate = `${aaa.getDate()}/${aaa.getMonth() + 1}/${aaa.getFullYear()}`

                const dataRow = [
                  ,
                  ,
                  ,
                  ,
                  ,
                  ,
                  ,
                  ,
                  ,
                  ,
                  ,
                  procedureName,
                  complications,
                  doneBy,
                  formattedDate,
                ]

                XLSX.utils.sheet_add_aoa(worksheet, [dataRow], { origin: -1 })
              }
            })
          } else {
            const dataRow = [
              crn,
              name,
              age,
              sex,
              phone,
              nextAppointmentDateFormateed,
              problem,
              subProblem,
              desc,
              // testName,
              // testInput,
              scaleName,
              scaleValue,
            ]
            XLSX.utils.sheet_add_aoa(worksheet, [dataRow], { origin: -1 })
          }

          // })
          // })
        })
      })
    })

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const date = new Date()

    saveAs(blob, `data_${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`)

    setLoading(false)
  }

  return (
    <div className="mb-3 " style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {hide ? <ReportModal setHide={setHide} popupData={popupData} problemSet={problemSet} /> : ''}
      {loading ? <SpinnerOverlay message="Loading" /> : ''}
      <div className="row">
        <div className="col-sm-3 mt-2">
          <Select
            options={problems}
            isMulti
            value={selectDropdownValue}
            // onChange={(e) => handlSetPoblem(e)}
            onChange={handleDropdownChange}
            placeholder="Select Chief Complaint"
            maxMenuHeight={300}
            styles={{
              singleValue: (provided, state) => ({
                ...provided,
                height: '30px',
                lineHeight: '30px',
              }),
            }}
          />
        </div>

        <div className="col-sm-9">
          <div className="row justify-content-center">
            <div className="col-sm-5">
              {' '}
              <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DateTimePicker']}>
                    <DateTimePicker
                      label="From"
                      value={startingDate}
                      onChange={handleStartingDateChange}
                      inputFormat="YYYY-MM-DD"
                      ampm={false}
                      ampmInClock={false}
                      views={['year', 'month', 'day']}
                      // sx={{ width: '100px' }}
                      // className="w-50"
                      // className="w-auto"
                      style={{ overflowX: 'hidden !important' }}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </div>
            </div>
            <div className="col-sm-5">
              {' '}
              <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DateTimePicker']}>
                    <DateTimePicker
                      label="To"
                      value={endDate}
                      onChange={handleEndDateChange}
                      inputFormat="YYYY-MM-DD"
                      ampm={false}
                      ampmInClock={false}
                      views={['year', 'month', 'day']}
                      // className="w-50"
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </div>
            </div>
          </div>
          <div style={{ textAlign: '-webkit-right', paddingRight: '101px' }}>
            <div className="col-sm-2 d-flex  mb-3">
              <button className="btn btn-primary mt-3 me-2" onClick={dateSubmit}>
                Search
              </button>
              <button className="btn btn-primary mt-3 " onClick={() => dateReset()}>
                Reset
              </button>
            </div>
          </div>
        </div>
        {filterDatatResponse !== '' ? (
          <div>
            <button
              // style={{ float: 'right', marginRight: '4rem' }}
              className="btn btn-outline-primary"
              onClick={exportToExcel}
            >
              Export to Excel
            </button>
          </div>
        ) : (
          ''
        )}
      </div>

      <div className="mt-2 " style={{ flexGrow: '1' }}>
        {loading ? (
          <Loader />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={filterDatatResponse}
              pagination={false}
              // className="table-responsive"
            />
          </>
        )}
      </div>
      <div className="d-flex justify-content-end mt-2">
        <Stack spacing={2}>
          {console.log('pagination in react ', pageCount, page)}
          <Pagination count={pageCount} page={page} onChange={handlePageChange} />
        </Stack>
      </div>
      {Object.keys(test).length > 0 ? (
        <div className="row">
          <div className="col-md-6">
            <CChart
              type="pie"
              data={{
                labels: Object.keys(test),
                datasets: [
                  {
                    backgroundColor: colorPalette.slice(0, Object.keys(test).length),
                    data: Object.values(test),
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    labels: {
                      // color: getStyle('--cui-body-color'),
                    },
                  },
                },
                aspectRatio: false,
              }}
              height={'300px'}
            />
          </div>
          <div className="col-md-6">
            <CChart
              type="doughnut"
              data={{
                labels: ['male', 'female', 'others'],
                datasets: [
                  {
                    label: 'Patinets by sex',
                    backgroundColor: colorPalette.slice(0, 3),
                    data: [filterDataBySex.male, filterDataBySex.female, filterDataBySex.other],
                  },
                ],
              }}
              options={{
                aspectRatio: false,
              }}
              height={'300px'}
            />
          </div>
        </div>
      ) : (
        ''
      )}

      <ToastContainer />
    </div>
  )
}

export default PatientReport
