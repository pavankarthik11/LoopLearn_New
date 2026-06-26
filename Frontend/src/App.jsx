import React from 'react'
import { Route,Routes, useMatch } from 'react-router-dom'
import Home from './pages/student/Home'
import MyLearnings from './pages/student/MyLearnings'
import CourseDetails from './pages/student/UserDetails'
import Loading from './components/student/Loading'
import Navbar from './components/student/Navbar';

import MyTeachings from './pages/student/MyTeachings'
import Swap from './pages/student/Swap'
import Learn from './pages/student/Learn'
import Login from './pages/student/Login'
import Register from './pages/student/Register'
import EditProfile from './pages/student/EditProfile';
import Requests from './pages/student/Requests';
import VerifyEmail from './pages/student/VerifyEmail';
import OtpVerification from './pages/student/OtpVerification';
import ForgotPassword from './pages/student/ForgotPassword';

const App = () => {
  return (
    <div className='text-default min-h-screen bg-white'>
      { <Navbar />}
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/Mylearnings' element={<MyLearnings />}/>
        <Route path='/Mylearnings/:input' element={<MyLearnings />}/>
        <Route path='/MyTeachings' element={<MyTeachings />}/>
        <Route path='/MyTeachings/:input' element={<MyTeachings />}/>
        <Route path='/Swap' element={<Swap />}/>
        <Route path='/Swap/:input' element={<Swap />}/>
        <Route path='/Learn' element={<Learn />}/>
        <Route path='/Learn/:input' element={<Learn />}/>
        <Route path='/user/:username' element={<CourseDetails />}/>
        <Route path='/loading/:path' element={<Loading />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/register' element={<Register />}/>
        <Route path='/profile/edit' element={<EditProfile />}/>
        <Route path='/requests' element={<Requests />}/>
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/otp-verification' element={<OtpVerification />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
      </Routes>
    </div>
  )
}

export default App