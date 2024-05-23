import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { getFetch, postFetch, postFetchContent, postFetchData, postFetchFile } from 'src/api/Api'
import PatientInfoData from './PatientInfoData'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Loader from '../loader/Loader'
import AddPatientLoader from '../loader/AddPatientLoader'
import { useLocation } from 'react-router-dom'

import AddNewPatient from './AddNewPatient'

const PatientPage = () => {
  const location = useLocation()
  // console.log('location', Number(location?.state?.crn))
  let API_URL = process.env.REACT_APP_API_URL
  // const API_URL = process.env.API_URL
  let patientData = localStorage.getItem('patientRecord')
  let patientRecord = JSON.parse(patientData)
  const [updateState, setUpdateState] = useState(false)
  const [loader, setLoader] = useState(false)
  const [addPatientLoader, setaddPatientLoader] = useState(false)
  const [data, setData] = useState(false)
  const [search, setSearch] = useState('')
  const [patientSearch, setPatientSearch] = useState([])
  const [queryCRN, setQueryCRN] = useState('')
  const [updatedSearch, setUpdatedSearch] = useState('')
  useEffect(() => {
    setSearch('')

    const queryParams = new URLSearchParams(location.search)
    const searchParamValue = queryParams.get('crn')
    if (searchParamValue) {
      setQueryCRN(searchParamValue)
    }
  }, [])

  useEffect(() => {
    if (queryCRN !== '') {
      getSearchByPatient()
    }
  }, [queryCRN])

  const clearSearch = () => {
    try {
      setSearch('')
      setPatientSearch([])
    } catch (error) {
      console.log(error)
    }
  }

  const getSearchByPatient = async (searchCRN) => {
    try {
      let searchData = search || location?.state?.crn || queryCRN || searchCRN
      console.log('This is search ', searchData)

      if (searchData?.length === 0) {
        return
      }
      setLoader(true)
      const data = await getFetch(`${API_URL}/api/patient/${searchData}`)
      setPatientSearch(data?.data?.data)
      setLoader(false)
    } catch (error) {
      console.log(error)
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      getSearchByPatient()
    }
  }
  // console.log('updatedSearch', updatedSearch)
  useEffect(() => {
    if (updatedSearch !== '') {
      console.log('This is running', updatedSearch)
      setSearch(updatedSearch)
      getSearchByPatient(updatedSearch)
    }
  }, [updatedSearch])

  useEffect(() => {
    if (updateState === true) {
      getSearchByPatient()
    }
  }, [updateState])

  // let [dateAndTime, setDateAndTime] = useState(new Date())
  useEffect(() => {
    if (location?.state?.crn) {
      setSearch(location?.state?.crn)
      getSearchByPatient()
    }
  }, [location])

  return (
    <>
      <div>
        {!data && !addPatientLoader ? (
          <div>
            <p style={{ fontWeight: 'bolder' }}>Search Patient</p>
            <div className="search-container">
              <div className="search-input">
                <input
                  style={{ paddingLeft: '5px' }}
                  className="form-control"
                  placeholder="CR no. or Phone no."
                  type="text"
                  name="search"
                  value={search}
                  onKeyPress={handleKeyPress}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  className="btn btn-primary searchButton"
                  type="button"
                  onClick={getSearchByPatient}
                >
                  Search
                </button>
                {search?.length ? (
                  <button
                    className="btn btn-danger text-light clearButton"
                    type="button"
                    onClick={clearSearch}
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <div className="add-patient-btn">
                <button
                  type="button"
                  onClick={() => {
                    clearSearch()
                    setData(true)
                  }}
                  className="btn btn-outline-dark"
                >
                  Add a Patient
                </button>
              </div>
            </div>
          </div>
        ) : (
          ''
        )}

        {patientSearch?.length && !data && !addPatientLoader ? (
          <PatientInfoData
            patientSearch={patientSearch}
            setData={setData}
            getSearchByPatient={getSearchByPatient}
          />
        ) : (
          <div>
            {data ? (
              <AddNewPatient
                setData={setData}
                setUpdatedSearch={setUpdatedSearch}
                updatedSearch={updatedSearch}
                getSearchByPatient={getSearchByPatient}
              />
            ) : (
              <div>
                {!addPatientLoader ? (
                  <div className="loaderDivInPatientPage">{loader ? <Loader /> : 'No Data'}</div>
                ) : (
                  ''
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {addPatientLoader ? <AddPatientLoader /> : ''}
      <ToastContainer />
    </>
  )
}

export default PatientPage
