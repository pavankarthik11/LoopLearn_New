import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/student/PasswordInput';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const Register = () => {
  const { register, loading, error } = useContext(AppContext);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const navigate = useNavigate();

  // Upload avatar directly to Cloudinary from the browser
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'looplearn_avatars');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!res.ok) throw new Error('Avatar upload failed');
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!avatar) {
      setFormError('Please select an avatar image.');
      return;
    }

    try {
      // Step 1: Upload avatar directly to Cloudinary (fast — from user's browser)
      setUploadingAvatar(true);
      let avatarUrl;
      try {
        avatarUrl = await uploadToCloudinary(avatar);
      } catch (err) {
        setFormError('Failed to upload avatar. Please try a smaller image.');
        setUploadingAvatar(false);
        return;
      }
      setUploadingAvatar(false);

      // Step 2: Send JSON data (with avatar URL) to backend — no file upload needed
      const success = await register({
        fullName,
        email,
        username,
        password,
        phone,
        avatarUrl,
      });

      if (success) {
        setSuccessMessage('Registration successful! Please check your email for a verification link or code.');
      } else {
        setFormError('Registration failed. Please check your details.');
      }
    } catch (err) {
      setFormError('Something went wrong. Please try again.');
    }
  };

  const isSubmitting = loading || uploadingAvatar;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <div className="mb-4">
          <label className="block mb-1">Full Name</label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <PasswordInput value={password} onChange={e => setPassword(e.target.value)} required className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Phone</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Avatar</label>
          <input type="file" accept="image/*" onChange={e => setAvatar(e.target.files[0])} className="w-full" />
        </div>
        {(formError || error) && <div className="text-red-500 mb-4">{formError || error}</div>}
        {successMessage && (
          <div className="text-green-600 mb-4">
            {successMessage}
            <div className="mt-4">
              <button
                type="button"
                className="w-full bg-blue-500 text-white py-2 rounded mt-2"
                onClick={() => navigate(`/otp-verification?email=${encodeURIComponent(email)}`)}
              >
                Enter Verification Code
              </button>
            </div>
          </div>
        )}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={isSubmitting}>
          {uploadingAvatar ? 'Uploading avatar...' : loading ? 'Registering...' : 'Register'}
        </button>
        <div className="mt-4 text-center">
          <span>Already have an account? </span>
          <button type="button" className="text-blue-600 underline" onClick={() => navigate('/login')}>Login</button>
        </div>
      </form>
    </div>
  );
};

export default Register;