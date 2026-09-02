import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Search, Upload, ShoppingCart, LayoutDashboard } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Search size={24} color="var(--accent)" />
          <span>CitizenLens</span>
        </Link>

        <div className="navbar-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          {user?.role === 'citizen' && (
            <>
              <NavLink to="/upload" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <Upload size={18} /> Upload
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <LayoutDashboard size={18} /> My Dashboard
              </NavLink>
            </>
          )}
          {user?.role === 'journalist' && (
            <>
              <NavLink to="/marketplace" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <ShoppingCart size={18} /> Marketplace
              </NavLink>
              <NavLink to="/purchases" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <LayoutDashboard size={18} /> My Purchases
              </NavLink>
            </>
          )}
        </div>

        <div className="navbar-auth">
          {user ? (
            <div className="user-menu">
              <div className="user-info">
                <User size={18} />
                <span className="user-name">{user.displayName}</span>
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="login-link">Login</Link>
              <Link to="/register" className="register-link">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
