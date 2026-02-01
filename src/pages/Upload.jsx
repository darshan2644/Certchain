import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { uploadToPinata } from '../utils/pinata';
import { getEthereumContract } from '../utils/contract';
import { FaCloudUploadAlt, FaCheckCircle, FaSpinner, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        certId: '',
        studentId: '',
        recipient: ''
    });
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState(''); // 'uploading', 'hashing', 'minting', 'success', 'error'
    const [message, setMessage] = useState('');
    const [txHash, setTxHash] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !formData.name || !formData.certId || !formData.studentId) {
            alert("Please fill name, certificate ID, and Student ID!");
            return;
        }

        try {
            setStatus('uploading');
            setMessage('Uploading asset to IPFS...');
            const ipfsHash = await uploadToPinata(file);

            setStatus('minting');
            setMessage('Awaiting blockchain confirmation...');
            const contract = await getEthereumContract();

            // Recipient is optional in V3
            const recipientAddr = formData.recipient || "0x0000000000000000000000000000000000000000";

            // Calling V3 issueCertificate
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
            setMessage(`Credential Issued to ID: ${formData.studentId}`);
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(error.reason || error.message || "An error occurred");
        }
    };

    return (
        <div className="page-container" style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ padding: '40px', width: '100%', maxWidth: '550px' }}
            >
                <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '10px' }}>Issue Legacy Credential</h2>
                <p style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.85rem', marginBottom: '30px' }}>Linked to the Student's University Identity.</p>

                <form onSubmit={handleSubmit}>
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
                            <label className="input-label">University / Student ID</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. UNI-101"
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
                            placeholder="e.g. CERT-2024-001"
                            value={formData.certId}
                            onChange={(e) => setFormData({ ...formData, certId: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Recipient Wallet (Optional)</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="0x... (leave empty if student has no wallet)"
                            value={formData.recipient}
                            onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Credential Asset (PDF/Image)</label>
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <input
                                type="file"
                                id="file-upload"
                                onChange={handleFileChange}
                                accept=".pdf,.png,.jpg,.jpeg"
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="file-upload" className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                                <FaCloudUploadAlt size={20} color="var(--primary-color)" />
                                {file ? file.name : "Select Asset..."}
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '20px' }}
                        disabled={status === 'uploading' || status === 'minting'}
                    >
                        {status === 'uploading' || status === 'minting' ? <FaSpinner className="spin" /> : 'Confirm Blockchain Issuance'}
                    </button>
                </form>

                {status && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: '20px', padding: '15px', borderRadius: '10px', background: status === 'error' ? 'rgba(255,0,85,0.1)' : 'rgba(0,243,255,0.05)', border: `1px solid ${status === 'error' ? 'var(--error)' : 'var(--primary-color)'}` }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: status === 'error' ? 'var(--error)' : 'var(--primary-color)' }}>
                                {status === 'success' ? <FaCheckCircle /> : status === 'error' ? <FaExclamationTriangle /> : <FaSpinner className="spin" />}
                                <strong>{status.toUpperCase()}</strong>
                            </div>
                            {status === 'success' && (
                                <button
                                    onClick={() => navigate(`/verify?id=${formData.certId}`)}
                                    className="btn-secondary"
                                    style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                                >
                                    <FaSearch /> Verify Now
                                </button>
                            )}
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>{message}</p>
                        {txHash && (
                            <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: '10px', color: 'var(--primary-color)', fontSize: '0.75rem' }}>
                                View Transaction on Etherscan
                            </a>
                        )}
                    </motion.div>
                )}
            </motion.div>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Upload;
