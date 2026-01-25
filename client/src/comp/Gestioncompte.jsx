import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiUsers, FiShield, FiUser, FiTrash2, FiClock } from "react-icons/fi";
import API_BASE_URL_GLOBAL from '../config';

const ITEMS_PER_PAGE = 10;
const API_BASE_URL = `${API_BASE_URL_GLOBAL}/admin/users`;

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

export default function UserManagement() {
    const [allUsers, setAllUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const isUserLoggedIn = localStorage.getItem('login') === 'true';

    useEffect(() => {
        if (!isUserLoggedIn) {
            navigate('/');
        } else {
            fetchUsers();
        }
    }, [isUserLoggedIn]);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setAllUsers(response.data);
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || "Error fetching users.");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return allUsers;
        const lowerCaseQuery = searchQuery.toLowerCase();
        return allUsers.filter(user =>
            (user.fullName && user.fullName.toLowerCase().includes(lowerCaseQuery)) ||
            (user.email && user.email.toLowerCase().includes(lowerCaseQuery))
        );
    }, [allUsers, searchQuery]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const toggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'student' ? 'admin' : 'student';
        if (!window.confirm(`Are you sure you want to change the role to "${newRole}"?`)) return;

        try {
            await axios.put(`${API_BASE_URL}/${userId}/role`, { role: newRole }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error changing role.');
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user permanently? This action cannot be undone.")) return;

        try {
            await axios.delete(`${API_BASE_URL}/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAllUsers(prev => prev.filter(u => u._id !== userId));
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error deleting user.');
        }
    };

    const totalAdmins = allUsers.filter(u => u.role === 'admin').length;
    const totalStudents = allUsers.filter(u => u.role === 'student').length;

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return "??";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    // Helper for date formatting
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="dashboard-page" style={{ background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
            {/* Background Decorative Element */}
            <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>

            <header className="dashboard-header" style={{ borderBottom: '1px solid #e2e8f0', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}>
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/')} title="Return to Home">
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ letterSpacing: '-0.02em' }}>User Repository</h1>
                        <p style={{ fontWeight: '500' }}>Directory of all platform members and access controls</p>
                    </div>
                </div>

                <div className="header-search">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Filter by name or email..."
                        style={{ border: '1px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s' }}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </header>

            <main className="dashboard-content" style={{ position: 'relative', zIndex: 1 }}>
                {/* --- Quick Stats Overview --- */}
                <div className="stats-row" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px',
                    marginBottom: '40px'
                }}>
                    <div style={{ background: 'white', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ background: '#0f172a', color: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 8px 16px rgba(15, 23, 42, 0.2)' }}>
                            <FiUsers size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Members</div>
                            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>{allUsers.length}</div>
                        </div>
                    </div>
                    <div style={{ background: 'white', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ background: '#10b981', color: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)' }}>
                            <FiShield size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Administrators</div>
                            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>{totalAdmins}</div>
                        </div>
                    </div>
                    <div style={{ background: 'white', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ background: '#64748b', color: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 8px 16px rgba(100, 116, 139, 0.2)' }}>
                            <FiUser size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Standard Users</div>
                            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>{totalStudents}</div>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p style={{ fontWeight: '500' }}>Synchronizing user database...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <FiXCircle size={48} color="#ef4444" />
                        <p>{error}</p>
                        <button onClick={fetchUsers} style={{ padding: '8px 24px', borderRadius: '8px' }}>Retry</button>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ background: '#f1f5f9', padding: '24px', borderRadius: '50%', marginBottom: '16px' }}>
                            <FiSearch size={48} color="#94a3b8" />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>No matching records</h3>
                        <p style={{ margin: 0, color: '#64748b' }}>We couldn't find any user with that criteria.</p>
                    </div>
                ) : (
                    <div className="session-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '20px' }}>
                        <div className="session-table-wrapper" style={{ margin: 0 }}>
                            <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                <thead>
                                    <tr style={{ background: '#fcfdfe', borderBottom: '1px solid #e2e8f0' }}>
                                        <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Details</th>
                                        <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Authority Level</th>
                                        <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Since</th>
                                        <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedUsers.map(user => (
                                        <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{
                                                        width: '42px',
                                                        height: '42px',
                                                        borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#475569',
                                                        fontWeight: '700',
                                                        fontSize: '0.9rem',
                                                        border: '1px solid #e2e8f0'
                                                    }}>
                                                        {getInitials(user.fullName)}
                                                    </div>
                                                    <div>
                                                        <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0f172a', fontWeight: '600' }}>{user.fullName}</strong>
                                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                {user.role === 'admin' ? (
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        background: '#ecfdf5',
                                                        color: '#059669',
                                                        padding: '4px 12px',
                                                        borderRadius: '30px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: '800',
                                                        border: '1px solid rgba(16, 185, 129, 0.2)',
                                                        letterSpacing: '0.03em'
                                                    }}>
                                                        <FiShield size={12} /> ADMINISTRATOR
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        background: '#f8fafc',
                                                        color: '#64748b',
                                                        padding: '4px 12px',
                                                        borderRadius: '30px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: '800',
                                                        border: '1px solid #e2e8f0',
                                                        letterSpacing: '0.03em'
                                                    }}>
                                                        <FiUser size={12} /> STANDARD USER
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <FiClock size={14} style={{ color: '#94a3b8' }} />
                                                    {formatDate(user.createdAt)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => toggleRole(user._id, user.role)}
                                                        style={{
                                                            padding: '7px 16px',
                                                            borderRadius: '10px',
                                                            border: '1px solid #e2e8f0',
                                                            background: user.role === 'admin' ? '#ffffff' : '#0f172a',
                                                            color: user.role === 'admin' ? '#0f172a' : '#ffffff',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {user.role === 'admin' ? 'Revoke Admin' : 'Grant Admin'}
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(user._id)}
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '10px',
                                                            border: '1px solid #fee2e2',
                                                            background: 'transparent',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                        title="Remove User"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ background: '#fcfdfe', padding: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}