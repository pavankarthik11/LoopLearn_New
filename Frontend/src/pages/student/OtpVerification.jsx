import React, { useState } from 'react';
import { BACKEND_URL } from '../../context/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';

const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const email = query.get('email');

const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (isVerifying) return;
    setMessage('');
    setIsVerifying(true);
    const res = await fetch(`${BACKEND_URL}/api/users/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Email verified successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setMessage(data.message || 'Verification failed.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleVerify} className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">OTP Verification</h2>
        <p className="mb-4">Enter the OTP sent to your email</p>
        <input
          type="text"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          maxLength={6}
          required
          className="w-full border px-3 py-2 rounded mb-4"
        />
        <button type="submit" disabled={isVerifying} className={`w-full text-white py-2 rounded mb-4 ${isVerifying ? 'bg-blue-400' : 'bg-blue-600'}`}>
          {isVerifying ? 'Verifying...' : 'Verify'}
        </button>
        {message && <div className={message.includes('successfully') ? "text-green-600" : "text-red-600"}>{message}</div>}
      </form>
    </div>
  );
};

export default OtpVerification; 