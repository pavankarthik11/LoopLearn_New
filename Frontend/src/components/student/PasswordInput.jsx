import React, { useState } from 'react';

const EyeIcon = ({ visible }) => (
  visible ? (
    // Eye open outline SVG (Heroicons outline)
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ) : (
    // Eye off outline SVG (Heroicons outline)
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 002.25 12s3.75 7.5 9.75 7.5c2.042 0 3.82-.5 5.28-1.223M6.53 6.53A10.45 10.45 0 0112 4.5c6 0 9.75 7.5 9.75 7.5a10.45 10.45 0 01-1.477 2.223M6.53 6.53l10.94 10.94M6.53 6.53L3.98 8.223m0 0l10.94 10.94" />
    </svg>
  )
);

const PasswordInput = ({ value, onChange, placeholder = "Password", ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border px-3 py-2 rounded pr-10"
        {...props}
      />
      <span
        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
        onClick={() => setShow(s => !s)}
        tabIndex={0}
        role="button"
        aria-label={show ? "Hide password" : "Show password"}
      >
        <EyeIcon visible={show} />
      </span>
    </div>
  );
};

export default PasswordInput; 