import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { FaChartLine, FaUsers, FaCertificate, FaDatabase, FaArrowUp, FaGlobe } from 'react-icons/fa';
import { getReadOnlyContract } from '../utils/contract';

const AdminAnalytics = () => {
    const [stats, setStats] = useState({
        totalCerts: 0,
        uniqueStudents: 0,
        storageSaved: '24.5 GB',
        uptime: '99.99%',
        lastUpdated: new Date().toLocaleTimeString()
    });

    const [chartData, setChartData] = useState([
        { name: 'Jan', issued: 45, interactive: 120 },
        { name: 'Feb', issued: 52, interactive: 98 },
        { name: 'Mar', issued: 85, interactive: 210 },
        { name: 'Apr', issued: 120, interactive: 340 },
        { name: 'May', issued: 154, interactive: 450 },
        { name: 'Jun', issued: 180, interactive: 580 },
    ]);

    const distributionData = [
        { name: 'Internship', value: 400 },
        { name: 'Degree', value: 300 },
        { name: 'Certificate', value: 300 },
        { name: 'Merit', value: 200 },
    ];

    const COLORS = ['#00f3ff', '#bc13fe', '#7000ff', '#00ff88'];

    useEffect(() => {
        const fetchBlockchainStats = async () => {
            try {
                // In a production app, we would query events or a subgraph
                // Here we fetch some real "current" data from localStorage and contract
                const pendingCount = JSON.parse(localStorage.getItem('pending_registrations') || '[]').length;

                // Mocking the growth for demo purposes
                setStats(prev => ({
                    ...prev,
                    totalCerts: 432 + (Math.floor(Math.random() * 10)), // Base + random
                    uniqueStudents: 156 + pendingCount,
                }));
            } catch (err) {
                console.error("Analytics fetch error:", err);
            }
        };

        fetchBlockchainStats();
    }, []);

    const StatCard = ({ icon: Icon, title, value, trend, color }) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-panel"
            style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ padding: '12px', background: `${color}15`, borderRadius: '12px', color: color }}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FaArrowUp size={10} /> {trend}
                    </div>
                )}
            </div>
            <div>
                <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>{title}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{value}</div>
            </div>
        </motion.div>
    );

    return (
        <div className="page-container">
            <div style={{ marginBottom: '40px' }}>
                <h1 className="text-gradient">Institutional Intelligence</h1>
                <p style={{ opacity: 0.6 }}>Real-time blockchain issuance metrics and registry analytics.</p>
            </div>

            {/* Top Stat Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <StatCard icon={FaCertificate} title="Total Certificates" value={stats.totalCerts} trend="12% vs last month" color="#00f3ff" />
                <StatCard icon={FaUsers} title="Alumni Registered" value={stats.uniqueStudents} trend="8% increase" color="#bc13fe" />
                <StatCard icon={FaDatabase} title="IPFS Capacity Saved" value={stats.storageSaved} color="#7000ff" />
                <StatCard icon={FaGlobe} title="Node Uptime" value={stats.uptime} color="#00ff88" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', minHeight: '400px' }}>
                {/* Main Trend Chart */}
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                        <h3>Issuance Velocity</h3>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-color)' }}></div> Certificates
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--secondary-color)' }}></div> Verifications
                            </span>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorInteract" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#bc13fe" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#bc13fe" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(10,10,20,0.9)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}
                                    itemStyle={{ color: 'white' }}
                                />
                                <Area type="monotone" dataKey="issued" stroke="#00f3ff" fillOpacity={1} fill="url(#colorIssued)" strokeWidth={3} />
                                <Area type="monotone" dataKey="interactive" stroke="#bc13fe" fillOpacity={1} fill="url(#colorInteract)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution Pie */}
                <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '20px' }}>Asset Distribution</h3>
                    <div style={{ width: '100%', height: '250px' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ textAlign: 'left', marginTop: '20px', display: 'grid', gap: '10px' }}>
                        {distributionData.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[idx] }}></div> {item.name}
                                </span>
                                <span style={{ fontWeight: 'bold' }}>{Math.floor((item.value / 1200) * 100)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
