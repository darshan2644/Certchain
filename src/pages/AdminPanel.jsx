import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEthereumContract } from '../utils/contract';
import { FaUserShield, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaSearch, FaBan, FaFileCsv } from 'react-icons/fa';

const AdminPanel = () => {
    const [searchId, setSearchId] = useState('');
    const [status, setStatus] = useState(''); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('');
    const [pendingRequests, setPendingRequests] = useState([]);

    useEffect(() => {
        const requests = JSON.parse(localStorage.getItem('pending_registrations') || '[]');
        setPendingRequests(requests);
    }, []);

    const clearRequests = () => {
        if (window.confirm("Clear all registration requests?")) {
            localStorage.setItem('pending_registrations', '[]');
            setPendingRequests([]);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Wallet Address Copied!");
    };

    const downloadCSV = () => {
        if (pendingRequests.length === 0) return;

        // Prepare CSV content with headers required by Bulk Upload
        const headers = ["id", "name", "recipient"];
        const rows = pendingRequests.map(req => [
            req.studentId || `STU-${Math.floor(Math.random() * 1000)}`,
            req.name,
            req.address
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `student_registrations_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRevoke = async (e) => {
        e.preventDefault();
        if (!searchId) return;

        const confirmRevoke = window.confirm(`Are you sure you want to permanently REVOKE certificate ID: ${searchId}? This action cannot be undone on the blockchain.`);
        if (!confirmRevoke) return;

        try {
            setStatus('loading');
            setMessage('Initiating revocation on Ethereum...');

            const contract = await getEthereumContract();
            const tx = await contract.revokeCertificate(searchId);

            setMessage('Waiting for blockchain confirmation...');
            await tx.wait();

            setStatus('success');
            setMessage(`Certificate ${searchId} has been successfully revoked and invalidated.`);
            setSearchId('');
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(error.reason || error.message || "An error occurred during revocation");
        }
    };

    return (
        <div className="page-container">
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center', border: '1px solid rgba(255, 0, 85, 0.2)' }}
            >
                <div style={{ padding: '20px', background: 'rgba(255, 0, 85, 0.1)', borderRadius: '50%', width: 'fit-content', margin: '0 auto 20px', color: 'var(--error)' }}>
                    <FaUserShield size={40} />
                </div>
                <h1 className="text-gradient" style={{ marginBottom: '10px' }}>Security Control Center</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>
                    Revoke issued certificates if they were issued in error or contain fraudulent data.
                    <br /><strong style={{ color: 'var(--error)' }}>WARNING: This action is permanent.</strong>
                </p>

                <form onSubmit={handleRevoke}>
                    <div className="input-group">
                        <label className="input-label">Enter Certificate ID to Revoke</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. CERT-2026-001"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                style={{ paddingLeft: '45px', border: '1px solid rgba(255, 0, 85, 0.3)' }}
                            />
                            <FaBan style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--error)' }} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', background: 'var(--error)', border: 'none', boxShadow: '0 0 20px rgba(255,0,85,0.3)' }}
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? <FaSpinner className="spin" /> : 'Revoke Certificate Now'}
                    </button>
                </form>

                <AnimatePresence>
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                marginTop: '25px',
                                padding: '15px',
                                borderRadius: '10px',
                                background: status === 'error' ? 'rgba(255,0,85,0.1)' : 'rgba(0,255,136,0.1)',
                                border: `1px solid ${status === 'error' ? 'var(--error)' : 'var(--success)'}`
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: status === 'error' ? 'var(--error)' : 'var(--success)' }}>
                                {status === 'success' ? <FaCheckCircle /> : status === 'error' ? <FaExclamationTriangle /> : <FaSpinner className="spin" />}
                                <strong>{status.toUpperCase()}</strong>
                            </div>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>{message}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* NEW: Pending Registrations Section */}
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '40px', maxWidth: '800px', margin: '40px auto 0', border: '1px solid rgba(0, 243, 255, 0.2)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 className="text-gradient" style={{ margin: 0 }}>Student Registrations</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {pendingRequests.length > 0 && (
                            <>
                                <button onClick={downloadCSV} className="btn-secondary" style={{ padding: '8px 15px', fontSize: '0.8rem', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>
                                    <FaFileCsv style={{ marginRight: '5px' }} /> Export to CSV
                                </button>
                                <button onClick={clearRequests} className="btn-secondary" style={{ padding: '8px 15px', fontSize: '0.8rem', border: '1px solid var(--error)', color: 'var(--error)' }}>
                                    Clear All
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <p style={{ opacity: 0.6, marginBottom: '20px' }}>
                    List of students who have registered their wallets. Use these addresses for the Bulk Upload CSV.
                </p>

                {pendingRequests.length > 0 ? (
                    <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.1)', borderRadius: '15px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '15px' }}>Name</th>
                                    <th style={{ padding: '15px' }}>Wallet Address</th>
                                    <th style={{ padding: '15px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRequests.map((req, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}>{req.name} <br /> <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>ID: {req.studentId}</span></td>
                                        <td style={{ padding: '15px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--primary-color)' }}>
                                            {req.address.slice(0, 8)}...{req.address.slice(-4)}
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <button
                                                onClick={() => copyToClipboard(req.address)}
                                                className="btn-secondary"
                                                style={{ padding: '5px 10px', fontSize: '0.7rem' }}
                                            >
                                                Copy Wallet
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                        <p style={{ opacity: 0.4 }}>No new registrations yet. Share the 'Register' link with students!</p>
                    </div>
                )}
            </motion.div>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default AdminPanel;
