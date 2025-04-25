// src/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (type) => {
    const endpoint = type === 'register' ? 'register' : 'login';

    try {
      const res = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success) {
        alert(`${type} success!`);
        if (type === 'login') {
          localStorage.setItem('isLoggedIn', 'true');
          navigate('/home');
        }
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (err) {
      alert('Server error. Please try again later.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login / Register</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      /><br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      /><br /><br />

      <button onClick={() => handleSubmit('login')}>Login</button>
      <button onClick={() => handleSubmit('register')}>Register</button>
    </div>
  );
};

export default LoginPage;
