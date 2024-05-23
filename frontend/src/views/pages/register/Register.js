import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

import { BiChevronDown } from 'react-icons/bi' // Assuming you have BiChevronDown from react-icons for dropdown icon
import { getFetch, postFetchData } from 'src/api/Api'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import SpinnerOverlay from 'src/views/publicItems/ SpinnerOverlay'
import { faL, faLaptopHouse } from '@fortawesome/free-solid-svg-icons'

const Register = () => {
  const navigate = useNavigate()
  const API_URL = process.env.REACT_APP_API_URL
  const [department, setDepartment] = useState([])
  const [data, setData] = React.useState({
    name: '',
    email: '',
    password: '',
    department_id: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setData({ ...data, [name]: value })
  }

  const handleSubmit = async (e) => {
    try {
      if (data.name.length < 4) {
        toast.warning('Please enter a name!!')
        // toast.warning('Password length should be atleast 4 digits!!')
        return
      }
      if (data.email.length < 8) {
        toast.warning('Please enter a valid email!!')
        return
      }
      if (data.password.length < 4) {
        toast.warning('Password length should be atleast 4 digits!!')
        return
      }
      if (data.department_id.length === 0) {
        toast.warning('Please select a Department!!')
        return
      }
      setLoading(true)
      e.preventDefault()
      console.log('data', data)
      const res = await postFetchData(`${API_URL}/api/user/create`, data)
      console.log('user creation', res?.response?.data?.success)

      if (res?.response?.data?.success === false) {
        setLoading(false)
        return toast.warning(res?.response?.data?.message)
      }

      if (res.success === true) {
        toast.success('Doctor Created Successfully')
        setTimeout(() => {
          setLoading(false)
          navigate('/')
        }, 2000)
      } else {
        setLoading(false)
        toast.warning('Something went wrong')
      }
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const getAllDepartments = async () => {
    try {
      const res = await getFetch(`${API_URL}/api/department/`)
      console.log('res', res.data.data)
      setDepartment(res.data.data)
    } catch (error) {
      console.log('error')
    }
  }

  const nevigateToLogin = () => {
    navigate('/')
  }

  useEffect(() => {
    getAllDepartments()
  }, [])
  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      {loading ? <SpinnerOverlay message="Loading..." /> : ''}
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm>
                  <h1>Register</h1>
                  <p className="text-medium-emphasis">Create your account</p>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Full Name"
                      autoComplete="username"
                      name="name"
                      value={data.name}
                      onChange={handleChange}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      placeholder="Email"
                      autoComplete="email"
                      name="email"
                      value={data.email}
                      onChange={handleChange}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      name="password"
                      value={data.password}
                      onChange={handleChange}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <BiChevronDown />
                    </CInputGroupText>
                    <select
                      className="form-select"
                      name="department_id"
                      value={data.department_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Department</option>
                      {department?.map((elem) => {
                        return (
                          <>
                            <option value={elem?._id}>{elem?.departmentName}</option>
                          </>
                        )
                      })}
                    </select>
                  </CInputGroup>
                  <div className="d-grid">
                    <CButton color="success" onClick={handleSubmit}>
                      Create Account
                    </CButton>
                  </div>
                  <div>
                    <p style={{ display: 'flex', marginTop: '1rem' }}>
                      To Loggin Click! &nbsp;
                      <p style={{ cursor: 'pointer', color: 'blue' }} onClick={nevigateToLogin}>
                        Signin
                      </p>
                    </p>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
      <ToastContainer />
    </div>
  )
}

export default Register
