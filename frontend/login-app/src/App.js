// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage';

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />  {/* <-- open homepage */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<LoginPage />} />
    </Routes>
  </Router>
  );
}

export default App;
