// src/Navbar.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) {
      setUserName(name);
    }
  }, []); // 👈 runs only once when Navbar loads

  const handleLogout = () => {
    localStorage.clear(); // Clears all localStorage (userName, isLoggedIn, favorites, etc)
    setUserName('User'); // Reset username immediately
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', background: '#f0f0f0', alignItems: 'center' }}>
      {/* Left side: Weather App heading */}
      <h2 style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Weather App</h2>

      {/* Right side: Favorites button + User info + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          onClick={() => navigate('/favorites')} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
        >
          Favorites
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaUserCircle size={24} />
          <span style={{ fontSize: '16px' }}>{userName}</span>
          <button 
            onClick={handleLogout} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
