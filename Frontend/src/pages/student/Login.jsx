import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/student/PasswordInput';

const Login = () => {
  const { login, loading, error } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const result = await login(email, password);
    if (result === true) {
      navigate('/');
    } else {
      // result is the error message string returned from login()
      setFormError(result || 'Invalid credentials or server error.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <PasswordInput value={password} onChange={e => setPassword(e.target.value)} required className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="mb-4 text-right">
          <button type="button" className="text-blue-600 underline text-sm" onClick={() => navigate('/forgot-password')}>
            Forgot Password?
          </button>
        </div>
        {(formError || error) && <div className="text-red-500 mb-4">{formError || error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="mt-4 text-center">
          <span>Don't have an account? </span>
          <button type="button" className="text-blue-600 underline" onClick={() => navigate('/register')}>Register</button>
        </div>
      </form>
    </div>
  );
};

export default Login; 