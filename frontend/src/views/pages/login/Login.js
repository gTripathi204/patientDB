import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
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
import { postFetchData } from 'src/api/Api'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import SpinnerOverlay from 'src/views/publicItems/ SpinnerOverlay'

const Login = () => {
  let API_URL = process.env.REACT_APP_API_URL
  const REGISTER_URL = `${API_URL}/register`
  const navigate = useNavigate()
  const [data, setData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setData({ ...data, [name]: value })
  }

  const date = new Date().getFullYear()

  const handleSubmit = async (e) => {
    try {
      setLoading(true)
      e.preventDefault()
      const dataa = await postFetchData(`${API_URL}/api/user/login`, data)
      if (dataa.success === true) {
        toast.success('Login successfully')
        localStorage.setItem('token', dataa.token)
        localStorage.setItem('patientRecord', JSON.stringify(dataa?.user))
        window.location.reload()
        setLoading(false)
      }

      if (dataa?.response?.data?.success === false) {
        setLoading(false)
        toast.warning('Invalid Credentials')
      }
    } catch (error) {
      setLoading(false)
      toast.warning('Something went wrong')
      console.log(error)
    }
  }

  const nevigateToRegister = () => {
    navigate('/register')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-light d-flex flex-row align-items-center" style={{ flex: 1 }}>
        {loading ? <SpinnerOverlay message="Logging.." /> : ''}
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={5}>
              <CCardGroup>
                <CCard className="p-4">
                  <CCardBody>
                    <CForm onSubmit={handleSubmit}>
                      <h2>Login</h2>
                      <p className="text-medium-emphasis">Sign In to your account</p>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Email"
                          autoComplete="email"
                          name="email"
                          value={data.email}
                          onChange={handleChange}
                        />
                      </CInputGroup>
                      <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type="password"
                          placeholder="Password"
                          autoComplete="current-password"
                          name="password"
                          value={data.password}
                          onChange={handleChange}
                        />
                      </CInputGroup>
                      <CRow>
                        <CCol xs={12} style={{ textAlign: 'center' }}>
                          <CButton color="primary" className="px-5" type="submit">
                            Login
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  </CCardBody>
                </CCard>
              </CCardGroup>
            </CCol>
          </CRow>
        </CContainer>
      </div>
      {/* <footer className="bg-dark text-light py-2 text-center">
        &copy; 2024 DevLogix Technology Pvt. Ltd. All rights reserved.
      </footer> */}
      <ToastContainer />
      <footer className="bg-light py-2 text-left" style={{ paddingLeft: '1rem' }}>
        Copyright &copy; {date} Gaurav
      </footer>
    </div>
  )
}

export default Login
