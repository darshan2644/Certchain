import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaSearch, FaUserTie, FaGraduationCap, FaCertificate, FaExternalLinkAlt, FaAward, FaBriefcase, FaBuilding, FaFilter } from 'react-icons/fa';
import { getReadOnlyContract } from '../utils/contract';

const TalentSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filteredStudents, setFilteredStudents] = useState([]);

    useEffect(() => {
        // Fetch verified students from our local registry
        const registry = JSON.parse(localStorage.getItem('pending_registrations') || '[]');
        const verifiedOnly = registry.filter(s => s.verified);
        setStudents(verifiedOnly);
        setFilteredStudents(verifiedOnly);
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = students.filter(s =>
            s.name.toLowerCase().includes(term) ||
            s.studentId.toLowerCase().includes(term)
        );
        setFilteredStudents(filtered);
    };

    return (
        <div className="page-container">
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', background: 'rgba(168, 85, 247, 0.1)', padding: '10px 25px', borderRadius: '50px', border: '1px solid rgba(168, 85, 247, 0.2)', color: '#A855F7', marginBottom: '25px' }}>
                        <FaBriefcase />
                        <span style={{ fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Hiring Partners Portal</span>
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '20px' }}>Verified Talent Search</h1>
                    <p style={{ opacity: 0.6, fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
                        Connect with top academic achievers whose credentials are 100% verified on the blockchain.
                    </p>
                </div>

                <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <FaSearch style={{ position: 'absolute', left: '20px', top: '20px', opacity: 0.4 }} size={20} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search by student name, ID, or specialization..."
                            value={searchTerm}
                            onChange={handleSearch}
                            style={{ paddingLeft: '55px', height: '60px', fontSize: '1.1rem' }}
                        />
                    </div>
                    <button className="btn-secondary" style={{ height: '60px', padding: '0 30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaFilter /> Filters
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                    <AnimatePresence>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, index) => (
                                <motion.div
                                    key={student.address}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass-panel"
                                    style={{ padding: '30px', position: 'relative', overflow: 'hidden' }}
                                >
                                    <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,255,136,0.1)', color: 'var(--success)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <FaGraduationCap /> VERIFIED
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                                        <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '1.8rem', fontWeight: 'bold' }}>
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{student.name}</h3>
                                            <p style={{ margin: '5px 0 0 0', opacity: 0.5, fontSize: '0.9rem' }}>ID: {student.studentId}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '25px' }}>
                                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', opacity: 0.7 }}>React.js</span>
                                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', opacity: 0.7 }}>Blockchain</span>
                                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', opacity: 0.7 }}>Smart Contracts</span>
                                    </div>

                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', display: 'flex', gap: '10px' }}>
                                        <Link to={`/profile/${student.studentId}`} className="btn-primary" style={{ flex: 2, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <FaExternalLinkAlt size={14} /> View Portfolio
                                        </Link>
                                        <button className="btn-secondary" style={{ flex: 1, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaUserTie />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', opacity: 0.3 }}>
                                <FaBuilding size={60} style={{ marginBottom: '20px' }} />
                                <h3>No verified talent found matching your criteria.</h3>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="glass-panel" style={{ marginTop: '80px', padding: '50px', textAlign: 'center', background: 'linear-gradient(to right, rgba(0,243,255,0.05), rgba(168,85,247,0.05))' }}>
                    <FaAward size={40} color="var(--primary-color)" style={{ marginBottom: '20px' }} />
                    <h2 style={{ marginBottom: '15px' }}>Join the CertChain Partner Network</h2>
                    <p style={{ opacity: 0.6, maxWidth: '600px', margin: '0 auto 30px' }}>
                        Enterprises and recruiting agencies can get priority access to students' verifiable achievement trails and direct connection requests.
                    </p>
                    <button className="btn-primary" style={{ padding: '15px 40px' }}>Register as Partner</button>
                </div>
            </div>
        </div>
    );
};

export default TalentSearch;
