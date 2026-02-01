import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserShield, FaUserGraduate, FaLock, FaUser, FaIdCard, FaArrowRight } from 'react-icons/fa';

const Login = () => {
    const [isAdminMode, setIsAdminMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [studentId, setStudentId] = useState('');
    const [error, setError] = useState('');
    const { loginAdmin, loginStudentById } = useAuth();
    const navigate = useNavigate();

    const handleAdminLogin = (e) => {
        e.preventDefault();
        const success = loginAdmin(username, password);
        if (success) {
            navigate('/');
        } else {
            setError('Invalid Admin Credentials');
        }
    };

    const handleStudentLogin = (e) => {
        e.preventDefault();
        if (!studentId) {
            setError('Please enter your Student ID');
            return;
        }
        loginStudentById(studentId);
        navigate('/dashboard');
    };

    return (
        <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: '450px', padding: '40px', textAlign: 'center' }}
            >
                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '12px' }}>
                    <button
                        onClick={() => setIsAdminMode(true)}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                            background: isAdminMode ? 'var(--primary-color)' : 'transparent',
                            color: isAdminMode ? 'white' : 'rgba(255,255,255,0.6)',
                            cursor: 'pointer', transition: '0.3s', fontWeight: 'bold'
                        }}
                    >
                        <FaUserShield /> Admin
                    </button>
                    <button
                        onClick={() => setIsAdminMode(false)}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                            background: !isAdminMode ? 'var(--secondary-color)' : 'transparent',
                            color: !isAdminMode ? 'white' : 'rgba(255,255,255,0.6)',
                            cursor: 'pointer', transition: '0.3s', fontWeight: 'bold'
                        }}
                    >
                        <FaUserGraduate /> Student
                    </button>
                </div>

                <h2 className="text-gradient" style={{ marginBottom: '10px' }}>
                    {isAdminMode ? 'Institutional Login' : 'Student Portfolio Access'}
                </h2>
                <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '30px' }}>
                    {isAdminMode ? 'Secure access for Darshan Vasoya (DAV)' : 'Enter your University ID to view your achievements'}
                </p>

                {isAdminMode ? (
                    <form onSubmit={handleAdminLogin} style={{ textAlign: 'left' }}>
                        <div className="input-group">
                            <label className="input-label">Username</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    style={{ paddingLeft: '45px' }}
                                />
                                <FaUser style={{ position: 'absolute', left: '15px', top: '15px', opacity: 0.5 }} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingLeft: '45px' }}
                                />
                                <FaLock style={{ position: 'absolute', left: '15px', top: '15px', opacity: 0.5 }} />
                            </div>
                        </div>
                        {error && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '-10px', marginBottom: '15px' }}>{error}</p>}
                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                            Login as Admin <FaArrowRight style={{ marginLeft: '10px' }} />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleStudentLogin} style={{ textAlign: 'left' }}>
                        <div className="input-group">
                            <label className="input-label">University / Student ID</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. DAV-2024-101"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    style={{ paddingLeft: '45px' }}
                                    required
                                />
                                <FaIdCard style={{ position: 'absolute', left: '15px', top: '15px', opacity: 0.5 }} />
                            </div>
                        </div>
                        {error && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '-10px', marginBottom: '15px' }}>{error}</p>}
                        <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', textAlign: 'center' }}>
                            Your achievements are fetched directly from the blockchain using your unique ID. No wallet required.
                        </p>
                        <button type="submit" className="btn-secondary" style={{ width: '100%' }}>
                            View My Gallery <FaArrowRight style={{ marginLeft: '10px' }} />
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
