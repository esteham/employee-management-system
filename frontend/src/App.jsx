import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import './assets/css/header.css';
import Header from './components/Header';
import Home from './components/Home';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
