import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getReadOnlyContract } from '../utils/contract';
import { FaCrown, FaAward, FaMedal, FaStar, FaTrophy, FaUserGraduate, FaBolt, FaSpinner, FaSync } from 'react-icons/fa';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [filteredLeaderboard, setFilteredLeaderboard] = useState([]);
    const [selectedDept, setSelectedDept] = useState('All');
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRankings = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const contract = await getReadOnlyContract();

            // 1. DISCOVER ALL ON-CHAIN DATA
            const filter = contract.filters.CertificateIssued();
            const events = await contract.queryFilter(filter);

            // 2. DISCOVER LOCAL REGISTERED STUDENTS
            const localRegistry = JSON.parse(localStorage.getItem('pending_registrations') || '[]');

            // 3. AGGREGATE DATA
            const studentStats = {};

            // Seed with local registry (Initially 0 cert)
            localRegistry.forEach(student => {
                const id = student.studentId.trim().toUpperCase();
                studentStats[id] = {
                    name: student.name,
                    studentId: id,
                    department: student.department || 'General',
                    certCount: 0,
                    lastUpdated: 0
                };
            });

            // Add on-chain counts (Prioritize on-chain names & normalize IDs)
            events.forEach(event => {
                const { studentId, studentName } = event.args;
                const id = studentId.trim().toUpperCase();

                if (!studentStats[id]) {
                    const localMatch = localRegistry.find(r => r.studentId.trim().toUpperCase() === id);
                    studentStats[id] = {
                        name: studentName,
                        studentId: id,
                        department: localMatch?.department || 'General',
                        certCount: 0,
                    };
                } else {
                    // Update to official blockchain name if available
                    studentStats[id].name = studentName;
                }
                studentStats[id].certCount += 1;
            });

            // 3. TRANSFORM AND CALCULATE RANKS
            const data = Object.values(studentStats).map(student => {
                const points = (student.certCount * 100);

                let title = "Rising Star";
                let color = "#94a3b8"; // Gray

                if (student.certCount >= 10) { title = "Chain Legend"; color = "#facc15"; }
                else if (student.certCount >= 6) { title = "Verified Expert"; color = "#a855f7"; }
                else if (student.certCount >= 3) { title = "Elite Scholar"; color = "#3b82f6"; }

                return {
                    ...student,
                    points,
                    title,
                    color
                };
            });

            // 4. SORT BY POINTS
            const sorted = data.sort((a, b) => b.points - a.points);
            setLeaderboard(sorted);
            setFilteredLeaderboard(sorted);

            // Extract Departments for Filter
            const depts = ['All', ...new Set(data.map(s => s.department).filter(d => d))];
            setDepartments(depts);

        } catch (err) {
            console.error("Leaderboard Error:", err);
            setError("Critical: Could not connect to the Universal Ledger. Ensure MetaMask is connected to Sepolia.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRankings();
    }, [fetchRankings]);

    useEffect(() => {
        if (selectedDept === 'All') {
            setFilteredLeaderboard(leaderboard);
        } else {
            setFilteredLeaderboard(leaderboard.filter(s => s.department === selectedDept));
        }
    }, [selectedDept, leaderboard]);

    const getRankIcon = (index) => {
        if (index === 0) return <FaCrown style={{ color: '#FFD700', fontSize: '1.5rem' }} />;
        if (index === 1) return <FaMedal style={{ color: '#C0C0C0', fontSize: '1.4rem' }} />;
        if (index === 2) return <FaAward style={{ color: '#CD7F32', fontSize: '1.3rem' }} />;
        return <span style={{ opacity: 0.5, fontWeight: 'bold' }}>#{index + 1}</span>;
    };

    return (
        <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    >
                        <div style={{ background: 'linear-gradient(45deg, #facc15, #f59e0b)', padding: '20px', borderRadius: '50%', boxShadow: '0 0 40px rgba(250, 204, 21, 0.3)' }}>
                            <FaTrophy size={40} color="black" />
                        </div>
                    </motion.div>
                </div>
                <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '10px' }}>Hall of Fame</h1>
                <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>Fully Decentralized. Live Blockchain Sync Active.</p>

                <button
                    onClick={fetchRankings}
                    className="btn-secondary"
                    style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}
                    disabled={loading}
                >
                    <FaSync className={loading ? 'spin' : ''} /> Force Chain Sync
                </button>

                {!loading && departments.length > 1 && (
                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>Ranking Context:</span>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {departments.map(dept => (
                                <button
                                    key={dept}
                                    onClick={() => setSelectedDept(dept)}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: '50px',
                                        border: '1px solid var(--glass-border)',
                                        background: selectedDept === dept ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                                        color: selectedDept === dept ? 'black' : 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {dept}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <FaSpinner className="spin" size={40} color="var(--primary-color)" />
                    <p style={{ marginTop: '20px', opacity: 0.5 }}>Interrogating Smart Contract Events...</p>
                </div>
            ) : error ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', border: '1px solid var(--error)' }}>
                    <p style={{ color: 'var(--error)' }}>{error}</p>
                    <button className="btn-secondary" onClick={fetchRankings} style={{ marginTop: '20px' }}>Retry Connection</button>
                    <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '10px' }}>Note: This page requires a Sepolia Wallet connection.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {filteredLeaderboard.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                            <FaUserGraduate size={40} style={{ opacity: 0.2, marginBottom: '20px' }} />
                            <h3>No Records in {selectedDept}</h3>
                            <p style={{ opacity: 0.5 }}>Currently, no students from this department are registered or have certificates.</p>
                        </div>
                    ) : (
                        filteredLeaderboard.map((student, index) => (
                            <motion.div
                                key={student.studentId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-panel"
                                style={{
                                    padding: '20px 30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: index < 3 ? `1px solid ${index === 0 ? '#facc15' : index === 1 ? '#94a3b8' : '#cd7f32'}44` : '1px solid var(--glass-border)',
                                    background: index === 0 ? 'rgba(250, 204, 21, 0.03)' : 'rgba(255,255,255,0.02)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '25px', flex: 1 }}>
                                    <div style={{ width: '40px', textAlign: 'center' }}>
                                        {getRankIcon(index)}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: `linear-gradient(45deg, ${student.color}33, transparent)`,
                                            border: `1px solid ${student.color}66`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FaUserGraduate color={student.color} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {student.name}
                                                {index === 0 && <FaBolt style={{ color: '#facc15' }} />}
                                            </h4>
                                            <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>ID: {student.studentId}</span>
                                            <span style={{ marginLeft: '10px', fontSize: '0.7rem', background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7', padding: '2px 8px', borderRadius: '4px' }}>
                                                {student.department}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                color: student.color,
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                background: `${student.color}11`,
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                marginBottom: '4px'
                                            }}>
                                                {student.title}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaStar size={12} color="#facc15" /> {student.certCount} Certificates
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ width: '150px', textAlign: 'right', marginLeft: '40px' }}>
                                    <h3 style={{ margin: 0, color: 'var(--primary-color)', fontFamily: 'monospace' }}>
                                        {student.points} <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>XP</span>
                                    </h3>
                                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((student.points / leaderboard[0].points) * 100, 100)}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            style={{ height: '100%', background: 'var(--primary-color)' }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Leaderboard;
