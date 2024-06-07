import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Sidebar from './components/Sidebar';
import Display from './components/Display';
import Player from './components/Player';
import { PlayerContext } from './context/PlayerContext';
import { Link } from 'react-router-dom';

const App = () => {
  const [token, setToken] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userToken, setUserToken] = useState('');
  const [error, setError] = useState('');
  const usernameRef = useRef('');
  const { audioRef, track } = useContext(PlayerContext);
  const [formData, setFormData] = useState({
    user_name: '',
    user_password: '',
  });

  const [formDataRegister, setFormDataRegister] = useState({
    user_name: '',
    user_password: '',
    confirm_password: ''
  });

  const [isRegistering, setIsRegistering] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleInputChangeRegister = (e) => {
    const { name, value } = e.target;
    setFormDataRegister({ ...formDataRegister, [name]: value });
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://hirmify-api.vercel.app/api/users/login', {
        user_name: formData.user_name,
        user_password: formData.user_password
      });

      if (response.data.token) {
        Cookies.set('token', response.data.token, { expires: 7 });
        Cookies.set('name', response.data.user_name, { expires: 7 });
        Cookies.set('role', response.data.user_role, { expires: 7 });
        Cookies.set('id', response.data.user_id, { expires: 7 });

        setUserName(response.data.user_name);
        setUserRole(response.data.user_role);
        setUserToken(response.data.token);
        setUserId(response.data.user_id);

        setError(null);

        window.location.reload();
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid credentials');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formDataRegister.user_password !== formDataRegister.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    const dataForm = {
      user_name: formDataRegister.user_name,
      user_password: formDataRegister.user_password,
      user_role: "User"
    }

    try {
      const response = await axios.post('https://hirmify-api.vercel.app/api/users/register', dataForm);
      if (response.status === 201) {
        try {
          const response = await axios.post('https://hirmify-api.vercel.app/api/users/login', {
            user_name: formDataRegister.user_name,
            user_password: formDataRegister.user_password
          });

          if (response.data.token) {
            Cookies.set('token', response.data.token, { expires: 7 });
            Cookies.set('name', response.data.user_name, { expires: 7 });
            Cookies.set('role', response.data.user_role, { expires: 7 });
            Cookies.set('id', response.data.user_id, { expires: 7 });

            setUserName(response.data.user_name);
            setUserRole(response.data.user_role);
            setUserToken(response.data.token);
            setUserId(response.data.user_id);

            setError(null);

            window.location.reload();
          }
        } catch (error) {
          console.error('Login failed:', error);
          setError('Invalid credentials');
        }
      } else {
        console.error('Failed to register:', response.status);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setError('Registration failed. Please try again.');
    }
  };

  useEffect(() => {
    setToken(Cookies.get('token'));
    usernameRef.current.focus();
  }, []);

  return (
    <div>
      {token ? (
        <div className='h-screen bg-black'>
          <div className='h-[90%] flex'>
            <Sidebar />
            <Display />
          </div>
          <Player />

          <audio ref={audioRef} src={track.url} preload='auto'></audio>
        </div>
      ) : (
        <div className="h-screen bg-black flex justify-center items-center">
          <div className="bg-gray-100 p-8 rounded shadow-md">
            <h2 className="text-2xl font-bold mb-4">{isRegistering ? 'Register' : 'Login'}</h2>
            <form onSubmit={isRegistering ? handleRegister : handleLogin}>
              <div className="mb-4">
                <label htmlFor="user_name" className="block text-sm font-medium text-gray-700">
                  Username:
                </label>
                <input
                  ref={usernameRef}
                  type="text"
                  name="user_name"
                  id="user_name"
                  value={!isRegistering ? formData.user_name : formDataRegister.user_name}
                  onChange={!isRegistering ? handleInputChange : handleInputChangeRegister}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="user_password" className="block text-sm font-medium text-gray-700">
                  Password:
                </label>
                <input
                  type="password"
                  name="user_password"
                  id="user_password"
                  value={!isRegistering ? formData.user_password : formDataRegister.user_password}
                  onChange={!isRegistering ? handleInputChange : handleInputChangeRegister}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              {isRegistering && (
                <div className="mb-4">
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                    Confirm Password:
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    id="confirm_password"
                    value={formDataRegister.confirm_password}
                    onChange={handleInputChangeRegister}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              )}
              <button
                className="w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
                type="submit"
              >
                {isRegistering ? 'Register' : 'Login'}
              </button>
            </form>
            {error && <div className="text-red-500 mt-2">{error}</div>}
            <div className="mt-4 text-sm text-gray-600">
              {isRegistering ? (
                <>
                  Already have an account?{' '}
                  <button
                    className="text-indigo-600 hover:underline"
                    onClick={() => setIsRegistering(false)}
                  >
                    Login here
                  </button>.
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    className="text-indigo-600 hover:underline"
                    onClick={() => setIsRegistering(true)}
                  >
                    Register here
                  </button>.
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
