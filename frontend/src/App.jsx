import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './index.css';
import './assets/css/header.css';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import LoginFetch from './pages/LoginFetch';
import GeneratePayroll from './pages/Payroll/GeneratePayroll';
import HrDashboard from './components/HR/HrDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import EmployeeDashboard from './components/Employee/EmployeeDashboard';

// ProtectedRoute Component with loading check
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center mt-5">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/LoginFetch" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Role-based dynamic redirect
const RoleDashboard = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'hr':
      return <HrDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/About" element={<About />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/LoginFetch" element={<LoginFetch />} />

          {/* Protected Routes */}
          <Route path="/GeneratePayroll" element={
            <ProtectedRoute roles={['admin', 'hr']}>
              <GeneratePayroll />
            </ProtectedRoute>
          } />

          <Route path="/HrDashboard" element={
            <ProtectedRoute roles={['hr']}>
              <HrDashboard />
            </ProtectedRoute>
          } />

          <Route path="/AdminDashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/EmployeeDashboard" element={
            <ProtectedRoute roles={['employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />

          {/* Dynamic Dashboard Redirect */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <RoleDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
