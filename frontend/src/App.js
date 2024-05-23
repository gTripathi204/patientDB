import React, { Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './scss/style.scss'
import axios from 'axios'
import { getFetch } from './api/Api'

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
let API_URL = process.env.REACT_APP_API_URL

const App = () => {
  let data = localStorage.getItem('token')

  // console.log('Gaurav', data)
  // let [data, setData] = useState(null)

  // useEffect(() => {
  //   async function checkUser() {
  //     const checkToken = localStorage.getItem('token')
  //     if (checkToken) {
  //       let check = await getFetch(`${API_URL}/api/user/validate`)
  //       console.log('guarav session control', check?.data?.success)
  //       // consol
  //       if (check?.data?.success) {
  //         setData(localStorage.getItem('token'))
  //       } else {
  //         localStorage.removeItem('token')
  //         localStorage.removeItem('patientRecord')
  //         window.location.href = '/'
  //       }
  //     }
  //   }
  //   checkUser()
  // }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={loading}>
        <Routes>
          {data ? (
            <>
              <Route path="*" element={<DefaultLayout />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Login />} />
              <Route path="*" element={<Navigate to="/" />} />
              <Route path="/register" element={<Register />} />
              <Route path="/404" element={<Page404 />} />
              <Route path="/500" element={<Page500 />} />
            </>
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
