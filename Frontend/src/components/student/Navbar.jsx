import React, { useContext, useState, useRef, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isEducator, user, isSignedIn, logout, pendingRequestsCount, pendingMeetingRequestsCount } = useContext(AppContext);

  const isCourseListPage = location.pathname.includes('/course-list');

  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  // Close dropdown on outside click (desktop)
  useEffect(() => {
    function handleClickOutside(event) {
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target)) {
        setDesktopDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setMobileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14
      lg:px-36 border-b border-gray-500 py-2 ${isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'}`}>
      <div onClick={() => navigate('/')} className='flex items-center gap-2 cursor-pointer'>
        <img src={assets.logo_icon} alt="Logo Icon" className='w-8 lg:w-10' />
        <img src={assets.logo} alt="Logo Text" className='w-32 lg:w-40' />
      </div>
      
      {/* Desktop Nav */}
        <div className='hidden md:flex items-center gap-5 text-gray-500'>
          <div className='flex items-center gap-5'>
          {isSignedIn && user && (
              <>
              <button onClick={() => navigate('/')}>Home</button> |
              <button onClick={() => navigate('/Swap')}>Swap</button> |
              <button onClick={() => navigate('/Learn')}>Learn</button> |
              <button onClick={() => navigate('/requests')} className="relative">
                Requests
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-3 inline-block w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white"></span>
                )}
              </button>
            </>
          )}
        </div>
        {isSignedIn && user ? (
          <div className='flex items-center gap-2 relative' ref={desktopDropdownRef}>
            <span className='mr-2 whitespace-nowrap'>Hi! {user.fullName?.split(' ')[0] || user.username}</span>
            <button
              className='rounded-full bg-blue-100 p-2 focus:outline-none flex items-center justify-center'
              onClick={() => setDesktopDropdownOpen((open) => !open)}
            >
              {user.avatar ? (
                <img src={user.avatar} alt='avatar' className='w-8 h-8 rounded-full object-cover' />
              ) : (
                <img src={assets.user_icon} alt='user' className='w-8 h-8' />
              )}
            </button>
            {desktopDropdownOpen && (
              <div className='absolute left-1/2 -translate-x-1/2 top-full mt-2 min-w-[12rem] bg-white border rounded shadow-lg z-50 flex flex-col items-center'>
                <button
                  className='block w-full text-left px-4 py-2 hover:bg-gray-100'
                  onClick={async () => {
                    console.log('Logout button clicked (desktop)');
                    setDesktopDropdownOpen(false);
                    await logout();
                  }}
                >
                  Logout
                </button>
                <button
                  className='block w-full text-left px-4 py-2 hover:bg-gray-100'
                  onClick={() => {
                    console.log('My Profile button clicked (desktop)');
                    setDesktopDropdownOpen(false);
                    navigate('/profile/edit');
                  }}
                >
                  My Profile
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className='bg-blue-600 text-white px-5 py-2 rounded-full'>Login</button>
        )}
        </div>

      {/* Mobile Nav */}
        <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
          <div className='flex items-center gap-1 sm:gap-2 max-sm:text-xs'>
          {isSignedIn && user && (
              <>
              <button onClick={() => navigate('/educator')}>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button> |
              <Link to='/my-enrollments'>My Enrollments</Link>
              </>
          )}
        </div>
        {isSignedIn && user ? (
          <div className='relative' ref={mobileDropdownRef}>
            <button
              className='rounded-full bg-blue-100 p-2 focus:outline-none'
              onClick={() => setMobileDropdownOpen((open) => !open)}
            >
              <img src={assets.user_icon} alt='user' className='w-8 h-8' />
            </button>
            {mobileDropdownOpen && (
              <div className='absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50'>
                <button
                  className='block w-full text-left px-4 py-2 hover:bg-gray-100'
                  onClick={() => {
                    console.log('My Profile button clicked (mobile)');
                    setMobileDropdownOpen(false);
                    navigate('/profile/edit');
                  }}
                >
                  My Profile
                </button>
                <button
                  className='block w-full text-left px-4 py-2 hover:bg-gray-100'
                  onClick={async () => {
                    console.log('Logout button clicked (mobile)');
                    setMobileDropdownOpen(false);
                    await logout();
                  }}
                >
                  Logout
                </button>

              </div>
            )}
          </div>
        ) : (
          <button onClick={() => navigate('/login')}><img src={assets.user_icon} alt='Login' /></button>
        )}
        </div>
    </div>
  );
}

export default Navbar;
