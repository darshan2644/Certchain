import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { uploadToPinata } from '../utils/pinata';
import { getEthereumContract } from '../utils/contract';
import { FaCloudUploadAlt, FaCheckCircle, FaSpinner, FaExclamationTriangle, FaSearch, FaGlobeAmericas, FaBuilding, FaHistory } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { pushNotification } from '../utils/notifications';

const Upload = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        certId: `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        studentId: '',
        recipient: ''
    });
    const [registry, setRegistry] = useState([]);
    const [eventMode, setEventMode] = useState('online'); // 'online' or 'offline'
    const [selectedEvent, setSelectedEvent] = useState('');
    const [manualEventName, setManualEventName] = useState('');
    const [availableEvents, setAvailableEvents] = useState([]);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState(''); // 'uploading', 'hashing', 'minting', 'success', 'error'
    const [message, setMessage] = useState('');
    const [txHash, setTxHash] = useState('');
    const [issuedRecords, setIssuedRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    useEffect(() => {
        const events = JSON.parse(localStorage.getItem('certchain_events') || '[]');
        setAvailableEvents(events);
        if (events.length > 0) setSelectedEvent(events[0].title);

        const reg = JSON.parse(localStorage.getItem('pending_registrations') || '[]');
        setRegistry(reg);

        // Load ALL records for history filtering
        const records = JSON.parse(localStorage.getItem('certchain_issued_records') || '[]');
        setIssuedRecords(records);
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const eventTitle = eventMode === 'online' ? selectedEvent : manualEventName;

        if (!file || !formData.name || !formData.certId || !formData.studentId || !eventTitle) {
            alert("Please fill all required fields, including event information!");
            return;
        }

        try {
            setStatus('uploading');
            setMessage('Uploading asset to IPFS...');
            const ipfsHash = await uploadToPinata(file);

            setStatus('minting');
            setMessage('Awaiting blockchain confirmation...');
            const contract = await getEthereumContract();

            const recipientAddr = formData.recipient || "0x0000000000000000000000000000000000000000";

            const tx = await contract.issueCertificate(
                formData.certId,
                ipfsHash,
                formData.name,
                formData.studentId,
                recipientAddr
            );

            setMessage('Blockchain confirming issuance...');
            await tx.wait();

            setStatus('success');
            setTxHash(tx.hash);
            setMessage(`Credential Issued for ${eventTitle}`);
            pushNotification(`Certificate issued for ${eventTitle}: ${formData.certId}`, 'success');

            const records = JSON.parse(localStorage.getItem('certchain_issued_records') || '[]');
            localStorage.setItem('certchain_issued_records', JSON.stringify([newRecord, ...records]));
            setIssuedRecords([newRecord, ...records]);

            // HALL OF FAME SYNC
            const registry = JSON.parse(localStorage.getItem('pending_registrations') || '[]');
            const normalizedId = formData.studentId.trim().toUpperCase();
            if (!registry.find(r => r.studentId.trim().toUpperCase() === normalizedId)) {
                registry.push({
                    name: formData.name,
                    studentId: formData.studentId,
                    address: recipientAddr,
                    timestamp: new Date().toLocaleString()
                });
                localStorage.setItem('pending_registrations', JSON.stringify(registry));
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(error.reason || error.message || "An error occurred");
        }
    };

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ padding: '40px', width: '100%', maxWidth: '600px' }}
            >
                <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '10px' }}>Issue Document</h2>
                <p style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.85rem', marginBottom: '30px' }}>Select an event context for this issuance.</p>

                {/* Event Selection UI */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                    <div
                        onClick={() => setEventMode('online')}
                        style={{ flex: 1, padding: '15px', borderRadius: '12px', background: eventMode === 'online' ? 'rgba(0, 243, 255, 0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${eventMode === 'online' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', transition: '0.3s', textAlign: 'center' }}
                    >
                        <FaGlobeAmericas color={eventMode === 'online' ? 'var(--primary-color)' : 'white'} style={{ marginBottom: '5px' }} />
                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Online Event</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>From CertChain Hub</div>
                    </div>
                    <div
                        onClick={() => setEventMode('offline')}
                        style={{ flex: 1, padding: '15px', borderRadius: '12px', background: eventMode === 'offline' ? 'rgba(0, 243, 255, 0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${eventMode === 'offline' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', transition: '0.3s', textAlign: 'center' }}
                    >
                        <FaBuilding color={eventMode === 'offline' ? 'var(--primary-color)' : 'white'} style={{ marginBottom: '5px' }} />
                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Offline / Manual</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>Custom Workshop</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {eventMode === 'online' ? (
                        <div className="input-group">
                            <label className="input-label">Select Active Event</label>
                            <select
                                className="input-field"
                                value={selectedEvent}
                                onChange={(e) => setSelectedEvent(e.target.value)}
                                style={{ background: 'rgba(0,0,0,0.2)', color: 'white' }}
                            >
                                {availableEvents.length > 0 ? availableEvents.map((ev, i) => (
                                    <option key={i} value={ev.title} style={{ background: '#111' }}>{ev.title}</option>
                                )) : <option disabled>No Online Events Found</option>}
                            </select>
                        </div>
                    ) : (
                        <div className="input-group">
                            <label className="input-label">Custom Event Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Hackathon 2026 Admin Panel"
                                value={manualEventName}
                                onChange={(e) => setManualEventName(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label">Quick Select Student (From Registry)</label>
                        <select
                            className="input-field"
                            onChange={(e) => {
                                const student = registry.find(r => r.studentId === e.target.value);
                                if (student) {
                                    setFormData({
                                        ...formData,
                                        name: student.name,
                                        studentId: student.studentId,
                                        recipient: student.address || '',
                                        certId: `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                                    });
                                }
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>-- Select a registered student --</option>
                            {registry.map((s, i) => (
                                <option key={i} value={s.studentId}>{s.name} ({s.studentId})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="input-group">
                            <label className="input-label">Student Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Student ID</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="ID No."
                                value={formData.studentId}
                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Certificate Serial ID</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="CERT-XXXX"
                            value={formData.certId}
                            onChange={(e) => setFormData({ ...formData, certId: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Document Asset (PDF/JPG)</label>
                        <div style={{ position: 'relative' }}>
                            <input type="file" id="file-up" onChange={handleFileChange} style={{ display: 'none' }} />
                            <label htmlFor="file-up" className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <FaCloudUploadAlt color="var(--primary-color)" />
                                {file ? file.name : "Select Document File..."}
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '20px' }}
                        disabled={status === 'uploading' || status === 'minting'}
                    >
                        {status === 'uploading' || status === 'minting' ? <FaSpinner className="spin" /> : 'Confirm Blockchain Issue'}
                    </button>
                </form>

                {status && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: '20px', padding: '15px', borderRadius: '10px', background: 'rgba(0,243,255,0.05)', border: `1px solid ${status === 'error' ? 'var(--error)' : 'var(--primary-color)'}` }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: status === 'error' ? 'var(--error)' : 'var(--primary-color)' }}>
                            {status === 'success' ? <FaCheckCircle /> : status === 'error' ? <FaExclamationTriangle /> : <FaSpinner className="spin" />}
                            <strong>{status.toUpperCase()}</strong>
                        </div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem' }}>{message}</p>
                    </motion.div>
                )}
            </motion.div>

            {/* Enhanced History Section with Filtering */}
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: '900px', padding: '30px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FaHistory color="var(--primary-color)" />
                        <h3 style={{ margin: 0 }}>Global Issuance History</h3>
                    </div>

                    <div style={{ position: 'relative', width: '300px' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                        <input
                            type="text"
                            placeholder="Search Student ID, Name, or Event..."
                            className="input-field"
                            style={{ paddingLeft: '40px', fontSize: '0.8rem', marginBottom: 0 }}
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                {(() => {
                    const filtered = issuedRecords.filter(r =>
                        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.event.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    const indexOfLastRecord = currentPage * recordsPerPage;
                    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
                    const currentRecords = filtered.slice(indexOfFirstRecord, indexOfLastRecord);
                    const totalPages = Math.ceil(filtered.length / recordsPerPage);

                    return (
                        <>
                            {currentRecords.length > 0 ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr style={{ opacity: 0.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <th style={{ padding: '12px' }}>Cert ID</th>
                                                <th style={{ padding: '12px' }}>Student</th>
                                                <th style={{ padding: '12px' }}>Event</th>
                                                <th style={{ padding: '12px' }}>Date</th>
                                                <th style={{ padding: '12px' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentRecords.map((rec, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '12px', color: 'var(--primary-color)' }}>{rec.id}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ fontWeight: 'bold' }}>{rec.student}</div>
                                                        <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>ID: {rec.studentId}</div>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: rec.mode === 'online' ? 'rgba(0,255,136,0.1)' : 'rgba(255,159,67,0.1)', color: rec.mode === 'online' ? 'var(--success)' : '#ff9f43' }}>
                                                            {rec.event}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px', opacity: 0.6 }}>{rec.date}</td>
                                                    <td style={{ padding: '12px' }}><FaCheckCircle color="var(--success)" /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                                            <button
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(prev => prev - 1)}
                                                className="btn-secondary"
                                                style={{ padding: '5px 15px', fontSize: '0.8rem' }}
                                            >Prev</button>
                                            <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', opacity: 0.6 }}>
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(prev => prev + 1)}
                                                className="btn-secondary"
                                                style={{ padding: '5px 15px', fontSize: '0.8rem' }}
                                            >Next</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.4 }}>No matching records found.</div>
                            )}
                        </>
                    );
                })()}
            </motion.div>

            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Upload;
