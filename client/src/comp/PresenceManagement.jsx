import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiCheckCircle, FiXCircle, FiUsers, FiClock } from "react-icons/fi";
import API_BASE_URL from '../config';

const ITEMS_PER_PAGE = 10;

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
    const [registrations, setRegistrations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalPage, setGlobalPage] = useState(1);
    const navigate = useNavigate();

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch attendances, program, and ALL registrations (limit 2000 to cover all)
            const [attendanceRes, programRes, registrationRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/attendance`),
                axios.get(`${API_BASE_URL}/api/program`),
                axios.get(`${API_BASE_URL}/api/registrations?limit=2000`)
            ]);

            setAttendances(attendanceRes.data);
            setProgramData(programRes.data);
            // API returns { data: [...] } for registrations
            setRegistrations(registrationRes.data.data || []);

        } catch (err) {
            console.error(err);
            setError("Failed to load data from server.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 1. Identify all REQUIRED sessions
    const allRequiredSessions = programData.reduce((acc, day) => {
        const required = day.sessions.filter(s => s.attendanceEnabled !== false);
        return [...acc, ...required];
    }, []);

    const totalRequiredCount = allRequiredSessions.length;

    // 2. Map Attendance Data for quick lookup:  UserId -> Set(SessionIds)
    // We only count a session if the user checked IN and OUT and the session is required.
    const attendanceMap = new Map();
    attendances.forEach(record => {
        const uid = String(record.userId);
        if (!attendanceMap.has(uid)) {
            attendanceMap.set(uid, new Set());
        }
        // Check strict completion: IN + OUT
        if (record.checkInTime && record.checkOutTime) {
            // Verify if this session ID is actually in the required list (optional safety check)
            const isRequired = allRequiredSessions.some(s => String(s.id) === String(record.sessionId));
            if (isRequired) {
                attendanceMap.get(uid).add(String(record.sessionId));
            }
        }
    });

    // 3. Combine Registrations with Attendance Data to build the Global List
    // We iterate over ALL registrations so we include 0/N students too.
    const combinedStats = registrations.map(student => {
        const uid = String(student.userId);
        const completedSessions = attendanceMap.get(uid) || new Set();

        return {
            userId: uid,
            fullName: student.fullName,
            email: student.email,
            institution: student.institution,
            class: student.class,
            completedCount: completedSessions.size,
            isFullyComplete: completedSessions.size === totalRequiredCount && totalRequiredCount > 0
        };
    });

    // 4. Filter based on Search Term
    const filteredStats = combinedStats.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 5. Sort: High completion first, then alphabetical
    const sortedStats = filteredStats.sort((a, b) => {
        if (b.completedCount !== a.completedCount) {
            return b.completedCount - a.completedCount;
        }
        return a.fullName.localeCompare(b.fullName);
    });

    // 6. Pagination
    const totalGlobalPages = Math.ceil(sortedStats.length / ITEMS_PER_PAGE);
    const paginatedStats = sortedStats.slice((globalPage - 1) * ITEMS_PER_PAGE, globalPage * ITEMS_PER_PAGE);

    const handleGlobalPageChange = (page) => {
        setGlobalPage(page);
    };

    // PDF Export Handler (Calls backend API)
    const handleExportPDF = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/attendance/export-pdf`);

            if (!response.ok) {
                const error = await response.json();
                alert(error.message || 'Error generating PDF');
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `REMET-AI-Global-Attendance-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF Export Error:', error);
            alert('Failed to export PDF');
        }
    };

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/')}>
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1>Global Conference Completion</h1>
                        <p>Track attendance accomplishment for all students</p>
                    </div>
                </div>

                <div className="header-search" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setGlobalPage(1); // Reset to page 1 on search
                            }}
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
                        <p>Loading global attendance data...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <FiXCircle size={48} color="#ef4444" />
                        <p>{error}</p>
                        <button onClick={fetchData}>Retry</button>
                    </div>
                ) : filteredStats.length === 0 ? (
                    <div className="empty-state">
                        <FiUsers size={48} color="#94a3b8" />
                        <p>No students found matching your search.</p>
                    </div>
                ) : (
                    <section className="global-status-section" style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: '#6366f1', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                                    <FiUsers size={24} color="white" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Student Completion Rates</h2>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                                        Total Students: {filteredStats.length} | Required Sessions: {totalRequiredCount}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="global-table-wrapper" style={{ overflowX: 'auto' }}>
                            <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <th style={{ padding: '0 16px 12px' }}>Student Info</th>
                                        <th style={{ padding: '0 16px 12px' }}>Completion Rate</th>
                                        <th style={{ padding: '0 16px 12px', textAlign: 'right' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedStats.map(student => {
                                        let statusColor = '#ef4444'; // Red
                                        let statusText = 'NO SHOW';
                                        let Icon = FiXCircle;
                                        let bg = 'rgba(239, 68, 68, 0.1)';

                                        if (student.isFullyComplete) {
                                            statusColor = '#10b981';
                                            statusText = 'COMPLETE';
                                            Icon = FiCheckCircle;
                                            bg = 'rgba(16, 185, 129, 0.1)';
                                        } else if (student.completedCount > 0) {
                                            statusColor = '#f59e0b';
                                            statusText = 'IN PROGRESS';
                                            Icon = FiClock;
                                            bg = 'rgba(245, 158, 11, 0.1)';
                                        }

                                        return (
                                            <tr key={student.userId || student.email} style={{ background: 'rgba(255, 255, 255, 0.03)', transition: 'background 0.2s' }}>
                                                <td style={{ padding: '16px', borderRadius: '12px 0 0 12px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <strong style={{ fontSize: '1rem', color: 'black' }}>{student.fullName}</strong>
                                                        <span style={{ fontSize: '0.85rem', color: 'black' }}>{student.email}</span>
                                                        {student.institution && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{student.institution} {student.class ? `- ${student.class}` : ''}</span>}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden', minWidth: '100px' }}>
                                                            <div style={{
                                                                width: `${(student.completedCount / totalRequiredCount) * 100 || 0}%`,
                                                                height: '100%',
                                                                background: statusColor,
                                                                transition: 'width 0.5s ease-out'
                                                            }}></div>
                                                        </div>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: '600', minWidth: '45px', textAlign: 'right' }}>
                                                            {student.completedCount} / {totalRequiredCount}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px', borderRadius: '0 12px 12px 0', textAlign: 'right' }}>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        background: bg,
                                                        color: statusColor,
                                                        padding: '6px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        <Icon size={14} /> {statusText}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls
                            currentPage={globalPage}
                            totalPages={totalGlobalPages}
                            onPageChange={handleGlobalPageChange}
                        />
                    </section>
                )}
            </main>
        </div>
    );
}