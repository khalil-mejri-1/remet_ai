import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserShield, FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';

const API_BASE_URL = 'https://remet-ai-sbf9.vercel.app/admin/users'; 

const Gestion_compte = ({ onClose }) => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const token = localStorage.getItem('token');
    const isUserLoggedIn = localStorage.getItem('login') === 'true';

    useEffect(() => {
        if (!isUserLoggedIn) {
            alert("Accès refusé. Veuillez vous connecter.");
            onClose();
        } else {
            fetchUsers(); // fetch all users on load
        }
    }, [isUserLoggedIn]);

    const fetchUsers = async (query = '') => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: query ? { search: query } : {}
            });
            setUsers(response.data);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Erreur lors de la récupération des utilisateurs.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchUsers(searchQuery);
    };

    const toggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'student' ? 'admin' : 'student';
        if (!window.confirm(`Voulez-vous vraiment changer le rôle vers "${newRole}" ?`)) return;

        try {
            const response = await axios.put(`${API_BASE_URL}/${userId}/role`, { role: newRole }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            alert(response.data.message || 'Rôle modifié avec succès !');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Erreur lors de la modification du rôle.');
        }
    };

    const styles = {
        overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
        modal: { backgroundColor: '#fff', borderRadius: '10px', padding: '30px', width: '90%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
        closeButton: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' },
        header: { borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' },
        searchForm: { display: 'flex', gap: '10px', marginBottom: '20px' },
        searchInput: { flexGrow: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
        searchButton: { padding: '10px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#0f172a', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
        table: { width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontFamily: 'Arial, sans-serif' },
        th: { backgroundColor: '#0f172a', color: 'white', padding: '12px', textAlign: 'left' },
        td: { borderBottom: '1px solid #eee', padding: '12px' },
        roleBadge: { padding: '5px 10px', borderRadius: '15px', color: 'white', fontWeight: 'bold', fontSize: '0.9em' },
        adminBadge: { backgroundColor: '#28a745' },
        studentBadge: { backgroundColor: '#6c757d' },
        actionButton: { padding: '6px 12px', borderRadius: '5px', border: 'none', cursor: 'pointer', transition: '0.3s', color: 'white' },
        promoteButton: { backgroundColor: '#007bff' },
        demoteButton: { backgroundColor: '#dc3545' },
        loadingMessage: { textAlign: 'center', padding: '30px', fontSize: '1.2em', color: '#555' }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button style={styles.closeButton} onClick={onClose}><FaTimes /></button>

                <div style={styles.header}>
                    <FaUserShield />
                    <h2>Administration des Comptes</h2>
                </div>

                <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
                    <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput} />
                    <button type="submit" style={styles.searchButton} disabled={isLoading}>
                        {isLoading ? <FaSpinner className="fa-spin" /> : <FaSearch />} Rechercher
                    </button>
                </form>

                {isLoading && <div style={styles.loadingMessage}>Chargement...</div>}

                {!isLoading && users.length === 0 && <div style={styles.loadingMessage}>Aucun utilisateur trouvé.</div>}

                {!isLoading && users.length > 0 && (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Nom</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Role</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td style={styles.td}>{user.fullName}</td>
                                    <td style={styles.td}>{user.email}</td>
                                    <td style={styles.td}>
                                        <span style={{ ...styles.roleBadge, ...(user.role === 'admin' ? styles.adminBadge : styles.studentBadge) }}>
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <button 
                                            style={{ ...styles.actionButton, ...(user.role === 'admin' ? styles.demoteButton : styles.promoteButton) }}
                                            onClick={() => toggleRole(user._id, user.role)}
                                        >
                                            {user.role === 'admin' ? 'Rétrograder' : 'Promouvoir'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Gestion_compte;
