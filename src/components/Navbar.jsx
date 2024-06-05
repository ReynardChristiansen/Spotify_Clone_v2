import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Navbar = () => {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(()=>{
    const name = Cookies.get('name');
    if (name) {
      setUserName(name.charAt(0).toUpperCase()); // Get the first character and capitalize it
    }
  }, [])

  const handleLogout = () => {
    // Clear the cookies or perform any other logout actions
    Cookies.remove('token');
    Cookies.remove('name');
    Cookies.remove('role');
    Cookies.remove('id');
    setUserName('')
    // Redirect to the login page
    navigate('/')
    window.location.reload();
  };

  return (
    <>
      <div className='w-full flex justify-between items-center font-semibold'>
        <div className='flex items-center gap-2'>
          <img onClick={() => navigate(-1)} className='w-8 bg-black p-2 rounded-2xl cursor-pointer' src={assets.arrow_left} alt="Arrow Left"></img>
          <img onClick={() => navigate(+1)} className='w-8 bg-black p-2 rounded-2xl cursor-pointer' src={assets.arrow_right} alt="Arrow Right"></img>
        </div>

        <div className='flex items-center gap-4'>
        <p 
          onClick={handleLogout} 
          className='cursor-pointer hover:text-gray-800 hover:bg-gray-300 px-3 py-2 rounded-lg'
        >Logout</p>
          <p className='bg-[#4cabe6] text-black w-7 h-7 rounded-full flex items-center justify-center'>{userName}</p>
        </div>

      </div>

    </>
  )
}

export default Navbar;
