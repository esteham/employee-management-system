import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <nav className="nav container">
        <div className="logo-container">
          <h1 className="logo">MyWebsite</h1>
        </div>

        <input type="checkbox" id="menu-toggle" className="menu-toggle" />
        <label htmlFor="menu-toggle" className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </label>

        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>About</NavLink>
          </li>
          <li>
            <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Contact</NavLink>
          </li>

          {!user ? (
            <>
              <li>
                <NavLink to="/LoginFetch" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Login</NavLink>
              </li>
              <li>
                <NavLink to="/register" className={({ isActive }) => isActive ? "nav-link active register-btn" : "nav-link register-btn"}>Register</NavLink>
              </li>
            </>
          ) : (
            <li className="dropdown">
              <span className="nav-link dropdown-toggle">{user.username}</span>
              <ul className="dropdown-menu">
                <li><NavLink to="/profile" className="nav-link">Profile</NavLink></li>
                <li><button className="nav-link" onClick={handleLogout}>Logout</button></li>
              </ul>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
