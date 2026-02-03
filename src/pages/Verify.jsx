import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getReadOnlyContract } from '../utils/contract';
import { FaSearch, FaCheckDouble, FaTimesCircle, FaExternalLinkAlt, FaCube, FaDownload, FaIdCard } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import DynamicCertificate from '../components/DynamicCertificate';

const Verify = () => {
    const [id, setId] = useState('');
    const [cert, setCert] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const urlId = queryParams.get('id');
        if (urlId) {
            setId(urlId);
            performVerification(urlId);
        }
    }, []);

    const performVerification = async (verifyId) => {
        setLoading(true);
        setError('');
        setCert(null);

        try {
            const contract = await getReadOnlyContract();

            // Try direct Certificate ID first
            try {
                const result = await contract.getCertificate(verifyId);
                if (result[0]) {
                    setCert({
                        id: result[0],
                        ipfsHash: result[1],
                        timestamp: new Date(Number(result[2]) * 1000).toLocaleString(),
                        studentName: result[3],
                        studentId: result[4],
                        recipient: result[5],
                        revoked: result[6]
                    });
                    setLoading(false);
                    return;
                }
            } catch (e) {
                // Not a direct Certificate ID, try Student ID
                console.log("Not a cert ID, checking student ID...");
            }

            // Try Student ID lookup
            const studentCertIds = await contract.getCertificatesByStudentId(verifyId);
            if (studentCertIds && studentCertIds.length > 0) {
                // If found by Student ID, fetch the most recent certificate
                const latestCertId = studentCertIds[studentCertIds.length - 1];
                const result = await contract.getCertificate(latestCertId);

                setCert({
                    id: result[0],
                    ipfsHash: result[1],
                    timestamp: new Date(Number(result[2]) * 1000).toLocaleString(),
                    studentName: result[3],
                    studentId: result[4],
                    recipient: result[5],
                    revoked: result[6],
                    isFromStudentSearch: true,
                    totalCount: studentCertIds.length
                });
            } else {
                throw new Error("No records found for this ID.");
            }

        } catch (err) {
            console.error(err);
            if (err.message.includes("ENOMETA")) {
                setError("Blockchain provider not found. Please install the MetaMask extension to verify on-chain certificates.");
            } else {
                setError("ID not found on the blockchain. Please check if you entered a valid Certificate ID or Student ID.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!id) return;
        performVerification(id);
    };

    const downloadQRCode = () => {
        const canvas = document.getElementById('certificate-qr');
        const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        let downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `QR-${id}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div
                className="glass-panel"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ padding: '30px', width: '100%', maxWidth: '600px', textAlign: 'center' }}
            >
                <h2 className="text-gradient">Universal Verifier</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>Instantly validate institutional credentials across the Ethereum network.</p>

                <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Enter Certificate ID (e.g. CERT-001)..."
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" disabled={loading} style={{ minWidth: '120px' }}>
                        {loading ? 'Processing...' : 'Verify'}
                    </button>
                </form>
            </motion.div>

            <div style={{ marginTop: '40px', width: '100%', maxWidth: '850px' }}>
                <AnimatePresence>
                    {cert && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-panel"
                            style={{
                                padding: '40px',
                                border: cert.revoked ? '2px solid var(--error)' : '1px solid var(--success)',
                                background: cert.revoked ? 'rgba(255, 0, 85, 0.1)' : 'rgba(0, 255, 136, 0.05)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1', minWidth: '300px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', color: cert.revoked ? 'var(--error)' : 'var(--success)' }}>
                                        {cert.revoked ? <FaTimesCircle size={30} /> : <FaCheckDouble size={30} />}
                                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{cert.revoked ? 'CERTIFICATE REVOKED' : 'Authentic Record'}</h3>
                                    </div>

                                    {cert.isFromStudentSearch && (
                                        <div style={{ background: 'rgba(0,243,255,0.1)', color: 'var(--primary-color)', padding: '8px 15px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(0,243,255,0.2)' }}>
                                            Found <strong>{cert.totalCount}</strong> certificates for this Student ID. Showing the most recent.
                                        </div>
                                    )}

                                    {cert.revoked && (
                                        <div style={{ background: 'var(--error)', color: 'white', padding: '10px 20px', borderRadius: '10px', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center', fontSize: '1.1rem', boxShadow: '0 0 20px rgba(255,0,85,0.4)' }}>
                                            ⚠️ INVALID CREDENTIAL
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label className="input-label">Student Name</label>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{cert.studentName}</div>
                                        </div>
                                        <div>
                                            <label className="input-label">University ID</label>
                                            <div style={{ fontSize: '1.2rem', color: 'var(--secondary-color)', fontWeight: 'bold' }}>{cert.studentId}</div>
                                        </div>
                                        <div>
                                            <label className="input-label">Issue Date</label>
                                            <div style={{ fontSize: '1rem' }}>{cert.timestamp}</div>
                                        </div>
                                        <div>
                                            <label className="input-label">Certificate ID</label>
                                            <div style={{ fontFamily: 'monospace', color: 'var(--primary-color)' }}>{cert.id}</div>
                                        </div>
                                        {cert.recipient !== "0x0000000000000000000000000000000000000000" && (
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label className="input-label">Linked Wallet (Optional)</label>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.7, fontFamily: 'monospace' }}>{cert.recipient}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ marginTop: '30px', width: '100%' }}>
                                        <DynamicCertificate
                                            templateUrl={cert.ipfsHash}
                                            studentName={cert.studentName}
                                            timestamp={cert.timestamp}
                                            certId={cert.id}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ background: 'white', padding: '10px', borderRadius: '10px' }}>
                                        <QRCodeCanvas
                                            id="certificate-qr"
                                            value={`${window.location.origin}/verify?id=${cert.id}`}
                                            size={150}
                                            level={"H"}
                                            includeMargin={false}
                                        />
                                    </div>
                                    <button onClick={downloadQRCode} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 12px' }}>
                                        <FaDownload /> Download QR
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel"
                            style={{
                                padding: '30px',
                                border: '1px solid var(--error)',
                                background: 'rgba(255, 0, 85, 0.05)',
                                textAlign: 'center'
                            }}
                        >
                            <FaTimesCircle size={40} color="var(--error)" style={{ marginBottom: '15px' }} />
                            <h3 style={{ color: 'var(--error)', margin: '0 0 10px 0' }}>Verification Failed</h3>
                            <p style={{ margin: 0 }}>{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Verify;
