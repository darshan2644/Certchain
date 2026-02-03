import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getReadOnlyContract } from '../utils/contract';
import { FaAward, FaExternalLinkAlt, FaSpinner, FaCertificate, FaGem, FaUserCircle, FaLinkedin, FaShareAlt, FaShieldAlt } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import DynamicCertificate from '../components/DynamicCertificate';

const PublicProfile = () => {
    const { studentId } = useParams();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchCertificates = useCallback(async (id) => {
        setLoading(true);
        setError('');
        try {
            const contract = await getReadOnlyContract();
            const certIds = await contract.getCertificatesByStudentId(id);

            if (certIds.length === 0) {
                setCertificates([]);
                return;
            }

            const certDetails = await Promise.all(
                certIds.map(async (cid) => {
                    const detail = await contract.getCertificate(cid);
                    return {
                        id: detail[0],
                        ipfsHash: detail[1],
                        timestamp: new Date(Number(detail[2]) * 1000).toLocaleDateString(),
                        studentName: detail[3],
                        studentId: detail[4]
                    };
                })
            );

            setCertificates(certDetails);
        } catch (err) {
            console.error("Error fetching certificates:", err);
            setError('Could not establish connection to the blockchain. Please ensure you have a Web3 provider like MetaMask installed.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (studentId) {
            fetchCertificates(studentId);
        }
    }, [studentId, fetchCertificates]);

    const copyProfileLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Public Profile Link Copied!");
    };

    return (
        <div className="page-container">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', marginBottom: '20px', fontWeight: 'bold' }}>
                    <FaShieldAlt /> CertChain Verifier
                </Link>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gradient"
                    style={{ fontSize: '3rem' }}
                >
                    Public Achievement Gallery
                </motion.h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto' }}>
                    This is a public, blockchain-verified profile. All credentials shown here are cryptographically secured and immutable.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
                    <div className="glass-panel" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 25px', borderRadius: '50px', border: '1px solid var(--secondary-color)' }}>
                        <FaUserCircle color="var(--secondary-color)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                            Student ID: {studentId}
                        </span>
                    </div>
                    <button onClick={copyProfileLink} className="btn-secondary" style={{ borderRadius: '50px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaShareAlt /> Share Profile
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '80px', color: 'var(--primary-color)' }}>
                    <FaSpinner className="spin" size={50} />
                    <p style={{ marginTop: '20px', opacity: 0.6 }}>Querying Ethereum ledger for verified records...</p>
                </div>
            ) : error ? (
                <div className="glass-panel" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', textAlign: 'center', border: '1px solid var(--error)' }}>
                    <FaGem size={40} style={{ color: 'var(--error)', marginBottom: '20px', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--error)' }}>Blockchain Connection Error</h3>
                    <p style={{ opacity: 0.7 }}>{error}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
                    <AnimatePresence mode="popLayout">
                        {certificates.length > 0 ? (
                            certificates.map((cert, index) => (
                                <motion.div
                                    key={cert.id}
                                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-panel"
                                    style={{ padding: '35px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '150px', opacity: 0.02, color: 'white' }}>
                                        <FaAward />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ padding: '12px', background: 'linear-gradient(135deg, var(--secondary-color), var(--accent-color))', borderRadius: '15px', color: 'white' }}>
                                                <FaCertificate size={28} />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'white' }}>{cert.studentName}</h3>
                                                <span style={{ fontSize: '0.85rem', opacity: 0.5 }}>Identity Verified on Chain</span>
                                            </div>
                                        </div>
                                        <div style={{ background: 'white', padding: '8px', borderRadius: '10px', boxShadow: '0 8px 20px rgba(0,243,255,0.2)' }}>
                                            <QRCodeCanvas
                                                value={`${window.location.origin}/verify?id=${cert.id}`}
                                                size={70}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', marginBottom: '25px' }}>
                                        <DynamicCertificate
                                            templateUrl={cert.ipfsHash}
                                            studentName={cert.studentName}
                                            timestamp={cert.timestamp}
                                            certId={cert.id}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px' }}>
                                            <label style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.4, marginBottom: '4px' }}>Issue Date</label>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--secondary-color)', fontWeight: 'bold' }}>{cert.timestamp}</span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px' }}>
                                            <label style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.4, marginBottom: '4px' }}>Verification ID</label>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontFamily: 'monospace' }}>{cert.id.slice(0, 12)}...</span>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '25px', display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => window.open(`${window.location.origin}/verify?id=${cert.id}`, '_blank')}
                                            className="btn-secondary"
                                            style={{ flex: 1, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            <FaShieldAlt /> Verify Live
                                        </button>
                                        <button
                                            onClick={() => {
                                                const date = new Date(cert.timestamp);
                                                const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME` +
                                                    `&name=${encodeURIComponent(cert.studentName + " - Certified Specialist")}` +
                                                    `&organizationName=${encodeURIComponent("Charusat University")}` +
                                                    `&issueMonth=${date.getMonth() + 1}` +
                                                    `&issueYear=${date.getFullYear()}` +
                                                    `&certId=${cert.id}` +
                                                    `&certUrl=${window.location.origin}/verify?id=${cert.id}`;
                                                window.open(url, '_blank');
                                            }}
                                            className="btn-primary"
                                            style={{
                                                flex: 1,
                                                background: '#0a66c2',
                                                fontSize: '0.85rem',
                                                color: 'white',
                                                border: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <FaLinkedin /> Add to LinkedIn
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.03)', borderRadius: '30px', border: '1px dashed rgba(255,255,255,0.1)' }}
                            >
                                <FaGem size={50} style={{ opacity: 0.1, marginBottom: '20px' }} />
                                <h2 style={{ opacity: 0.8 }}>Portfolio is empty</h2>
                                <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '400px', margin: '15px auto' }}>This student hasn't had any certificates issued to this ID yet or they are still being processed on-chain.</p>
                                <Link to="/" className="btn-secondary" style={{ marginTop: '20px' }}>Return to Portal</Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default PublicProfile;
