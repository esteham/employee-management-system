import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './index.css';
import './assets/css/header.css';
import Header from './components/Header';
import Home from './components/Home';
import LoginFetch from './components/LoginFetch'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<LoginFetch />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
