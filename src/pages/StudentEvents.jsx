import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarCheck, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaExclamationCircle, FaUserSlash, FaUsers, FaRegClock, FaGlobe } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { pushNotification } from '../utils/notifications';

const StudentEvents = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [registeringEvent, setRegisteringEvent] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', department: '', reason: '' });
    const [studentProfile, setStudentProfile] = useState(null);

    useEffect(() => {
        const savedEvents = JSON.parse(localStorage.getItem('certchain_events') || '[]');
        setEvents(savedEvents);

        const savedRegs = JSON.parse(localStorage.getItem('event_registrations') || '[]');
        setRegistrations(savedRegs);

        // Fetch student's verified profile
        const registry = JSON.parse(localStorage.getItem('pending_registrations') || '[]');
        const profile = registry.find(r => r.studentId === user?.studentId || r.address === user?.address);
        setStudentProfile(profile);

        // Pre-fill name if profile exists
        if (profile?.name) {
            setFormData(prev => ({ ...prev, fullName: profile.name }));
        }
    }, [user]);

    const isRegistered = (eventId) => {
        return registrations.some(r => r.eventId === eventId && (r.studentId === user?.studentId || r.studentAddress === user?.address));
    };

    const getParticipantCount = (eventId) => {
        return registrations.filter(r => r.eventId === eventId).length;
    };

    const handleCancelRegistration = (eventId) => {
        if (window.confirm("Are you sure you want to cancel your registration? This will free up a seat for others.")) {
            const updatedRegs = registrations.filter(r =>
                !(r.eventId === eventId && (r.studentId === user?.studentId || r.studentAddress === user?.address))
            );
            setRegistrations(updatedRegs);
            localStorage.setItem('event_registrations', JSON.stringify(updatedRegs));
            setStatus({ type: 'success', message: "Registration cancelled successfully." });
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        }
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        if (!registeringEvent) return;

        const event = registeringEvent;

        // Validation Checks
        if (isRegistered(event.id)) return;

        // 1. Capacity Check
        if (event.maxSeats && getParticipantCount(event.id) >= event.maxSeats) {
            setStatus({ type: 'error', message: 'Sorry, this event is already full!' });
            setRegisteringEvent(null);
            return;
        }

        // 2. Identification Check
        const studentName = formData.fullName || studentProfile?.name || user.username || user.name || "Student";
        const studentId = user.studentId || studentProfile?.studentId || "PENDING";
        const studentAddress = studentProfile?.address || user.address || "0x0000000000000000000000000000000000000000";

        if (studentId === "PENDING" && !user.address) {
            setStatus({ type: 'error', message: 'Please complete your profile registration first!' });
            setRegisteringEvent(null);
            return;
        }

        const newRegistration = {
            eventId: event.id,
            eventTitle: event.title,
            studentName: studentName,
            studentId: studentId,
            studentAddress: studentAddress,
            registeredAt: new Date().toISOString(),
            ...formData
        };

        const updatedRegs = [...registrations, newRegistration];
        setRegistrations(updatedRegs);
        localStorage.setItem('event_registrations', JSON.stringify(updatedRegs));

        pushNotification(`Registration Confirmed for ${event.title}!`, 'event');

        setStatus({ type: 'success', message: `Confirmed! You are registered for ${event.title}.` });
        setRegisteringEvent(null);
        setFormData({ fullName: studentProfile?.name || '', email: '', phone: '', department: '', reason: '' });

        setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    };

    // Filter events: Keep only future events
    const filteredEvents = events.filter(e => {
        const eventDate = new Date(e.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate >= today;
    });

    return (
        <div className="page-container">
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '15px' }}>Event Discovery</h1>
                    <p style={{ opacity: 0.6, fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Browse and participate in global workshops and networking sessions.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {status.message && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{
                                padding: '20px 30px',
                                borderRadius: '20px',
                                background: status.type === 'success' ? 'rgba(0,255,136,0.1)' : 'rgba(255,0,85,0.1)',
                                border: `1px solid ${status.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                                color: status.type === 'success' ? 'var(--success)' : 'var(--error)',
                                marginBottom: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                boxShadow: status.type === 'success' ? '0 0 30px rgba(0, 255, 136, 0.1)' : '0 0 30px rgba(255, 0, 85, 0.1)'
                            }}
                        >
                            {status.type === 'success' ? <FaCheckCircle size={24} /> : <FaExclamationCircle size={24} />}
                            <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>{status.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="events-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '30px' }}>
                    {filteredEvents.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '80px', textAlign: 'center', gridColumn: '1 / -1' }}>
                            <FaCalendarAlt size={60} style={{ opacity: 0.1, marginBottom: '25px' }} />
                            <h3 style={{ opacity: 0.5 }}>No events found</h3>
                            <p style={{ opacity: 0.3 }}>Check back later for upcoming sessions.</p>
                        </div>
                    ) : (
                        filteredEvents.map(event => {
                            const registered = isRegistered(event.id);
                            const participantCount = getParticipantCount(event.id);
                            const isFull = event.maxSeats && participantCount >= event.maxSeats;

                            return (
                                <motion.div
                                    key={event.id}
                                    className="glass-panel"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                    style={{
                                        padding: '35px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        border: registered ? '1px solid var(--success)' : '1px solid var(--glass-border)',
                                        background: registered ? 'rgba(0, 255, 136, 0.03)' : 'var(--glass-bg)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '10px' }}>
                                        {registered && (
                                            <span style={{ fontSize: '0.65rem', color: 'var(--success)', background: 'rgba(0,255,136,0.1)', padding: '4px 10px', borderRadius: '15px', fontWeight: 'bold', border: '1px solid rgba(0,255,136,0.2)' }}>
                                                SECURED
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.6rem', color: 'white', lineHeight: '1.2' }}>{event.title}</h2>
                                        <p style={{ opacity: 0.7, marginBottom: '25px', lineHeight: '1.6', fontSize: '0.95rem' }}>{event.description}</p>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '30px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '10px' }}>
                                                <FaCalendarAlt size={14} color="var(--primary-color)" />
                                                <span style={{ fontSize: '0.8rem' }}>{event.date}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '10px' }}>
                                                <FaRegClock size={14} color="var(--primary-color)" />
                                                <span style={{ fontSize: '0.8rem' }}>{event.time || '09:00'}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '10px' }}>
                                                <FaUsers size={14} color={isFull ? "var(--error)" : "var(--success)"} />
                                                <span style={{ fontSize: '0.8rem' }}>{participantCount}{event.maxSeats ? ` / ${event.maxSeats}` : ''}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {!registered ? (
                                            <button
                                                onClick={() => setRegisteringEvent(event)}
                                                className={isFull ? "btn-secondary" : "btn-primary"}
                                                disabled={isFull}
                                                style={{
                                                    width: '100%',
                                                    height: '50px',
                                                    fontSize: '1rem',
                                                    fontWeight: '600',
                                                    boxShadow: !isFull ? '0 10px 20px rgba(0, 243, 255, 0.1)' : 'none',
                                                    opacity: isFull ? 0.5 : 1
                                                }}
                                            >
                                                {isFull ? 'Fully Booked' : 'Join Event'}
                                            </button>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                                <button disabled className="btn-secondary" style={{ flex: 2, height: '50px', color: 'var(--success)', border: '1px solid var(--success)', opacity: 1 }}>
                                                    <FaCheckCircle /> Registered
                                                </button>
                                                <button onClick={() => handleCancelRegistration(event.id)} className="btn-secondary" style={{ flex: 1, color: 'var(--error)', border: '1px solid rgba(255,0,85,0.2)' }}>
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Dynamic Registration Modal */}
                <AnimatePresence>
                    {registeringEvent && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="glass-panel"
                                style={{ maxWidth: '600px', width: '100%', padding: '40px', border: '1px solid var(--primary-color)' }}
                            >
                                <div style={{ marginBottom: '25px' }}>
                                    <h2 className="text-gradient" style={{ marginBottom: '10px' }}>Complete Event Registration</h2>
                                    <p style={{ opacity: 0.6 }}>Event: <strong style={{ color: 'white' }}>{registeringEvent.title}</strong></p>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', background: 'rgba(0,243,255,0.1)', padding: '5px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FaGlobe size={12} /> Open Registration
                                        </span>
                                    </div>
                                </div>

                                <form onSubmit={handleRegisterSubmit}>
                                    <div className="input-group">
                                        <label className="input-label">Student Full Name</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            required
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            placeholder="Enter your real legal name"
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="input-group">
                                            <label className="input-label">Official Email</label>
                                            <input type="email" className="input-field" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="student@edu.in" />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Phone Number</label>
                                            <input type="tel" className="input-field" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">Department & Semester</label>
                                        <input type="text" className="input-field" required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="e.g. IT Department, Sem 6" />
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">Statement of Purpose (Why join?)</label>
                                        <textarea className="input-field" required value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="Explain your interest in this event..." rows="3" />
                                    </div>

                                    <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                                        <button type="button" onClick={() => setRegisteringEvent(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                        <button type="submit" className="btn-primary" style={{ flex: 2, height: '55px', fontSize: '1.1rem' }}>Confirm Participation</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StudentEvents;
