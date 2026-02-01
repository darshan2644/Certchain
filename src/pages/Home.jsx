import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaCloudUploadAlt, FaLayerGroup, FaAward, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();

    const allFeatures = [
        {
            title: "Verify Certificate",
            desc: "Instantly check the authenticity of any document on the Ethereum blockchain.",
            icon: <FaShieldAlt />,
            link: "/verify",
            color: "var(--primary-color)",
            roles: ['admin', 'student']
        },
        {
            title: "Issue Individual",
            desc: "Register a single student certificate securely with IPFS storage.",
            icon: <FaCloudUploadAlt />,
            link: "/upload",
            color: "var(--secondary-color)",
            roles: ['admin']
        },
        {
            title: "Bulk Issuance",
            desc: "Process hundreds of records at once via CSV for enterprise scale.",
            icon: <FaLayerGroup />,
            link: "/bulk",
            color: "var(--accent-color)",
            roles: ['admin']
        },
        {
            title: "Identity Registration",
            desc: "Register your wallet so institutions can issue certificates directly to you.",
            icon: <FaUserPlus />,
            link: "/register",
            color: "var(--secondary-color)",
            roles: ['student']
        },
        {
            title: "Student Gallery",
            desc: "Personal achievement dashboard for students to view their verified credentials.",
            icon: <FaAward />,
            link: "/dashboard",
            color: "#FF00D4",
            roles: ['student']
        }
    ];

    const features = allFeatures.filter(f => f.roles.includes(user?.role));

    return (
        <div className="page-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '40px', minHeight: '80vh' }}>
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ flex: '1', minWidth: '300px', maxWidth: '500px' }}
            >
                <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '20px', lineHeight: '1.1' }}>
                    CertChain
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '30px' }}>
                    The next generation of academic integrity. Secure, immutable, and universally verifiable certificates powered by Ethereum.
                </p>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <Link to="/guide" className="btn-primary">Get Started</Link>
                    <Link to="/verify" className="btn-secondary">Explore Records</Link>
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', flex: '1.5', maxWidth: '700px', width: '100%' }}>
                {features.map((f, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Link to={f.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <motion.div
                                className="glass-panel"
                                whileHover={{ scale: 1.05, border: `1px solid ${f.color}`, boxShadow: `0 0 20px ${f.color}33` }}
                                style={{ padding: '25px', height: '100%', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px' }}
                            >
                                <div style={{ fontSize: '32px', color: f.color }}>{f.icon}</div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{f.title}</h3>
                                <p style={{ fontSize: '0.85rem', opacity: 0.6, margin: 0, lineHeight: '1.4' }}>{f.desc}</p>
                            </motion.div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Home;
