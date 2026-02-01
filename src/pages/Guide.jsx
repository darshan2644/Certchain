import React from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaCheckCircle, FaUserShield, FaFileContract, FaInfoCircle, FaLightbulb } from 'react-icons/fa';

const Guide = () => {
    const steps = [
        {
            title: "Wallet Setup (Both)",
            desc: "Both Admin and Student must have MetaMask installed. The student must COPY their wallet address (0x...) and send it to the Admin.",
            icon: <FaUserShield />
        },
        {
            title: "Institutional Issuance (Admin)",
            desc: "Admin logs in, enters the student's name and WALLET ADDRESS, then signs the blockchain transaction to issue the award.",
            icon: <FaFileContract />
        },
        {
            title: "Private Achievement (Student)",
            desc: "Student logs in with their wallet. The system automatically fetches matches from the blockchain and displays them in 'My Gallery'.",
            icon: <FaLightbulb />
        },
        {
            title: "Public Verification (Anyone)",
            desc: "Employers or third parties enter the Certificate ID on the 'Verify' page or scan a QR code to see instant immutable proof.",
            icon: <FaCheckCircle />
        }
    ];

    return (
        <div className="page-container">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ maxWidth: '1000px', margin: '0 auto' }}
            >
                <section style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 className="text-gradient" style={{ fontSize: '3rem' }}>The CertChain Workflow</h1>
                    <p style={{ opacity: 0.6, fontSize: '1.2rem' }}>A seamless bridge between Institutions, Students, and Employers.</p>
                </section>

                <div className="glass-panel" style={{ padding: '30px', marginBottom: '50px', border: '1px solid var(--secondary-color)', background: 'rgba(0, 243, 255, 0.05)' }}>
                    <h3 style={{ color: 'var(--secondary-color)', marginBottom: '15px' }}>💡 Essential Note for Students</h3>
                    <p style={{ margin: 0, lineHeight: '1.6' }}>
                        To receive your blockchain certificate, you <strong>must provide your MetaMask Wallet Address</strong> to Darshan Vasoya (Admin).
                        Without your unique address, your achievements cannot be linked to your digital identity in the private gallery.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', marginBottom: '80px' }}>
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            className="glass-panel"
                            initial={{ x: i % 2 === 0 ? -20 : 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            style={{ padding: '30px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}
                        >
                            <div style={{ padding: '15px', background: 'rgba(0,243,255,0.1)', borderRadius: '15px', color: 'var(--primary-color)', fontSize: '24px' }}>
                                {step.icon}
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 10px 0' }}>{i + 1}. {step.title}</h3>
                                <p style={{ margin: 0, opacity: 0.7, lineHeight: '1.6' }}>{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <section className="glass-panel" style={{ padding: '40px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', color: 'var(--accent-color)' }}>
                        <FaBook size={24} />
                        <h2 style={{ margin: 0 }}>Terms & Conditions</h2>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8' }}>
                        <p><strong>1. Immutable Responsibility:</strong> Once a certificate is issued to the Ethereum blockchain, it cannot be deleted. Users must ensure all information is accurate before clicking 'Issue'.</p>
                        <p><strong>2. Data Privacy:</strong> Certificates are stored on IPFS. While hashes are decentralized, avoid issuing sensitive personal information that isn't required for public verification.</p>
                        <p><strong>3. Use of Testnet:</strong> This application currently runs on the Sepolia Test Network. Assets hold no real monetary value.</p>
                        <p><strong>4. Admin Rights:</strong> Only authorized institution admins (the contract deployer) have the permission to sign and issue new records.</p>
                        <p><strong>5. Acceptance:</strong> By using this platform, you acknowledge the decentralized nature of the technology and agree to the terms of immutable record-keeping.</p>
                    </div>
                </section>
            </motion.div>
        </div>
    );
};

export default Guide;
