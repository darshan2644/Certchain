import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-logo">
                <FaShieldAlt /> CertChain
            </Link>
            <div className="nav-links">
                <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
                <Link to="/verify" className={`nav-link ${isActive('/verify')}`}>Verify</Link>

                {/* GUEST ONLY LINKS */}
                {!user && (
                    <>
                        <Link to="/register" className={`nav-link ${isActive('/register')}`}>Register</Link>
                        <Link to="/guide" className={`nav-link ${isActive('/guide')}`}>Guide</Link>
                    </>
                )}

                {/* ADMIN ONLY LINKS */}
                {user?.role === 'admin' && (
                    <>
                        <Link to="/upload" className={`nav-link ${isActive('/upload')}`}>Issue</Link>
                        <Link to="/bulk" className={`nav-link ${isActive('/bulk')}`}>Bulk</Link>
                        <Link to="/analytics" className={`nav-link ${isActive('/analytics')}`}>Analytics</Link>
                        <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>Registry</Link>
                        <Link to="/dev" className={`nav-link ${isActive('/dev')}`}>Tools</Link>
                    </>
                )}

                {/* STUDENT ONLY LINKS */}
                {user?.role === 'student' && (
                    <>
                        <Link to="/register" className={`nav-link ${isActive('/register')}`}>Register ID</Link>
                        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>My Gallery</Link>
                    </>
                )}

                {/* Auth Button */}
                {!user ? (
                    <Link to="/login" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Login</Link>
                ) : (
                    <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaSignOutAlt /> Sign Out
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
