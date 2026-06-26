import React, { useContext, useState, useEffect } from 'react'
import ScrollToHash from '../../components/student/scrollToHash'
import UsersSection from '../../components/student/UsersSection'
import CallToAction from '../../components/student/CallToAction'
import Footer from '../../components/student/Footer'
import LandingPage from '../../components/student/LandingPage'
import Loading from '../../components/student/Loading'
import { AppContext } from '../../context/AppContext'


const Home = () => {
  const { user, isSignedIn, authLoading } = useContext(AppContext)
  const [loadingTimedOut, setLoadingTimedOut] = useState(false)

  // Safety: never show loading spinner for more than 10 seconds
  useEffect(() => {
    if (authLoading) {
      const timeout = setTimeout(() => setLoadingTimedOut(true), 10000)
      return () => clearTimeout(timeout)
    } else {
      setLoadingTimedOut(false)
    }
  }, [authLoading])

  // Floating messaging button handler (placeholder)
  const handleMessageClick = () => {
    alert('Messaging feature coming soon!')
  }

  // Show loading only while session is being validated, with a safety timeout
  if (authLoading && isSignedIn && !user && !loadingTimedOut) {
    return <Loading />
  }

  return (
    <>
    {isSignedIn && user ? 
      <div className='flex flex-col  space-y-7 text-center'>
          <UsersSection />
          <CallToAction />
          <Footer />
          <ScrollToHash />

      {/* Floating Messaging Button */}
      <div className="fixed bottom-8 right-8 z-50 group">
        <button
          onClick={handleMessageClick}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-start transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 overflow-hidden w-14 h-14 pl-4 group-hover:w-36 group-hover:pr-6"
          aria-label="Open messaging"
          style={{ minWidth: '3.5rem', minHeight: '3.5rem' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="white"
            className="w-6 h-6 flex-shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3.75h6m-10.125 5.625V6.75A2.25 2.25 0 015.625 4.5h12.75a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25H6.75L3.375 21v-3.375z"
            />
          </svg>
          <span className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300 text-base font-medium whitespace-nowrap">
            Messages
          </span>
        </button>
      </div>


      </div>
      :
      <div>
        <LandingPage />
      </div>
    }
    

    </>
  )
}

export default Home