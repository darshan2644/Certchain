import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEthereumContract } from '../utils/contract';
import { FaUserShield, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaBan, FaFileCsv, FaChartLine, FaCalendarCheck, FaUserGraduate, FaFire, FaChartBar, FaDownload, FaSync, FaUserPlus } from 'react-icons/fa';
import Papa from 'papaparse';

const AdminPanel = () => {
    const [searchId, setSearchId] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    const [status, setStatus] = useState(''); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [regMode, setRegMode] = useState('manual'); // 'manual' or 'bulk'
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalEvents: 0,
        totalRegs: 0,
        hotEvent: 'None'
    });

    useEffect(() => {
        // Load Students
        const requests = JSON.parse(localStorage.getItem('pending_registrations') || '[]');
        setPendingRequests(requests);

        // Extract Departments
        const depts = ['All', ...new Set(requests.map(r => r.department).filter(d => d))];
        setDepartments(depts);

        // Load Events
        const events = JSON.parse(localStorage.getItem('certchain_events') || '[]');

        // Load Registrations
        const registrations = JSON.parse(localStorage.getItem('event_registrations') || '[]');

        // Calculate Hot Event (one with most registrations)
        let hotEventName = 'None';
        if (registrations.length > 0) {
            const counts = {};
            registrations.forEach(r => {
                counts[r.eventTitle] = (counts[r.eventTitle] || 0) + 1;
            });
            hotEventName = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        }

        setStats({
            totalStudents: requests.length,
            totalEvents: events.length,
            totalRegs: registrations.length,
            hotEvent: hotEventName
        });
    }, []);

    const clearRequests = () => {
        if (window.confirm("Clear all registration requests? This will remove the student registry but NOT the blockchain certificates.")) {
            localStorage.setItem('pending_registrations', '[]');
            setPendingRequests([]);
            setStats(prev => ({ ...prev, totalStudents: 0 }));
        }
    };

    const handleFactoryReset = () => {
        const confirmStr = "DANGER: This will PERMANENTLY WIPE all local names, events, and registration history. Blockchain certificates will remain on-chain but their local display names will be lost. Type 'RESET' to confirm:";
        const input = window.prompt(confirmStr);

        if (input === 'RESET') {
            localStorage.removeItem('pending_registrations');
            localStorage.removeItem('certchain_events');
            localStorage.removeItem('event_registrations');
            localStorage.removeItem('certchain_issued_records');
            localStorage.removeItem('certchain_notifications');
            localStorage.removeItem('certchain_user');

            alert("System has been factory reset. Page will reload.");
            window.location.href = '/login';
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Wallet Address Copied!");
    };

    const downloadCSV = () => {
        if (pendingRequests.length === 0) return;

        const headers = ["id", "name", "studentId", "recipient"];
        const rows = pendingRequests.map(req => [
            `CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
            req.name,
            req.studentId || "N/A",
            req.address
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(","))
            .join("\n");
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

    const handleBulkImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const registry = JSON.parse(localStorage.getItem('pending_registrations') || '[]');
                const newEntries = results.data.map(row => ({
                    name: row.name || row.Name || row.StudentName || 'Unknown Student',
                    studentId: (row.studentId || row.StudentID || row.id || row.ID || '').toString().trim(),
                    department: row.department || row.Department || 'General',
                    address: row.recipient || row.address || row.wallet || '0x0000000000000000000000000000000000000000',
                    timestamp: new Date().toLocaleString()
                })).filter(entry => entry.studentId && entry.studentId !== '');

                const merged = [...registry];
                let count = 0;
                newEntries.forEach(entry => {
                    const normalizedNewId = entry.studentId.toUpperCase();
                    if (!merged.find(r => r.studentId.trim().toUpperCase() === normalizedNewId)) {
                        merged.push(entry);
                        count++;
                    }
                });

                localStorage.setItem('pending_registrations', JSON.stringify(merged));
                setPendingRequests(merged);
                alert(`Successfully registered ${count} students in bulk!`);
                window.location.reload();
            }
        });
    };

    const downloadTemplate = () => {
        const headers = ["name", "studentId", "department", "recipient"];
        const rows = [
            ["Darshan Vasoya", "DAV-888", "Information Technology", "0x0000000000000000000000000000000000000000"],
            ["Om Italiya", "OM-123", "Computer Science", "0x0000000000000000000000000000000000000000"]
        ];
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "student_registry_template.csv");
        link.click();
    };

    const handleManualRegister = (e) => {
        e.preventDefault();
        const name = e.target.name.value;
        const studentId = e.target.studentId.value;
        const address = e.target.address.value || "0x0000000000000000000000000000000000000000";

        if (!name || !studentId) return;

        const registry = JSON.parse(localStorage.getItem('pending_registrations') || '[]');
        const normalizedId = studentId.trim().toUpperCase();
        if (registry.find(r => r.studentId.trim().toUpperCase() === normalizedId)) {
            alert("Student ID already exists!");
            return;
        }

        const newEntry = {
            name,
            studentId,
            department: e.target.department.value || 'General',
            address,
            timestamp: new Date().toLocaleString()
        };

        const updated = [newEntry, ...registry];
        localStorage.setItem('pending_registrations', JSON.stringify(updated));
        setPendingRequests(updated);
        setStats(prev => ({ ...prev, totalStudents: updated.length }));
        e.target.reset();
        alert("Student registered with 0 certificates!");
        window.location.reload();
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
        <div className="page-container" style={{ paddingTop: '40px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                {/* Analytics Dashboard section */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ background: 'var(--primary-color)', padding: '10px', borderRadius: '12px', color: 'black' }}>
                                <FaChartBar size={24} />
                            </div>
                            <h2 style={{ fontSize: '2rem', margin: 0 }} className="text-gradient">Platform Insights</h2>
                        </div>
                        <button
                            onClick={handleFactoryReset}
                            className="btn-secondary"
                            style={{ padding: '8px 20px', border: '1px solid rgba(255,0,85,0.4)', color: 'var(--error)', fontSize: '0.8rem', fontWeight: 'bold' }}
                        >
                            Industrial Wipe (Factory Reset)
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="glass-panel"
                            style={{ padding: '25px', borderLeft: '4px solid var(--primary-color)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '5px' }}>Registered Students</p>
                                    <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.totalStudents}</h3>
                                </div>
                                <FaUserGraduate size={30} style={{ opacity: 0.2, color: 'var(--primary-color)' }} />
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="glass-panel"
                            style={{ padding: '25px', borderLeft: '4px solid #A855F7' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '5px' }}>Total Events</p>
                                    <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.totalEvents}</h3>
                                </div>
                                <FaCalendarCheck size={30} style={{ opacity: 0.2, color: '#A855F7' }} />
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="glass-panel"
                            style={{ padding: '25px', borderLeft: '4px solid var(--success)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '5px' }}>Event Turnout</p>
                                    <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.totalRegs}</h3>
                                </div>
                                <FaChartLine size={30} style={{ opacity: 0.2, color: 'var(--success)' }} />
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="glass-panel"
                            style={{ padding: '25px', borderLeft: '4px solid #F59E0B' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ maxWidth: '180px' }}>
                                    <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '5px' }}>Top Performing Event</p>
                                    <h3 style={{ fontSize: '1.2rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stats.hotEvent}</h3>
                                </div>
                                <FaFire size={30} style={{ opacity: 0.2, color: '#F59E0B' }} />
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'stretch', marginBottom: '100px' }}>
                    {/* Revocation Controls */}
                    <motion.div
                        className="glass-panel"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ padding: '40px', textAlign: 'center', border: '1px solid rgba(255, 0, 85, 0.2)', height: '100%' }}
                    >
                        <div style={{ padding: '20px', background: 'rgba(255, 0, 85, 0.1)', borderRadius: '50%', width: 'fit-content', margin: '0 auto 20px', color: 'var(--error)' }}>
                            <FaUserShield size={40} />
                        </div>
                        <h2 className="text-gradient" style={{ marginBottom: '10px' }}>Security Controls</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px', fontSize: '0.9rem' }}>
                            Permanently invalidate issued certificates on the blockchain.
                        </p>

                        <form onSubmit={handleRevoke}>
                            <div className="input-group">
                                <label className="input-label">Certificate ID</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="CERT-2026-..."
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
                                style={{ width: '100%', background: 'var(--error)', border: 'none', boxShadow: '0 0 20px rgba(255,0,85,0.3)', height: '50px' }}
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? <FaSpinner className="spin" /> : 'Confirm Revocation'}
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
                                        <strong style={{ fontSize: '0.9rem' }}>{status.toUpperCase()}</strong>
                                    </div>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem' }}>{message}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Manual Registration Form - Moved inside top grid */}
                    <motion.div
                        className="glass-panel"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ padding: '40px', textAlign: 'center', height: '100%', border: '1px solid rgba(0, 243, 255, 0.2)' }}
                    >
                        <div style={{ padding: '20px', background: 'rgba(0, 243, 255, 0.1)', borderRadius: '50%', width: 'fit-content', margin: '0 auto 20px', color: 'var(--primary-color)' }}>
                            <FaUserPlus size={40} />
                        </div>
                        <h2 className="text-gradient" style={{ marginBottom: '10px' }}>Student Onboarding</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px', fontSize: '0.9rem' }}>
                            Add students to the system via individual entry or bulk upload.
                        </p>

                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '5px', marginBottom: '25px', border: '1px solid var(--glass-border)' }}>
                            <button
                                onClick={() => setRegMode('manual')}
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: regMode === 'manual' ? 'var(--primary-color)' : 'transparent', color: regMode === 'manual' ? 'black' : 'white', cursor: 'pointer', transition: 'all 0.3s ease', fontWeight: 'bold' }}
                            >
                                Single Entry
                            </button>
                            <button
                                onClick={() => setRegMode('bulk')}
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: regMode === 'bulk' ? 'var(--primary-color)' : 'transparent', color: regMode === 'bulk' ? 'black' : 'white', cursor: 'pointer', transition: 'all 0.3s ease', fontWeight: 'bold' }}
                            >
                                Bulk Upload
                            </button>
                        </div>

                        {regMode === 'manual' ? (
                            <form onSubmit={handleManualRegister} style={{ textAlign: 'left' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="input-group">
                                        <label className="input-label">Full Name</label>
                                        <input name="name" type="text" className="input-field" placeholder="John Doe" required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Student ID</label>
                                        <input name="studentId" type="text" className="input-field" placeholder="STU-001" required />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Department</label>
                                    <select name="department" className="input-field" required>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Information Technology">Information Technology</option>
                                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                                        <option value="Civil Engineering">Civil Engineering</option>
                                        <option value="Electrical Engineering">Electrical Engineering</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Wallet Address (Optional)</label>
                                    <input name="address" type="text" className="input-field" placeholder="0x..." />
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '5px' }}>
                                    Add to Registry
                                </button>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ border: '2px dashed var(--glass-border)', padding: '20px', borderRadius: '15px', background: 'rgba(255,255,255,0.01)' }}>
                                    <FaFileCsv size={32} color="var(--primary-color)" style={{ marginBottom: '10px', opacity: 0.8 }} />
                                    <h4 style={{ margin: '0 0 5px 0' }}>CSV Registry Import</h4>
                                    <input
                                        type="file"
                                        id="bulk-register-main"
                                        accept=".csv"
                                        style={{ display: 'none' }}
                                        onChange={handleBulkImport}
                                    />
                                    <label htmlFor="bulk-register-main" className="btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.85rem' }}>
                                        <FaFileCsv /> Choose CSV
                                    </label>
                                    <button onClick={downloadTemplate} className="btn-secondary" style={{ width: '100%', marginTop: '10px', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', fontSize: '0.85rem' }}>
                                        <FaDownload style={{ marginRight: '8px' }} /> Template
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Long Form Registry Section - Full Width */}
                <motion.div
                    className="glass-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '40px', border: '1px solid rgba(0, 243, 255, 0.2)', width: '100%', boxSizing: 'border-box', marginTop: '40px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <h2 className="text-gradient" style={{ margin: 0 }}>Student Registry</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '12px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Department:</span>
                                <select
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    className="input-field"
                                    style={{ width: 'auto', padding: '5px 10px', height: '35px', margin: 0, background: 'transparent', border: 'none', color: 'var(--primary-color)', fontWeight: 'bold' }}
                                >
                                    <option value="" disabled>-- Select Dept --</option>
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={downloadCSV} className="btn-secondary" style={{ padding: '8px 15px', fontSize: '0.8rem', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>
                                <FaDownload style={{ marginRight: '5px' }} /> Export CSV
                            </button>
                            <button onClick={clearRequests} className="btn-secondary" style={{ padding: '8px 15px', fontSize: '0.8rem', border: '1px solid var(--error)', color: 'var(--error)' }}>
                                Clear
                            </button>
                        </div>
                    </div>

                    {(() => {
                        const filtered = pendingRequests.filter(r => selectedDept === 'All' || r.department === selectedDept);
                        const displayList = selectedDept === 'All' ? filtered.slice(0, 10) : filtered;

                        return (
                            <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.1)', borderRadius: '15px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--glass-border)', opacity: 0.5, fontSize: '0.8rem' }}>
                                            <th style={{ padding: '15px' }}>Identity</th>
                                            <th style={{ padding: '15px' }}>Department</th>
                                            <th style={{ padding: '15px' }}>Wallet Address</th>
                                            <th style={{ padding: '15px' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayList.map((req, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '15px' }}>
                                                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>{req.name}</strong>
                                                    <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>ID: {req.studentId}</span>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <span style={{ fontSize: '0.7rem', background: 'rgba(0,243,255,0.1)', color: 'var(--primary-color)', padding: '3px 8px', borderRadius: '4px' }}>
                                                        {req.department || 'General'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--primary-color)' }}>
                                                    {req.address.slice(0, 16)}...{req.address.slice(-4)}
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <button
                                                        onClick={() => copyToClipboard(req.address)}
                                                        className="btn-secondary"
                                                        style={{ padding: '5px 12px', fontSize: '0.7rem' }}
                                                    >
                                                        Copy
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {selectedDept === 'All' && filtered.length > 10 && (
                                    <div style={{ padding: '15px', textAlign: 'center', background: 'rgba(0,243,255,0.05)', borderTop: '1px solid var(--glass-border)', fontSize: '0.8rem', opacity: 0.7 }}>
                                        Showing first 10 students. <strong>Select a department</strong> to view the full list.
                                    </div>
                                )}

                                {displayList.length === 0 && (
                                    <div style={{ padding: '40px', textAlign: 'center', opacity: 0.4 }}>No students found.</div>
                                )}
                            </div>
                        );
                    })()}
                </motion.div>
            </div>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default AdminPanel;
