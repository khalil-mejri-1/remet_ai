import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiUsers, FiMail, FiPhone, FiHome, FiBook, FiClock, FiXCircle } from "react-icons/fi";
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
                    background: currentPage === 1 ? 'rgba(0,0,0,0.05)' : '#6366f1',
                    color: currentPage === 1 ? '#94a3b8' : 'white',
                    border: 'none',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                }}
            >
                Previous
            </button>
            <span style={{ color: '#64748b', fontWeight: '600' }}>
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: currentPage === totalPages ? 'rgba(0,0,0,0.05)' : '#6366f1',
                    color: currentPage === totalPages ? '#94a3b8' : 'white',
                    border: 'none',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                }}
            >
                Next
            </button>
        </div>
    );
};

export default function WorkshopRegistrations() {
    const [registrations, setRegistrations] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const isUserLoggedIn = localStorage.getItem('login') === 'true';

    const fetchRegistrations = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // The backend endpoint /api/registrations returns all registrations.
            // We'll fetch all and do frontend pagination for a smoother search experience if local,
            // but the backend does support server-side pagination.
            // Let's use server-side pagination as requested (many people).
            const response = await axios.get(`${API_BASE_URL}/api/registrations`, {
                params: {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE
                },
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Checking if the response structure matches expectations
            if (response.data.data) {
                setRegistrations(response.data.data);
                setTotalRecords(response.data.totalRecords);
            } else {
                // Fallback if the structure is different
                setRegistrations(response.data);
                setTotalRecords(response.data.length);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load workshop registrations.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isUserLoggedIn) {
            navigate('/');
        } else {
            fetchRegistrations();
        }
    }, [isUserLoggedIn, currentPage]);

    const filteredRegistrations = useMemo(() => {
        if (!searchTerm) return registrations;
        const lowerQuery = searchTerm.toLowerCase();
        return registrations.filter(reg =>
            reg.fullName?.toLowerCase().includes(lowerQuery) ||
            reg.email?.toLowerCase().includes(lowerQuery) ||
            reg.institution?.toLowerCase().includes(lowerQuery) ||
            reg.phone?.includes(searchTerm)
        );
    }, [registrations, searchTerm]);

    const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

    const getInitials = (name) => {
        if (!name) return "??";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="dashboard-page" style={{ background: '#f8fafc', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            {/* Glassmorphism background elements */}
            <div style={{
                position: 'fixed',
                top: '10%',
                right: '5%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>
            <div style={{
                position: 'fixed',
                bottom: '10%',
                left: '5%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>

            <header className="dashboard-header" style={{ borderBottom: '1px solid #e2e8f0', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', sticky: 'top', zIndex: 10 }}>
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/')} title="Return to Home">
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ letterSpacing: '-0.02em', color: '#0f172a' }}>Workshop Registrations</h1>
                        <p style={{ fontWeight: '500', color: '#64748b' }}>Manage and view all registered participants</p>
                    </div>
                </div>

                <div className="header-search">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or institution..."
                        style={{ border: '1px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s' }}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            // If we're searching, we might want to reset page, but backend pagination makes this tricky without true backend search.
                            // For now, we'll search the current page's results.
                        }}
                    />
                </div>
            </header>

            <main className="dashboard-content" style={{ position: 'relative', zIndex: 1, padding: '2rem' }}>
                {/* --- Quick Stats Overview --- */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'white',
                        padding: '6px 14px',
                        borderRadius: '100px',
                        border: '1px solid #eef2f6',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{
                            background: '#f5f7ff',
                            color: '#6366f1',
                            padding: '5px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FiUsers size={12} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Total Registred:</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>{totalRecords}</span>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading-state" style={{ padding: '4rem 0' }}>
                        <div className="spinner"></div>
                        <p style={{ fontWeight: '600', color: '#64748b', marginTop: '1rem' }}>Loading participants data...</p>
                    </div>
                ) : error ? (
                    <div className="error-state" style={{ padding: '4rem 0', textAlign: 'center' }}>
                        <FiXCircle size={64} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Connection Error</h3>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error}</p>
                        <button onClick={fetchRegistrations} style={{ background: '#6366f1', color: 'white', padding: '10px 30px', borderRadius: '12px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Retry Now</button>
                    </div>
                ) : filteredRegistrations.length === 0 ? (
                    <div className="empty-state" style={{ padding: '5rem 0', textAlign: 'center' }}>
                        <div style={{ background: '#f1f5f9', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <FiSearch size={48} color="#94a3b8" />
                        </div>
                        <h3 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>No registrants found</h3>
                        <p style={{ color: '#64748b' }}>We couldn't find any participants matching your search.</p>
                    </div>
                ) : (
                    <div className="session-card" style={{
                        padding: '0',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        borderRadius: '24px',
                        background: 'white',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.03)'
                    }}>
                        <div className="session-table-wrapper" style={{ margin: 0, overflowX: 'auto' }}>
                            <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                <thead>
                                    <tr style={{ background: '#fcfdfe' }}>
                                        <th style={{ padding: '1.5rem', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Participant</th>
                                        <th style={{ padding: '1.5rem', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contact Info</th>
                                        <th style={{ padding: '1.5rem', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Institutional Details</th>
                                        <th style={{ padding: '1.5rem', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Registration Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRegistrations.map((reg, index) => (
                                        <tr key={reg._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        borderRadius: '16px',
                                                        background: index % 2 === 0 ? 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)' : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: index % 2 === 0 ? '#4338ca' : '#047857',
                                                        fontWeight: '800',
                                                        fontSize: '1rem',
                                                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                                                    }}>
                                                        {getInitials(reg.fullName)}
                                                    </div>
                                                    <div>
                                                        <strong style={{ display: 'block', fontSize: '1rem', color: '#0f172a', fontWeight: '700' }}>{reg.fullName}</strong>
                                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                            {reg.userId && <><FiUsers size={12} /> ID: {reg.userId.substring(0, 8)}</>}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem' }}>
                                                        <FiMail size={14} style={{ color: '#6366f1' }} />
                                                        <span>{reg.email}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem' }}>
                                                        <FiPhone size={14} style={{ color: '#10b981' }} />
                                                        <span>{reg.phone || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: '600' }}>
                                                        <FiHome size={14} style={{ color: '#f59e0b' }} />
                                                        <span>{reg.institution}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                                                        <FiBook size={14} />
                                                        <span>Level: {reg.class || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '10px', width: 'fit-content' }}>
                                                    <FiClock size={14} style={{ color: '#94a3b8' }} />
                                                    {formatDate(reg.createdAt)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ background: '#fcfdfe', padding: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    </div>
                )}
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .dashboard-page { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
                .dashboard-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 2rem; }
                .header-left { display: flex; align-items: center; gap: 1.5rem; }
                .back-btn { background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 12px; display: flex; alignItems: center; justify-content: center; cursor: pointer; transition: all 0.2s; color: #475569; }
                .back-btn:hover { background: #e2e8f0; color: #0f172a; transform: translateX(-2px); }
                .header-search { position: relative; width: 350px; }
                .header-search input { width: 100%; padding: 12px 12px 12px 45px; border: 1px solid #e2e8f0; outline: none; font-size: 0.9rem; }
                .header-search input:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
                .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                .dashboard-table tbody tr:hover { background: #f8fafc !important; }
                .spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top: 4px solid #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}
