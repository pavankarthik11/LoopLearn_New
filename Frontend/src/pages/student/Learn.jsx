import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import SearchBar from '../../components/student/SearchBar'
import UserCard from '../../components/student/UserCard'
import { assets } from '../../assets/assets'
import Footer from '../../components/student/Footer'

const Learn = () => {
  const { navigate, allUsers, user, fetchAllUsers } = useContext(AppContext)
  const [filteredUser, setFilteredUser] = useState([])
  const [search, setSearch] = useState("")
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);
      await fetchAllUsers();
      setPageLoading(false);
    };
    loadData();
    // eslint-disable-next-line
  }, []);

  useEffect(()=>{
    if (allUsers && allUsers.length > 0) {
      const hasSkills = u => (u.skillsOffered && u.skillsOffered.length > 0) || (u.skillsWanted && u.skillsWanted.length > 0);
      const tempUsers = allUsers.filter(u => u._id !== user?._id && hasSkills(u));
      const q = search.trim().toLowerCase();
      setFilteredUser(
        tempUsers.filter(item => {
          if (!q) return true;
          // Full name or username match
          if (item.fullName?.toLowerCase().includes(q) || item.username?.toLowerCase().includes(q)) return true;
          // Skill match
          if (Array.isArray(item.skillsOffered)) {
            return item.skillsOffered.some(skill => {
              if (typeof skill === 'string') return skill.trim().toLowerCase().includes(q);
              if (typeof skill === 'object' && skill.skillName) return skill.skillName.trim().toLowerCase().includes(q);
              return false;
            });
          }
          return false;
        })
      );
    }
  },[allUsers, search, user])

  if (pageLoading) return <div className='p-8 text-center text-gray-500'>Loading users...</div>;

  return (
    <>
      <div className='relative md:px-36 px-8 pt-20 text-left'>
        <div className='flex md:flex-row flex-col gap-6 items-start justify-between w-full'>
          <div>
            <h1 className='text-4xl font-semibold text-gray-800'>Learn</h1>
            <p className='text-gray-500'>
              <span className='text-blue-600 cursor-pointer' onClick={() => navigate('/')}>Home</span> / <span>Learn</span></p>
          </div>
          <SearchBar value={search} onChange={setSearch} />
        </div>

      {search &&
        <div className='inline-flex items-center gap-4 px-4 py-2 border mt-8 mb-8 text-gray-600 '>
          <p>{search}</p>
          <img src={assets.cross_icon} alt="cross_icon" className='cursor-pointer' onClick={() => setSearch("")} />
        </div>
      }

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-3 md:p-0'>
          {filteredUser.map((user, index) => (<UserCard key={index} user={user} />))}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Learn