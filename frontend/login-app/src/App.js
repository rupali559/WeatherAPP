import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from './HomePage'; // Import HomePage

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
          window.location.href = '/home'; // Redirect to the homepage after login
        }
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (err) {
      alert('Server error. Please try again later.');
    }
  };

  return (
    <Router>
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

      <Routes>
        <Route path="/home" element={<HomePage />} /> {/* Home route */}
      </Routes>
    </Router>
  );
}

export default App;

