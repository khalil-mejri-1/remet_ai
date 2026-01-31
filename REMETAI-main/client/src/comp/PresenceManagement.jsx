import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiClock, FiCheckCircle, FiXCircle, FiUsers } from "react-icons/fi";
import API_BASE_URL from '../config';

const ITEMS_PER_PAGE = 5;

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="pagination-controls" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginTop: '20px',
            padding: '10px'
        }}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : '#6366f1',
                    color: currentPage === 1 ? '#666' : 'white',
                    border: 'none',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                }}
            >
                Previous
            </button>
            <span style={{ color: '#94a3b8', fontWeight: '500' }}>
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : '#6366f1',
                    color: currentPage === totalPages ? '#666' : 'white',
                    border: 'none',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                }}
            >
                Next
            </button>
        </div>
    );
};

export default function PresenceManagement() {
    const [attendances, setAttendances] = useState([]);
    const [programData, setProgramData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalPage, setGlobalPage] = useState(1); // 👈 Added global pagination state
    const [sessionPages, setSessionPages] = useState({}); // 👈 Mapping: sessionId -> pageNumber
    const navigate = useNavigate();

    const fetchAttendances = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [attendanceRes, programRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/attendance`),
                axios.get(`${API_BASE_URL}/api/program`)
            ]);
            setAttendances(attendanceRes.data);
            setProgramData(programRes.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load data from server.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendances();
    }, []);

    // Helper: Group attendances by Session and then by User (to merge check-in/out)
    const groupedData = attendances.reduce((acc, curr) => {
        const sid = curr.sessionId;
        const uid = curr.userId;

        if (!acc[sid]) {
            acc[sid] = {
                sessionId: sid,
                sessionName: curr.nameSession,
                sessionTime: curr.timeSession,
                userRecords: {} // Map userId -> merged record
            };
        }

        if (!acc[sid].userRecords[uid]) {
            acc[sid].userRecords[uid] = { ...curr };
        } else {
            // MERGE: Take existing values, but overwrite nulls with present data
            const existing = acc[sid].userRecords[uid];
            acc[sid].userRecords[uid] = {
                ...existing,
                checkInTime: existing.checkInTime || curr.checkInTime,
                checkOutTime: existing.checkOutTime || curr.checkOutTime,
                fullName: existing.fullName || curr.fullName,
                email: existing.email || curr.email,
                class: existing.class || curr.class,
                phone: existing.phone || curr.phone
            };
        }
        return acc;
    }, {});

    const sessions = Object.values(groupedData).map(session => ({
        ...session,
        records: Object.values(session.userRecords)
    })).filter(session =>
        session.sessionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.records.some(r => r.fullName?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // --- NOUVEAU : LOGIQUE DE SUIVI GLOBAL (Logic for Global Tracking) ---
    // 1. Identifier toutes les sessions qui nécessitent une présence
    const allRequiredSessions = programData.reduce((acc, day) => {
        const required = day.sessions.filter(s => s.attendanceEnabled !== false);
        return [...acc, ...required];
    }, []);

    const totalRequiredCount = allRequiredSessions.length;

    // 2. Grouper par étudiant pour le statut global
    const studentGlobalStatus = attendances.reduce((acc, curr) => {
        const uid = curr.userId;
        if (!acc[uid]) {
            acc[uid] = {
                fullName: curr.fullName,
                email: curr.email,
                completedSessionIds: new Set()
            };
        }

        // Find if this specific attendance record counts as "Fully Present"
        // We look at the merged state which is in groupedData
        const sessionMergedRecord = groupedData[curr.sessionId]?.userRecords[uid];
        if (sessionMergedRecord?.checkInTime && sessionMergedRecord?.checkOutTime) {
            // Only count if the session itself is required
            const isRequired = allRequiredSessions.some(s => String(s.id) === String(curr.sessionId));
            if (isRequired) {
                acc[uid].completedSessionIds.add(String(curr.sessionId));
            }
        }
        return acc;
    }, {});

    const globalStatsList = Object.values(studentGlobalStatus).map(student => ({
        ...student,
        completedCount: student.completedSessionIds.size,
        isFullyComplete: student.completedSessionIds.size === totalRequiredCount
    })).sort((a, b) => b.completedCount - a.completedCount);

    // --- Pagination Logic for Global Stats ---
    const totalGlobalPages = Math.ceil(globalStatsList.length / ITEMS_PER_PAGE);
    const paginatedGlobalStats = globalStatsList.slice((globalPage - 1) * ITEMS_PER_PAGE, globalPage * ITEMS_PER_PAGE);

    const handleGlobalPageChange = (page) => {
        setGlobalPage(page);
    };

    const handleSessionPageChange = (sid, page) => {
        setSessionPages(prev => ({ ...prev, [sid]: page }));
    };

    // PDF Export Handler
    const handleExportPDF = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/attendance/export-pdf`);

            if (!response.ok) {
                const error = await response.json();
                alert(error.message || 'Error generating PDF');
                return;
            }

            // Create blob from response
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `REMET-AI-2026-Attendance-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF Export Error:', error);
            alert('Failed to export PDF');
        }
    };
    // ---------------------------------------------------------------------

    const formatTime = (dateString) => {
        if (!dateString) return "---";
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/')}>
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1>Presence Dashboard</h1>
                        <p>Track and manage session attendance</p>
                    </div>
                </div>

                <div className="header-search" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search sessions or students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <button
                        onClick={handleExportPDF}
                        style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export PDF
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Fetching attendance records...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <FiXCircle size={48} color="#ef4444" />
                        <p>{error}</p>
                        <button onClick={fetchAttendances}>Retry</button>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="empty-state">
                        <FiUsers size={48} color="#94a3b8" />
                        <p>No attendance records found.</p>
                    </div>
                ) : (
                    <>
                        <section className="global-status-section" style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '40px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ background: '#6366f1', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                                    <FiUsers size={24} color="white" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Global Conference Completion</h2>
                                    <p style={{ color: '#94a3b8', margin: 0 }}>Students must complete all {totalRequiredCount} required sessions</p>
                                </div>
                            </div>

                            <div className="global-table-wrapper" style={{ overflowX: 'auto' }}>
                                <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <th style={{ padding: '0 16px 12px' }}>Student</th>
                                            <th style={{ padding: '0 16px 12px' }}>Progress</th>
                                            <th style={{ padding: '0 16px 12px' }}>Conference Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedGlobalStats.map(student => (
                                            <tr key={student.email} style={{ background: 'rgba(255, 255, 255, 0.03)', transition: 'background 0.2s' }}>
                                                <td style={{ padding: '16px', borderRadius: '12px 0 0 12px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <strong style={{ fontSize: '1rem' }}>{student.fullName}</strong>
                                                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{student.email}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div style={{
                                                                width: `${(student.completedCount / totalRequiredCount) * 100 || 0}%`,
                                                                height: '100%',
                                                                background: student.isFullyComplete ? '#10b981' : '#6366f1',
                                                                transition: 'width 0.5s ease-out'
                                                            }}></div>
                                                        </div>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: '600', minWidth: '45px' }}>{student.completedCount}/{totalRequiredCount}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px', borderRadius: '0 12px 12px 0' }}>
                                                    {student.isFullyComplete ? (
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            background: 'rgba(16, 185, 129, 0.1)',
                                                            color: '#10b981',
                                                            padding: '6px 12px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600'
                                                        }}>
                                                            <FiCheckCircle size={14} /> Full Participant ✅
                                                        </span>
                                                    ) : (
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            background: 'rgba(245, 158, 11, 0.1)',
                                                            color: '#f59e0b',
                                                            padding: '6px 12px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600'
                                                        }}>
                                                            <FiClock size={14} /> Incomplete ({totalRequiredCount - student.completedCount} left)
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <PaginationControls
                                currentPage={globalPage}
                                totalPages={totalGlobalPages}
                                onPageChange={handleGlobalPageChange}
                            />
                        </section>

                        <div className="sessions-grid">
                            {sessions.map(session => (
                                <section key={session.sessionId} className="session-card">
                                    <div className="session-card-header">
                                        <div className="session-info">
                                            <h3>{session.sessionName}</h3>
                                            <div className="session-meta">
                                                <span className="meta-item"><FiClock size={14} /> {session.sessionTime}</span>
                                                <span className="meta-item"><FiUsers size={14} /> {session.records.length} Scanned</span>
                                            </div>
                                        </div>
                                        <div className="session-stats">
                                            <div className="stat-circle">
                                                {Math.round((session.records.filter(r => r.checkInTime && r.checkOutTime).length / session.records.length) * 100 || 0)}%
                                                <span>Full</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="session-table-wrapper">
                                        <table className="dashboard-table">
                                            <thead>
                                                <tr>
                                                    <th>Student Name</th>
                                                    <th>Check-in</th>
                                                    <th>Check-out</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    const currentPage = sessionPages[session.sessionId] || 1;
                                                    const totalPages = Math.ceil(session.records.length / ITEMS_PER_PAGE);
                                                    const paginatedRecords = session.records.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

                                                    return paginatedRecords.map(record => {
                                                        const isFullyPresent = record.checkInTime && record.checkOutTime;
                                                        return (
                                                            <tr key={record._id}>
                                                                <td className="student-name">
                                                                    <div>
                                                                        <strong>{record.fullName}</strong>
                                                                        <span>{record.email}</span>
                                                                    </div>
                                                                </td>
                                                                <td>{formatTime(record.checkInTime)}</td>
                                                                <td>{formatTime(record.checkOutTime)}</td>
                                                                <td>
                                                                    {isFullyPresent ? (
                                                                        <span className="badge badge-success"><FiCheckCircle /> Present</span>
                                                                    ) : (
                                                                        <span className="badge badge-warning"><FiClock /> Partial</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    });
                                                })()}
                                            </tbody>
                                        </table>
                                        {(() => {
                                            const currentPage = sessionPages[session.sessionId] || 1;
                                            const totalPages = Math.ceil(session.records.length / ITEMS_PER_PAGE);
                                            return (
                                                <PaginationControls
                                                    currentPage={currentPage}
                                                    totalPages={totalPages}
                                                    onPageChange={(page) => handleSessionPageChange(session.sessionId, page)}
                                                />
                                            );
                                        })()}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}