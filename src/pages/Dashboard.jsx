import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getReadOnlyContract } from '../utils/contract';
import { FaAward, FaExternalLinkAlt, FaSpinner, FaCertificate, FaGem, FaUserCircle, FaLinkedin } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import DynamicCertificate from '../components/DynamicCertificate';

const Dashboard = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCertificates = useCallback(async (studentId) => {
        setLoading(true);
        try {
            const contract = await getReadOnlyContract();
            // Using the new V3 function to fetch by Student ID
            const certIds = await contract.getCertificatesByStudentId(studentId);

            const certDetails = await Promise.all(
                certIds.map(async (id) => {
                    const detail = await contract.getCertificate(id);
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
        } catch (error) {
            console.error("Error fetching certificates:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.studentId) {
            fetchCertificates(user.studentId);
        }
    }, [user, fetchCertificates]);

    return (
        <div className="page-container">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gradient"
                >
                    Achievement Portfolio
                </motion.h1>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Blockchain-verified academic credentials associated with your Student ID.</p>

                {user?.studentId && (
                    <div className="glass-panel" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 25px', marginTop: '20px', borderRadius: '50px', border: '1px solid var(--secondary-color)' }}>
                        <FaUserCircle color="var(--secondary-color)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                            Portfolio for ID: {user.studentId}
                        </span>
                    </div>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--primary-color)' }}>
                    <FaSpinner className="spin" size={40} />
                    <p>Scanning the blockchain for your records...</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                    <AnimatePresence>
                        {certificates.length > 0 ? (
                            certificates.map((cert, index) => (
                                <motion.div
                                    key={cert.id}
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-panel"
                                    style={{ padding: '30px', position: 'relative', overflow: 'hidden' }}
                                >
                                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '100px', opacity: 0.03 }}>
                                        <FaAward />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ padding: '12px', background: 'linear-gradient(135deg, var(--secondary-color), var(--accent-color))', borderRadius: '12px' }}>
                                                <FaCertificate size={24} color="white" />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{cert.studentName}</h3>
                                                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Issued on {cert.timestamp}</span>
                                            </div>
                                        </div>
                                        <div style={{ background: 'white', padding: '8px', borderRadius: '8px', boxShadow: '0 0 15px rgba(0,243,255,0.3)' }}>
                                            <QRCodeCanvas
                                                value={`${window.location.origin}/verify?id=${cert.id}`}
                                                size={80}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                        <div>
                                            <label className="input-label" style={{ marginBottom: '4px', fontSize: '0.7rem' }}>Student ID</label>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--secondary-color)', fontWeight: 'bold' }}>{cert.studentId}</div>
                                        </div>
                                        <div>
                                            <label className="input-label" style={{ marginBottom: '4px', fontSize: '0.7rem' }}>Certificate ID</label>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontFamily: 'monospace' }}>{cert.id}</div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '10px', position: 'relative' }}>
                                        <DynamicCertificate
                                            templateUrl={cert.ipfsHash}
                                            studentName={cert.studentName}
                                            timestamp={cert.timestamp}
                                            certId={cert.id}
                                        />
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
                                                marginTop: '15px',
                                                width: '100%',
                                                background: '#0a66c2',
                                                color: 'white',
                                                border: 'none',
                                                boxShadow: '0 4px 14px rgba(10, 102, 194, 0.4)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <FaLinkedin size={20} /> Add to LinkedIn Profile
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}
                            >
                                <FaGem size={40} style={{ opacity: 0.3, marginBottom: '20px' }} />
                                <h3>No certificates found for this ID.</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Ensure your Student ID is entered correctly or contact your institution.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Dashboard;
