import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

export default function PresenceManagement({ onClose }) {
    const [attendances, setAttendances] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAttendances = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:3000/api/attendance');
            setAttendances(response.data);
        } catch (err) {
            console.error(err);
            setError("Impossible de charger les données depuis le serveur.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendances();
    }, []);

    const filteredAttendances = attendances.filter(item =>
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nameSession.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sessionId.toString().includes(searchTerm)
    );

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return (
        <div style={styles.overlay} onClick={onClose} className=''>
            <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2>Gestion de Présence (Admin) 📋</h2>
                    <button style={styles.closeButton} onClick={onClose}><CloseIcon /></button>
                </div>

                <div style={styles.filterContainer}>
                    <div style={styles.searchInputGroup}>
                        <input
                            type="text"
                            placeholder="Rechercher par Nom, Email ou Session ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                        <div style={styles.searchIcon}><SearchIcon /></div>
                    </div>
                </div>

                <div style={styles.dataContainer}>
                    {isLoading && <p style={{ textAlign: 'center' }}>Chargement des données...</p>}
                    {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
                    {!isLoading && !error && filteredAttendances.length === 0 &&
                        <p style={{ textAlign: 'center', color: '#666' }}>Aucune présence trouvée pour la recherche actuelle.</p>
                    }
                    {!isLoading && !error && filteredAttendances.length > 0 &&
                        <table style={styles.attendanceTable}>
                            <thead>
                                <tr>
                                    <th style={styles.tableHeaderStyle}>Nom </th>
                                    <th style={styles.tableHeaderStyle}>Email</th>
                                    {/* <th style={styles.tableHeaderStyle}>Session ID</th> */}
                                    <th style={styles.tableHeaderStyle}>Nom Session</th>
                                    <th style={styles.tableHeaderStyle}>Heure Scan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttendances.map(item => (
                                    <tr key={item._id}>
                                        <td style={styles.tableCellStyle}>{item.fullName}</td>
                                        <td style={styles.tableCellStyle}>{item.email}</td>
                                        {/* <td style={styles.tableCellStyle}>{item.sessionId}</td> */}
                                        <td style={styles.tableCellStyle}>{item.nameSession}</td>
                                        <td style={styles.tableCellStyle}>{formatTime(item.scanTime)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    }
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: { 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.7)', // Fond plus foncé
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 1000 
    },
    modalContainer: { 
        backgroundColor: '#ffffff', // Conteneur clair
        borderRadius: '12px', // Bords plus arrondis
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)', // Ombre plus marquée
        padding: '30px', // Plus de padding
        width: '95%', 
        maxWidth: '1000px', // Taille max légèrement augmentée
        maxHeight: '90vh', 
        display: 'flex', 
        flexDirection: 'column' 
    },
    modalHeader: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid #ddd', 
        paddingBottom: '15px', 
        marginBottom: '20px' // Plus d'espace après le header
    },
    closeButton: { 
        background: '#000000ff', // Rouge/Noir pour la fermeture
        color: '#fff', 
        border: 'none', 
        borderRadius: '50%', 
        width: '32px', 
        height: '32px', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        transition: 'background 0.3s'
        // Idéalement, ajouter un hover: '&:hover': { background: '#c82333' }
    },
    filterContainer: { 
        margin: '10px 0 25px 0', 
        display: 'flex', 
        gap: '10px' 
    },
    searchInputGroup: { 
        flexGrow: 1, 
        position: 'relative' 
    },
    searchInput: { 
        width: '100%', 
        padding: '12px 12px 12px 40px', // Plus grand et espace pour icône
        borderRadius: '25px', // Forme de pilule
        border: '1px solid #ccc', 
        boxSizing: 'border-box',
        fontSize: '1rem'
    },
    searchIcon: { 
        position: 'absolute', 
        left: '12px', 
        top: '50%', 
        transform: 'translateY(-50%)', 
        pointerEvents: 'none',
        color: '#6c757d'
    },
    dataContainer: { 
        overflowY: 'auto', 
        flexGrow: 1,
        border: '1px solid #eee', // Cadre autour des données
        borderRadius: '8px'
    },
    attendanceTable: { 
        width: '100%', 
        borderCollapse: 'separate', // Pour mieux séparer les lignes
        borderSpacing: '0 5px'
    },
    tableHeaderStyle: { 
        padding: '15px', 
        borderBottom: '2px solid #007bff', // Ligne d'en-tête bleue
        backgroundColor: '#f8f9fa', // Fond légèrement grisé
        textAlign: 'left', 
        fontWeight: '700', 
        color: '#343a40',
        position: 'sticky', 
        top: 0, 
        zIndex: 1 
    },
    tableCellStyle: { 
        padding: '12px 15px', 
        textAlign: 'left', 
        fontSize: '0.95rem',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f1f1f1' // Séparateur de ligne plus fin
        // Idéalement, ajouter un hover pour surligner
    }
};