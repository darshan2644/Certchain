import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaSignOutAlt, FaBell, FaTimes, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const loadNotifications = () => {
            const saved = JSON.parse(localStorage.getItem('certchain_notifications') || '[]');
            setNotifications(saved);
        };
        loadNotifications();

        // Listen for internal events
        window.addEventListener('new_notification', loadNotifications);
        return () => window.removeEventListener('new_notification', loadNotifications);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id) => {
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        setNotifications(updated);
        localStorage.setItem('certchain_notifications', JSON.stringify(updated));
    };

    const deleteNotification = (e, id) => {
        e.stopPropagation(); // Prevent marking as read when deleting
        const updated = notifications.filter(n => n.id !== id);
        setNotifications(updated);
        localStorage.setItem('certchain_notifications', JSON.stringify(updated));
    };

    const clearAll = () => {
        setNotifications([]);
        localStorage.setItem('certchain_notifications', JSON.stringify([]));
    };

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
                <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`}>Rankings</Link>

                {/* GUEST ONLY LINKS */}
                {!user && (
                    <>
                        <Link to="/register" className={`nav-link ${isActive('/register')}`}>Register</Link>
                        <Link to="/talent" className={`nav-link ${isActive('/talent')}`}>Talent Search</Link>
                        <Link to="/guide" className={`nav-link ${isActive('/guide')}`}>Guide</Link>
                    </>
                )}

                {/* ADMIN ONLY LINKS */}
                {user?.role === 'admin' && (
                    <>
                        <Link to="/upload" className={`nav-link ${isActive('/upload')}`}>Issue</Link>
                        <Link to="/bulk" className={`nav-link ${isActive('/bulk')}`}>Bulk</Link>
                        <Link to="/analytics" className={`nav-link ${isActive('/analytics')}`}>Analytics</Link>
                        <Link to="/manage-events" className={`nav-link ${isActive('/manage-events')}`}>Events</Link>
                        <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>Registry</Link>
                    </>
                )}

                {/* STUDENT ONLY LINKS */}
                {user?.role === 'student' && (
                    <>
                        <Link to="/events" className={`nav-link ${isActive('/events')}`}>Events</Link>
                        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>My Gallery</Link>
                    </>
                )}

                {/* Notification Bell */}
                {user && (
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{ background: 'none', border: 'none', color: unreadCount > 0 ? 'var(--primary-color)' : 'white', cursor: 'pointer', padding: '10px', fontSize: '1.2rem', position: 'relative' }}
                        >
                            <FaBell />
                            {unreadCount > 0 && (
                                <span style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--error)', color: 'white', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '50%', fontWeight: 'bold' }}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    style={{ position: 'absolute', top: '50px', right: 0, width: '320px', background: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '15px', zIndex: 1000, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', overflow: 'hidden' }}
                                >
                                    <div style={{ padding: '15px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <h4 style={{ margin: 0 }}>Notifications</h4>
                                            {notifications.length > 0 && (
                                                <button
                                                    onClick={clearAll}
                                                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.65rem', padding: '4px 8px', borderRadius: '4px', transition: '0.3s' }}
                                                    onMouseOver={(e) => e.target.style.color = 'var(--error)'}
                                                    onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}
                                                >
                                                    Clear All
                                                </button>
                                            )}
                                        </div>
                                        <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.6 }}><FaTimes /></button>
                                    </div>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '30px', textAlign: 'center', opacity: 0.5 }}>No new activities</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => markAsRead(n.id)}
                                                    style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: n.read ? 'transparent' : 'rgba(0, 243, 255, 0.05)', cursor: 'pointer', display: 'flex', gap: '12px', position: 'relative', transition: '0.2s' }}
                                                    className="noti-item"
                                                >
                                                    <div style={{ color: n.type === 'event' ? 'var(--primary-color)' : 'var(--success)', marginTop: '3px' }}>
                                                        {n.type === 'event' ? <FaCalendarAlt /> : <FaCheckCircle />}
                                                    </div>
                                                    <div style={{ flex: 1, paddingRight: '20px' }}>
                                                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: n.read ? 'normal' : 'bold', lineHeight: '1.4' }}>{n.message}</p>
                                                        <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>{new Date(n.time).toLocaleTimeString()}</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => deleteNotification(e, n.id)}
                                                        style={{ position: 'absolute', top: '15px', right: '10px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '5px' }}
                                                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--error)'}
                                                        onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                                                    >
                                                        <FaTimes size={10} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
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
