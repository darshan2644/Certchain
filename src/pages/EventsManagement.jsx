import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaPlus, FaUsers, FaFileCsv, FaTrash, FaChevronDown, FaChevronUp, FaDownload, FaClock, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';

const EventsManagement = () => {
    const [events, setEvents] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        time: '09:00',
        location: '',
        maxSeats: ''
    });
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [registrations, setRegistrations] = useState([]);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const savedEvents = JSON.parse(localStorage.getItem('certchain_events') || '[]');
        setEvents(savedEvents);

        const savedRegs = JSON.parse(localStorage.getItem('event_registrations') || '[]');
        setRegistrations(savedRegs);
    }, []);

    const handleAddEvent = (e) => {
        e.preventDefault();

        if (newEvent.date < today) {
            alert("You cannot create events for past dates!");
            return;
        }

        const eventToAdd = {
            ...newEvent,
            maxSeats: newEvent.maxSeats ? parseInt(newEvent.maxSeats) : null,
            id: `EVT-${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        const updatedEvents = [...events, eventToAdd];
        setEvents(updatedEvents);
        localStorage.setItem('certchain_events', JSON.stringify(updatedEvents));
        setNewEvent({ title: '', description: '', date: '', time: '09:00', location: '', maxSeats: '' });
        setShowAddForm(false);
    };

    const handleDeleteEvent = (id) => {
        if (window.confirm("Are you sure you want to delete this event? This will not delete registrations.")) {
            const updatedEvents = events.filter(e => e.id !== id);
            setEvents(updatedEvents);
            localStorage.setItem('certchain_events', JSON.stringify(updatedEvents));
        }
    };

    const getParticipantsForEvent = (eventId) => {
        return registrations.filter(r => r.eventId === eventId);
    };

    const downloadParticipantCSV = (eventId, eventTitle) => {
        const eventRegs = getParticipantsForEvent(eventId);
        if (eventRegs.length === 0) {
            alert("No registrations yet for this event!");
            return;
        }

        const headers = ["Student Name", "Student ID", "Wallet Address", "Email", "Phone", "Reason", "Registration Date"];
        const rows = eventRegs.map(r => [
            r.studentName,
            r.studentId,
            r.studentAddress,
            r.email || 'N/A',
            r.phone || 'N/A',
            r.reason || 'N/A',
            new Date(r.registeredAt).toLocaleString()
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `participants_${eventTitle.replace(/\s+/g, '_')}.csv`);
        link.click();
    };

    const downloadCertificateCSV = (eventId, eventTitle) => {
        const eventRegs = getParticipantsForEvent(eventId);
        if (eventRegs.length === 0) {
            alert("No registrations yet for this event!");
            return;
        }

        const headers = ["id", "name", "studentId", "recipient"];
        const rows = eventRegs.map(r => [
            `CERT-${eventId.split('-')[1] || Date.now()}-${r.studentId || 'STU'}`,
            r.studentName,
            r.studentId,
            r.studentAddress
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `bulk_cert_template_${eventTitle.replace(/\s+/g, '_')}.csv`);
        link.click();
    };

    return (
        <div className="page-container">
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h1 className="text-gradient">Event Management</h1>
                        <p style={{ opacity: 0.6 }}>Create and manage global events.</p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => setShowAddForm(!showAddForm)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', background: showAddForm ? 'var(--error)' : 'var(--primary-color)' }}
                    >
                        {showAddForm ? 'Cancel' : <><FaPlus /> Create New Event</>}
                    </button>
                </div>

                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass-panel"
                            style={{ padding: '40px', marginBottom: '40px', border: '1px solid var(--primary-color)' }}
                        >
                            <form onSubmit={handleAddEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="input-label">Event Title</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        required
                                        value={newEvent.title}
                                        onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                        placeholder="e.g. Annual Tech Symposium"
                                        style={{ fontSize: '1.2rem', padding: '15px' }}
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Date</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        required
                                        min={today}
                                        value={newEvent.date}
                                        onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Time Slot</label>
                                    <input
                                        type="time"
                                        className="input-field"
                                        required
                                        value={newEvent.time}
                                        onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Location / Platform</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        required
                                        value={newEvent.location}
                                        onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                        placeholder="e.g. Auditorium A-101 / Zoom"
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Max Seats (Optional)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={newEvent.maxSeats}
                                        onChange={e => setNewEvent({ ...newEvent, maxSeats: e.target.value })}
                                        placeholder="Unlimited seats if empty"
                                        min="1"
                                    />
                                </div>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="input-label">Description</label>
                                    <textarea
                                        className="input-field"
                                        rows="4"
                                        required
                                        value={newEvent.description}
                                        onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                        placeholder="Provide curriculum details, eligibility etc..."
                                        style={{ resize: 'vertical' }}
                                    ></textarea>
                                </div>
                                <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                                    <button type="submit" className="btn-primary" style={{ padding: '15px 80px', borderRadius: '15px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                        Launch Event
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="events-grid">
                    {events.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                            <FaCalendarAlt size={50} style={{ opacity: 0.2, marginBottom: '20px' }} />
                            <h3>No events scheduled yet</h3>
                            <p style={{ opacity: 0.5 }}>Click "Create New Event" to start scheduling.</p>
                        </div>
                    ) : (
                        [...events].reverse().map(event => {
                            const eventRegs = getParticipantsForEvent(event.id);
                            const isExpanded = selectedEventId === event.id;

                            return (
                                <motion.div
                                    key={event.id}
                                    className="glass-panel"
                                    layout
                                    style={{ marginBottom: '20px', padding: '25px', position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{event.title}</h3>
                                            </div>
                                            <p style={{ margin: '10px 0', opacity: 0.7 }}>{event.description}</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.85rem', opacity: 0.6 }}>
                                                <span><FaCalendarAlt color="var(--primary-color)" style={{ marginRight: '8px' }} /> {event.date}</span>
                                                <span><FaClock color="var(--primary-color)" style={{ marginRight: '8px' }} /> {event.time || '09:00'}</span>
                                                <span><FaMapMarkerAlt color="var(--secondary-color)" style={{ marginRight: '8px' }} /> {event.location}</span>
                                                <span style={{ color: event.maxSeats && eventRegs.length >= event.maxSeats ? 'var(--error)' : 'var(--success)' }}>
                                                    <FaUsers style={{ marginRight: '8px' }} />
                                                    {eventRegs.length}{event.maxSeats ? ` / ${event.maxSeats}` : ''} Joined
                                                    {event.maxSeats && eventRegs.length >= event.maxSeats && " (FULL)"}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => setSelectedEventId(isExpanded ? null : event.id)}
                                                className="btn-secondary"
                                                style={{ padding: '10px' }}
                                            >
                                                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="btn-secondary"
                                                style={{ padding: '10px', color: 'var(--error)' }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                style={{ marginTop: '20px', paddingTop: '25px', borderTop: '1px solid var(--glass-border)' }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                    <h4 style={{ margin: 0 }}>Registration List ({eventRegs.length})</h4>
                                                    <div style={{ display: 'flex', gap: '15px' }}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); downloadParticipantCSV(event.id, event.title); }}
                                                            className="btn-secondary"
                                                            style={{ fontSize: '0.8rem', padding: '8px 15px' }}
                                                            disabled={eventRegs.length === 0}
                                                        >
                                                            <FaDownload style={{ marginRight: '8px' }} /> Export Participants
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); downloadCertificateCSV(event.id, event.title); }}
                                                            className="btn-primary"
                                                            style={{ fontSize: '0.8rem', padding: '8px 15px' }}
                                                            disabled={eventRegs.length === 0}
                                                        >
                                                            <FaFileCsv style={{ marginRight: '8px' }} /> Certificate Bulk Template
                                                        </button>
                                                    </div>
                                                </div>

                                                {eventRegs.length > 0 ? (
                                                    <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '15px' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                                            <thead>
                                                                <tr style={{ opacity: 0.5, borderBottom: '1px solid var(--glass-border)' }}>
                                                                    <th style={{ padding: '15px' }}>Student Name (ID)</th>
                                                                    <th style={{ padding: '15px' }}>Contact Info</th>
                                                                    <th style={{ padding: '15px' }}>Wallet Address</th>
                                                                    <th style={{ padding: '15px' }}>Reason</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {eventRegs.map((reg, idx) => (
                                                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                        <td style={{ padding: '15px' }}>
                                                                            <strong style={{ display: 'block' }}>{reg.studentName}</strong>
                                                                            <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{reg.studentId}</span>
                                                                        </td>
                                                                        <td style={{ padding: '15px' }}>
                                                                            <div style={{ fontSize: '0.8rem' }}>{reg.email || 'N/A'}</div>
                                                                            <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{reg.phone || 'N/A'}</div>
                                                                        </td>
                                                                        <td style={{ padding: '15px', fontFamily: 'monospace', color: 'var(--primary-color)', fontSize: '0.8rem' }}>
                                                                            {reg.studentAddress.slice(0, 10)}...{reg.studentAddress.slice(-6)}
                                                                        </td>
                                                                        <td style={{ padding: '15px', fontSize: '0.8rem', opacity: 0.7, maxWidth: '200px' }}>
                                                                            {reg.reason || 'No reason provided'}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: '40px', textAlign: 'center', opacity: 0.4 }}>
                                                        No active registrations for this event.
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventsManagement;
