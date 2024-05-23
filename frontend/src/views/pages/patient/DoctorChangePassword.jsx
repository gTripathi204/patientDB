import { cilLockLocked, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
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
import React, { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { putFetchData } from 'src/api/Api'
import SpinnerOverlay from 'src/views/publicItems/ SpinnerOverlay'
import { useNavigate } from 'react-router-dom'

const DoctorChangePassword = () => {
  const navigate = useNavigate()
  const API_URL = process.env.REACT_APP_API_URL
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState({
    password: '',
    reEnterPassword: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setData({ ...data, [name]: value })
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      if (data.password.length < 4) {
        toast.warning('Password length should be atleast 4 digits!!')
        return
      }
      setLoading(true)

      const res = await putFetchData(`${API_URL}/api/user/update`, data)
      if (res?.data.success) {
        localStorage.removeItem('token')
        localStorage.removeItem('patientRecord')
        toast.success(res?.data?.message, { autoClose: 1000 })
        setTimeout(() => {
          navigate('/login')
          window.location.reload()
          setLoading(false)
        }, 1000)
      } else {
        setLoading(false)
        toast.warning(res?.data?.message, { autoClose: 1000 })
      }
      console.log('res', res)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
    // if (data.password === data.reEnterPassword) {
    //   console.log('Yahh yahh yahhh')
    // } else {
    //   toast.warning('Password and Re-enter password in not matched', { autoClose: 1000 })
    //   console.log('nooooooooooooo')
    // }
  }

  console.log('Guarva', data)

  return (
    <div style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-light d-flex flex-row align-items-center" style={{ flex: 1 }}>
        {loading ? <SpinnerOverlay message="Changing Password...." /> : ''}
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={5}>
              <CCardGroup>
                <CCard className="p-4">
                  <CCardBody>
                    <CForm>
                      <h3>Change Password</h3>
                      <p className="text-medium-emphasis">Please enter the new password !</p>
                      {/* <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Email"
                          autoComplete="email"
                          name="email"
                          //   value={data.email}
                          //   onChange={handleChange}
                        />
                      </CInputGroup> */}
                      <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type="text"
                          placeholder="New password"
                          //   autoComplete="current-password"
                          name="password"
                          value={data.password}
                          onChange={handleChange}
                        />
                      </CInputGroup>
                      <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type="password"
                          placeholder="Re-enter password"
                          //   autoComplete="current-password"
                          name="reEnterPassword"
                          value={data.reEnterPassword}
                          onChange={handleChange}
                        />
                      </CInputGroup>
                      <CRow>
                        <CCol xs={12} style={{ textAlign: 'center' }}>
                          <CButton
                            color="primary"
                            className="px-5"
                            type="submit"
                            onClick={(e) => submitHandler(e)}
                          >
                            Submit
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
      {/* <footer className="bg-light py-2 text-left" style={{ paddingLeft: '1rem' }}>
        Copyright &copy; {date} DevLogix Technology Pvt. Ltd. All rights reserved.
      </footer> */}
    </div>
  )
}

export default DoctorChangePassword
