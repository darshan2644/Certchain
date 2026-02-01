import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaCode, FaRocket, FaEnvelope, FaFingerprint, FaUserShield } from 'react-icons/fa';

const Developer = () => {
    return (
        <div className="page-container">
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ padding: '50px', maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
            >
                {/* Background Decor */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', fontSize: '200px', opacity: 0.05, transform: 'rotate(-15deg)' }}>
                    <FaCode />
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))', margin: '0 auto 25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', color: 'white', border: '5px solid rgba(255,255,255,0.1)', boxShadow: '0 0 30px rgba(0,243,255,0.4)' }}>
                            DV
                        </div>
                        <h1 className="text-gradient" style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>Darshan Vasoya</h1>
                        <div style={{ display: 'inline-block', padding: '5px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '30px' }}>
                            STAGE: DAV
                        </div>
                    </motion.div>

                    <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                        Passionate Blockchain Developer and Full-Stack Architect specialized in creating secure, decentralized ecosystems.
                        Pioneering the future of digital identity and immutable document verification.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '50px' }}>
                        <a href="https://github.com/darshan2644" target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '15px 30px' }}>
                            <FaGithub size={24} /> GitHub
                        </a>
                        <a href="https://www.linkedin.com/in/darshan-vasoya-3aa924285/" target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '15px 30px' }}>
                            <FaLinkedin size={24} /> LinkedIn
                        </a>
                    </div>

                    <div style={{ marginBottom: '50px' }}>
                        <Link to="/admin" className="btn-secondary" style={{ border: '1px solid var(--error)', color: 'var(--error)', background: 'rgba(255,0,85,0.05)' }}>
                            <FaUserShield /> Open Security Control Center
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'left' }}>
                        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                            <FaFingerprint color="var(--primary-color)" size={30} style={{ marginBottom: '15px' }} />
                            <h4 style={{ margin: '0 0 10px 0' }}>Identity Focus</h4>
                            <p style={{ fontSize: '0.9rem', opacity: 0.6, margin: 0 }}>Building zero-trust verification systems for the modern web.</p>
                        </div>
                        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                            <FaRocket color="var(--secondary-color)" size={30} style={{ marginBottom: '15px' }} />
                            <h4 style={{ margin: '0 0 10px 0' }}>Web3 Native</h4>
                            <p style={{ fontSize: '0.9rem', opacity: 0.6, margin: 0 }}>Leveraging Ethereum and IPFS to eliminate document forgery.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Developer;
