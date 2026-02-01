import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { uploadToPinata } from '../utils/pinata';
import { getEthereumContract } from '../utils/contract';
import { FaFileCsv, FaSpinner, FaCheckCircle, FaImage, FaFileExport } from 'react-icons/fa';

const BulkUpload = () => {
    const [usePending, setUsePending] = useState(false);
    const [csvData, setCsvData] = useState([]);
    const [templateFile, setTemplateFile] = useState(null);
    const [status, setStatus] = useState('');
    const [message, setMessage] = useState('');
    const [txHash, setTxHash] = useState('');

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
        if (csvData.length === 0 || !templateFile) {
            alert("Please upload both the CSV and the Master Template!");
            return;
        }

        try {
            setStatus('uploading');
            setMessage('Uploading Master Template to IPFS...');
            const masterHash = await uploadToPinata(templateFile);

            setStatus('minting');
            setMessage(`Preparing to issue ${csvData.length} certificates with ID-based linking...`);

            // V3: Support for ID-based lookups
            const ids = csvData.map(row => row.id || row.ID || row.CertificateID);
            const names = csvData.map(row => row.name || row.Name || row.StudentName);
            const studentIds = csvData.map(row => row.studentId || row.StudentID || row.student_id || row.id || row.ID);

            // Recipient is now optional (uses a zero address if not provided)
            const recipients = csvData.map(row => {
                const r = row.recipient || row.Recipient || row.wallet || row.address;
                return r && r.startsWith('0x') ? r : "0x0000000000000000000000000000000000000000";
            });

            const hashes = new Array(csvData.length).fill(masterHash);

            if (ids.some(id => !id) || names.some(name => !name) || studentIds.some(sid => !sid)) {
                throw new Error("Invalid CSV. Ensure 'id', 'name', and 'studentId' columns exist for all rows.");
            }

            const contract = await getEthereumContract();
            setMessage(`Confirming bulk transaction for ${csvData.length} students...`);

            // Calling V3 issueBatch with studentIds included
            const tx = await contract.issueBatch(ids, hashes, names, studentIds, recipients);

            setMessage('Waiting for blockchain confirmation...');
            await tx.wait();

            setStatus('success');
            setTxHash(tx.hash);
            setMessage(`Successfully issued ${csvData.length} certificates linked to Student IDs!`);

            if (usePending) {
                localStorage.removeItem('pending_registrations');
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
        <div className="page-container">
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}
            >
                <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '10px' }}>Fast Batch Issuance V3</h2>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '40px' }}>
                    Zero-Wallet Mode: Issue certificates directly to <b>Student IDs</b>.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
                    <button
                        onClick={() => { setUsePending(false); setCsvData([]); }}
                        className={`btn-secondary ${!usePending ? 'active-btn' : ''}`}
                        style={{ border: !usePending ? '1px solid var(--primary-color)' : '1px solid transparent' }}
                    >
                        Use Manual CSV
                    </button>
                    <button
                        onClick={() => { setUsePending(true); loadPendingData(); }}
                        className={`btn-secondary ${usePending ? 'active-btn' : ''}`}
                        style={{ border: usePending ? '1px solid var(--primary-color)' : '1px solid transparent' }}
                    >
                        Pull from Pending List
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                    <div style={{ padding: '25px', border: '2px dashed var(--glass-border)', borderRadius: '20px', textAlign: 'center', position: 'relative' }}>
                        <FaFileCsv size={40} color="var(--primary-color)" style={{ marginBottom: '15px' }} />
                        <h4>1. {usePending ? 'Registration Data' : 'Upload Student CSV'}</h4>
                        <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>{usePending ? 'Loaded from Admin table' : 'Requires: name, studentId (University ID)'}</p>

                        {!usePending ? (
                            <>
                                <input type="file" id="csv-upload" accept=".csv" style={{ display: 'none' }} onChange={handleCsvUpload} />
                                <label htmlFor="csv-upload" className="btn-secondary" style={{ cursor: 'pointer', marginTop: '10px' }}>
                                    {csvData.length > 0 ? `${csvData.length} Students Ready` : "Choose CSV"}
                                </label>
                            </>
                        ) : (
                            <div style={{ marginTop: '10px', color: 'var(--success)', fontWeight: 'bold' }}>
                                {csvData.length} Students Found!
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '25px', border: '2px dashed var(--glass-border)', borderRadius: '20px', textAlign: 'center' }}>
                        <FaImage size={40} color="var(--secondary-color)" style={{ marginBottom: '15px' }} />
                        <h4>2. Upload Master Template</h4>
                        <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>The design they will see</p>
                        <input type="file" id="master-upload" accept=".pdf,.png,.jpg" style={{ display: 'none' }} onChange={handleTemplateUpload} />
                        <label htmlFor="master-upload" className="btn-secondary" style={{ cursor: 'pointer', marginTop: '10px' }}>
                            {templateFile ? templateFile.name : "Choose PDF/Image"}
                        </label>
                    </div>
                </div>

                {csvData.length > 0 && templateFile && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ background: 'rgba(0,243,255,0.05)', padding: '20px', borderRadius: '15px', marginBottom: '20px', border: '1px solid var(--primary-color)' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>Batch Summary</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span>Records: <strong>{csvData.length} Students</strong></span>
                                <span>Asset: <strong>{templateFile.name}</strong></span>
                            </div>
                        </div>

                        <button
                            className="btn-primary"
                            style={{ width: '100%', fontSize: '1.1rem', padding: '15px' }}
                            onClick={handleBulkIssue}
                            disabled={status === 'uploading' || status === 'minting'}
                        >
                            {status === 'uploading' || status === 'minting' ? <FaSpinner className="spin" /> : <><FaFileExport /> Execute ID-Based Issuance</>}
                        </button>
                    </motion.div>
                )}

                <AnimatePresence>
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ marginTop: '30px', padding: '20px', borderRadius: '15px', background: status === 'error' ? 'rgba(255,0,85,0.1)' : 'rgba(0,255,136,0.05)', border: `1px solid ${status === 'error' ? 'var(--error)' : 'var(--primary-color)'}` }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: status === 'error' ? 'var(--error)' : 'var(--primary-color)' }}>
                                {status === 'success' ? <FaCheckCircle /> : <FaSpinner className="spin" />}
                                <strong style={{ letterSpacing: '1px' }}>{status.toUpperCase()}</strong>
                            </div>
                            <p style={{ margin: '10px 0 0 0' }}>{message}</p>
                            {txHash && (
                                <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ display: 'inline-block', marginTop: '15px', padding: '8px 20px', fontSize: '0.8rem' }}>
                                    View on Etherscan
                                </a>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default BulkUpload;
