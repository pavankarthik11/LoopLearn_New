import React, { useContext, useEffect, useState, useRef } from 'react'
import { AppContext } from '../../context/AppContext'
import SearchBar from '../../components/student/SearchBar'
import UserCard from '../../components/student/UserCard'
import { assets } from '../../assets/assets'
import Footer from '../../components/student/Footer'

const Swap = () => {
  const { navigate, allUsers, user, fetchAllUsers } = useContext(AppContext)
  const [filteredUser, setFilteredUser] = useState([])
  const [search, setSearch] = useState("")
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const filterRef = useRef();

  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);
      await fetchAllUsers();
      setPageLoading(false);
    };
    loadData();
    // eslint-disable-next-line
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [filterOpen]);

  useEffect(()=>{
    if (allUsers && allUsers.length > 0 && user) {
      const hasSkills = u => (u.skillsOffered && u.skillsOffered.length > 0) || (u.skillsWanted && u.skillsWanted.length > 0);
      const normalize = s => (typeof s === 'string' ? s.trim().toLowerCase() : (s.skillName || '').trim().toLowerCase());
      const userSkillsOfferedNames = (user.skillsOffered || []).map(normalize);
      const userSkillsWanted = (user.skillsWanted || []).map(s => s.trim().toLowerCase());

      let swappableUsers = allUsers
        .filter(u => u._id !== user._id && hasSkills(u))
        .filter(u => {
          const uSkillsOffered = (u.skillsOffered || []).map(normalize);
          const uSkillsWanted = (u.skillsWanted || []).map(s => s.trim().toLowerCase());
          const canSwap =
            uSkillsOffered.some(skill => userSkillsWanted.includes(skill)) &&
            userSkillsOfferedNames.some(skill => uSkillsWanted.includes(skill));
          return canSwap;
        });

      // Apply skill filter if selected
      if (selectedSkill) {
        swappableUsers = swappableUsers.filter(u => {
          const uSkillsWanted = (u.skillsWanted || []).map(s => s.trim().toLowerCase());
          return uSkillsWanted.includes(selectedSkill);
        });
      }

      const q = search.trim().toLowerCase();
      setFilteredUser(
        swappableUsers.filter(item => {
          if (!q) return true;
          if (item.fullName?.toLowerCase().includes(q) || item.username?.toLowerCase().includes(q)) return true;
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
  },[allUsers, search, user, selectedSkill])

  if (pageLoading) return <div className='p-8 text-center text-gray-500'>Loading users...</div>;

  return (
    <>
      <div className='relative md:px-36 px-8 pt-20 text-left'>
        <div className='flex md:flex-row flex-col gap-6 items-start justify-between w-full'>
          <div>
            <h1 className='text-4xl font-semibold text-gray-800'>Swap</h1>
            <p className='text-gray-500'>
              <span className='text-blue-600 cursor-pointer' onClick={() => navigate('/')}>Home</span> / <span>Swap</span></p>
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-screen-md">
                <SearchBar value={search} onChange={setSearch} />
              </div>
            </div>
            <button
              className="ml-3 p-2 rounded-full hover:bg-gray-100 transition relative"
              aria-label="Filter"
              onClick={() => setFilterOpen(f => !f)}
              ref={filterRef}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12M9 18h6" />
              </svg>
              {filterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-50">
                  <div className="p-2 border-b font-semibold text-gray-700">Filter by your skills</div>
                  {(user.skillsOffered && user.skillsOffered.length > 0) ? (
                    user.skillsOffered.map((skill, idx) => {
                      const skillName = typeof skill === 'string' ? skill : skill.skillName;
                      const normalized = skillName.trim().toLowerCase();
                      return (
                        <div
                          key={idx}
                          className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${selectedSkill === normalized ? 'bg-blue-200 font-bold' : ''}`}
                          onClick={() => { setSelectedSkill(normalized); setFilterOpen(false); }}
                        >
                          {skillName}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-2 text-gray-400">No skills offered</div>
                  )}
                  {selectedSkill && (
                    <div
                      className="px-4 py-2 cursor-pointer text-blue-600 hover:underline border-t"
                      onClick={() => { setSelectedSkill(null); setFilterOpen(false); }}
                    >
                      Clear filter
                    </div>
                  )}
                </div>
              )}
            </button>
          </div>
        </div>

      {search &&
        <div className='inline-flex items-center gap-4 px-4 py-2 border mt-8 mb-8 text-gray-600 '>
          <p>{search}</p>
          <img src={assets.cross_icon} alt="cross_icon" className='cursor-pointer' onClick={() => setSearch("")} />
        </div>
      }

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-3 md:p-0'>
          {filteredUser.length === 0 ? (
            <div className='col-span-full text-center text-gray-500 text-lg py-10'>No swaps available</div>
          ) : (
            filteredUser.map((user, index) => (<UserCard key={index} user={user} />))
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Swap