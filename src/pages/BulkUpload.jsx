import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { uploadToPinata } from '../utils/pinata';
import { getEthereumContract } from '../utils/contract';
import { FaFileCsv, FaSpinner, FaCheckCircle, FaImage, FaFileExport, FaGlobeAmericas, FaBuilding, FaHistory, FaSearch } from 'react-icons/fa';
import { pushNotification } from '../utils/notifications';

const BulkUpload = () => {
    const [usePending, setUsePending] = useState(false);
    const [csvData, setCsvData] = useState([]);
    const [templateFile, setTemplateFile] = useState(null);
    const [status, setStatus] = useState('');
    const [message, setMessage] = useState('');
    const [txHash, setTxHash] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    // Event Context States
    const [eventMode, setEventMode] = useState('online');
    const [selectedEvent, setSelectedEvent] = useState('');
    const [manualEventName, setManualEventName] = useState('');
    const [availableEvents, setAvailableEvents] = useState([]);
    const [issuedRecords, setIssuedRecords] = useState([]);

    useEffect(() => {
        const events = JSON.parse(localStorage.getItem('certchain_events') || '[]');
        setAvailableEvents(events);
        if (events.length > 0) setSelectedEvent(events[0].title);

        const records = JSON.parse(localStorage.getItem('certchain_issued_records') || '[]');
        setIssuedRecords(records);
    }, []);

    const loadPendingData = () => {
        const requests = JSON.parse(localStorage.getItem('pending_registrations') || '[]');
        if (requests.length === 0) {
            alert("No pending registrations found!");
            setUsePending(false);
            return;
        }
        setCsvData(requests);
    };

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUsePending(false);
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setCsvData(results.data);
                }
            });
        }
    };

    const handleTemplateUpload = (e) => {
        if (e.target.files[0]) setTemplateFile(e.target.files[0]);
    };

    const handleBulkIssue = async () => {
        const eventTitle = eventMode === 'online' ? selectedEvent : manualEventName;

        if (csvData.length === 0 || !templateFile || !eventTitle) {
            alert("Please fill all fields: Event, CSV Data, and Master Template!");
            return;
        }

        try {
            setStatus('uploading');
            setMessage('Uploading Master Template to IPFS...');
            const masterHash = await uploadToPinata(templateFile);

            setStatus('minting');
            setMessage(`Preparing to issue ${csvData.length} certificates for ${eventTitle}...`);

            const ids = csvData.map((row, i) => {
                const baseId = row.id || row.ID || row.CertificateID || `CERT-${Date.now()}`;
                // Append a unique suffix to prevent collisions if multiple certs are issued at once
                return `${baseId}-${i + 1}-${Math.floor(Math.random() * 1000)}`;
            });
            const names = csvData.map(row => row.name || row.Name || row.StudentName);
            const studentIds = csvData.map(row => row.studentId || row.StudentID || row.student_id || row.id || row.ID);
            const recipients = csvData.map(row => {
                const r = row.recipient || row.Recipient || row.wallet || row.address;
                return r && r.startsWith('0x') ? r : "0x0000000000000000000000000000000000000000";
            });

            const hashes = new Array(csvData.length).fill(masterHash);

            if (ids.some(id => !id) || names.some(name => !name) || studentIds.some(sid => !sid)) {
                throw new Error("Invalid CSV. Ensure 'id', 'name', and 'studentId' columns exist.");
            }

            const contract = await getEthereumContract();
            setMessage(`Signing bulk transaction for ${csvData.length} students...`);
            const tx = await contract.issueBatch(ids, hashes, names, studentIds, recipients);

            setMessage('Waiting for blockchain confirmation...');
            await tx.wait();

            setStatus('success');
            setTxHash(tx.hash);
            setMessage(`Successfully issued ${csvData.length} certificates!`);
            pushNotification(`Bulk complete for ${eventTitle}: ${csvData.length} certs`, 'success');

            // Save Records
            const newRecords = csvData.map((row, i) => ({
                id: ids[i],
                student: names[i],
                studentId: studentIds[i],
                event: eventTitle,
                mode: eventMode,
                date: new Date().toLocaleString(),
                txHash: tx.hash
            }));
            const existingRecords = JSON.parse(localStorage.getItem('certchain_issued_records') || '[]');
            const updatedRecords = [...newRecords, ...existingRecords];
            localStorage.setItem('certchain_issued_records', JSON.stringify(updatedRecords));
            setIssuedRecords(updatedRecords);

            // Auto-Register New Students in Registry
            const registry = JSON.parse(localStorage.getItem('pending_registrations') || '[]');
            let newRegistrationsCount = 0;

            newRecords.forEach((entry, i) => {
                const normalizedId = entry.studentId.trim().toUpperCase();
                // Find matching row in original CSV data to get department and other info
                const originalRow = csvData[i];

                if (!registry.find(r => r.studentId.trim().toUpperCase() === normalizedId)) {
                    registry.push({
                        name: entry.student,
                        studentId: entry.studentId,
                        department: originalRow?.department || originalRow?.Department || 'General',
                        address: recipients[i],
                        timestamp: new Date().toLocaleString()
                    });
                    newRegistrationsCount++;
                }
            });

            localStorage.setItem('pending_registrations', JSON.stringify(registry));
            if (newRegistrationsCount > 0) {
                pushNotification(`Successfully registered ${newRegistrationsCount} new students during issuance`, 'info');
            }

            setCsvData([]);
            setTemplateFile(null);
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '40px', maxWidth: '850px', width: '100%' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 className="text-gradient" style={{ marginBottom: '10px' }}>Enterprise Bulk Issuance</h2>
                    <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Fast, on-chain credentialing for high-volume events.</p>
                </div>

                {/* Event Context Selector */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '35px' }}>
                    <div
                        onClick={() => setEventMode('online')}
                        className="glass-panel"
                        style={{ padding: '20px', cursor: 'pointer', border: eventMode === 'online' ? '1px solid var(--primary-color)' : '1px solid var(--glass-border)', background: eventMode === 'online' ? 'rgba(0, 243, 255, 0.05)' : 'transparent', textAlign: 'center' }}
                    >
                        <FaGlobeAmericas color={eventMode === 'online' ? 'var(--primary-color)' : 'white'} size={24} style={{ marginBottom: '10px' }} />
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>CertChain Online Event</div>
                        <select
                            className="input-field"
                            disabled={eventMode !== 'online'}
                            value={selectedEvent}
                            onChange={(e) => setSelectedEvent(e.target.value)}
                            style={{ marginTop: '10px', fontSize: '0.8rem', pointerEvents: eventMode === 'online' ? 'auto' : 'none' }}
                        >
                            {availableEvents.map((ev, i) => <option key={i} value={ev.title}>{ev.title}</option>)}
                        </select>
                    </div>

                    <div
                        onClick={() => setEventMode('offline')}
                        className="glass-panel"
                        style={{ padding: '20px', cursor: 'pointer', border: eventMode === 'offline' ? '1px solid var(--primary-color)' : '1px solid var(--glass-border)', background: eventMode === 'offline' ? 'rgba(0, 243, 255, 0.05)' : 'transparent', textAlign: 'center' }}
                    >
                        <FaBuilding color={eventMode === 'offline' ? 'var(--primary-color)' : 'white'} size={24} style={{ marginBottom: '10px' }} />
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Offline / External Context</div>
                        <input
                            type="text"
                            placeholder="Manual Event Name..."
                            disabled={eventMode !== 'offline'}
                            value={manualEventName}
                            onChange={(e) => setManualEventName(e.target.value)}
                            className="input-field"
                            style={{ marginTop: '10px', fontSize: '0.8rem', pointerEvents: eventMode === 'offline' ? 'auto' : 'none' }}
                        />
                    </div>
                </div>

                {/* CSV/Pending Toggler */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', padding: '5px', marginBottom: '30px' }}>
                    <button onClick={() => setUsePending(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: !usePending ? 'var(--primary-color)' : 'transparent', color: !usePending ? 'black' : 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>Manual CSV Upload</button>
                    <button onClick={() => { setUsePending(true); loadPendingData(); }} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: usePending ? 'var(--primary-color)' : 'transparent', color: usePending ? 'black' : 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>Pull From Registry</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                    {!usePending && (
                        <div style={{ border: '2px dashed var(--glass-border)', padding: '25px', borderRadius: '20px', textAlign: 'center' }}>
                            <FaFileCsv size={32} color="var(--primary-color)" />
                            <h4 style={{ margin: '15px 0 5px 0' }}>Student Data</h4>
                            <p style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '15px' }}>Columns: name, studentId</p>
                            <input type="file" id="csv-u" style={{ display: 'none' }} onChange={handleCsvUpload} />
                            <label htmlFor="csv-u" className="btn-secondary" style={{ cursor: 'pointer' }}>{csvData.length > 0 ? `${csvData.length} Loaded` : "Upload CSV"}</label>
                        </div>
                    )}
                    <div style={{ border: '2px dashed var(--glass-border)', padding: '25px', borderRadius: '20px', textAlign: 'center' }}>
                        <FaImage size={32} color="var(--secondary-color)" />
                        <h4 style={{ margin: '15px 0 5px 0' }}>Master Design</h4>
                        <p style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '15px' }}>Cert template for all</p>
                        <input type="file" id="tpl-u" style={{ display: 'none' }} onChange={handleTemplateUpload} />
                        <label htmlFor="tpl-u" className="btn-secondary" style={{ cursor: 'pointer' }}>{templateFile ? templateFile.name : "Upload Design"}</label>
                    </div>
                </div>

                {csvData.length > 0 && templateFile && (
                    <button onClick={handleBulkIssue} className="btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1.1rem' }} disabled={status.length > 0 && status !== 'success' && status !== 'error'}>
                        {status === 'uploading' || status === 'minting' ? <FaSpinner className="spin" /> : <><FaFileExport style={{ marginRight: '10px' }} /> Confirm Batch Issuance</>}
                    </button>
                )}

                <AnimatePresence>
                    {status && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '25px', padding: '20px', border: `1px solid ${status === 'error' ? 'var(--error)' : 'var(--primary-color)'}`, borderRadius: '15px', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: status === 'error' ? 'var(--error)' : 'var(--primary-color)' }}>
                                {status === 'success' ? <FaCheckCircle /> : <FaSpinner className="spin" />}
                                <strong style={{ textTransform: 'uppercase' }}>{status}</strong>
                            </div>
                            <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem' }}>{message}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Enhanced Global Issuance History with Search & Pagination */}
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ width: '100%', maxWidth: '1000px', padding: '30px' }}
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
                            placeholder="Search Student, ID, or Event..."
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
                        (r.studentId && r.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                                        <thead>
                                            <tr style={{ opacity: 0.4, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <th style={{ padding: '12px' }}>Rec ID</th>
                                                <th style={{ padding: '12px' }}>Student</th>
                                                <th style={{ padding: '12px' }}>Event Name</th>
                                                <th style={{ padding: '12px' }}>Type</th>
                                                <th style={{ padding: '12px' }}>Timestamp</th>
                                                <th style={{ padding: '12px' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentRecords.map((r, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '12px', color: 'var(--primary-color)' }}>{r.id.slice(0, 10)}...</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ fontWeight: 'bold' }}>{r.student}</div>
                                                        <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>ID: {r.studentId}</div>
                                                    </td>
                                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{r.event}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: r.mode === 'online' ? 'var(--success)22' : 'var(--secondary-color)22', color: r.mode === 'online' ? 'var(--success)' : 'var(--secondary-color)' }}>
                                                            {r.mode.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px', opacity: 0.6 }}>{r.date}</td>
                                                    <td style={{ padding: '12px' }}><FaCheckCircle color="var(--success)" /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Pagination */}
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

export default BulkUpload;
