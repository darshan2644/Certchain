import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserPlus, FaWallet, FaCheckCircle, FaSpinner, FaIdCard } from 'react-icons/fa';

const Register = () => {
    const [name, setName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [status, setStatus] = useState(''); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!window.ethereum) {
            alert("MetaMask is required to register!");
            return;
        }

        try {
            setStatus('loading');
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const address = accounts[0];

            // Create request object
            const request = {
                name,
                studentId,
                address,
                timestamp: new Date().toLocaleString()
            };

            // Save to local storage (simulating a backend database)
            const existingRequests = JSON.parse(localStorage.getItem('pending_registrations') || '[]');

            // Check if already registered
            if (existingRequests.find(r => r.address === address)) {
                throw new Error("You have already submitted a registration request with this wallet.");
            }

            existingRequests.push(request);
            localStorage.setItem('pending_registrations', JSON.stringify(existingRequests));

            setStatus('success');
            setMessage("Application Submitted! Your wallet identity (0x...) has been safely sent to Darshan Vasoya for verification.");
        } catch (error) {
            setStatus('error');
            setMessage(error.message || "Registration failed.");
        }
    };

    return (
        <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ padding: '40px', width: '100%', maxWidth: '500px', textAlign: 'center' }}
            >
                <div style={{ width: '80px', height: '80px', background: 'rgba(0,243,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--primary-color)' }}>
                    <FaUserPlus size={40} />
                </div>
                <h2 className="text-gradient">Student Identity Registration</h2>
                <p style={{ opacity: 0.6, marginBottom: '30px' }}>Submit your details to the Admin once. Your wallet will be linked to your future certificates automatically.</p>

                <form onSubmit={handleRegister} style={{ textAlign: 'left' }}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter your full legal name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={{ paddingLeft: '45px' }}
                            />
                            <FaIdCard style={{ position: 'absolute', left: '15px', top: '15px', opacity: 0.5 }} />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Student ID (Optional)</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. DAV-2024-101"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                style={{ paddingLeft: '45px' }}
                            />
                            <FaIdCard style={{ position: 'absolute', left: '15px', top: '15px', opacity: 0.5 }} />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={status === 'loading'}>
                        {status === 'loading' ? <FaSpinner className="spin" /> : <><FaWallet /> Register My Wallet Identity</>}
                    </button>
                </form>

                <AnimatePresence>
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginTop: '25px',
                                padding: '15px',
                                borderRadius: '10px',
                                background: status === 'error' ? 'rgba(255,0,85,0.1)' : 'rgba(0,255,136,0.1)',
                                border: `1px solid ${status === 'error' ? 'var(--error)' : 'var(--success)'}`
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: status === 'error' ? 'var(--error)' : 'var(--success)' }}>
                                {status === 'success' ? <FaCheckCircle /> : <FaSpinner className="spin" />}
                                <strong>{status.toUpperCase()}</strong>
                            </div>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>{message}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Register;
