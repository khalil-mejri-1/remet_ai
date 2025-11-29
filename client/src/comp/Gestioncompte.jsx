import React, { useState, useEffect, useMemo } from 'react'; // 👈 استيراد useMemo
import axios from 'axios';
import { FaUserShield, FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:3000/admin/users';

const Gestion_compte = ({ onClose }) => {
    // سنستخدم 'allUsers' لتخزين القائمة الكاملة التي تم جلبها من الـ API
    const [allUsers, setAllUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const token = localStorage.getItem('token');
    const isUserLoggedIn = localStorage.getItem('login') === 'true';

    useEffect(() => {
        if (!isUserLoggedIn) {
            alert("Accès refusé. Veuillez vous connecter.");
            onClose();
        } else {
            // جلب المستخدمين بدون استعلام بحث في البداية
            fetchUsers();
        }
    }, [isUserLoggedIn]);

    const fetchUsers = async () => { // 👈 تم إزالة معلمة 'query' لنجلب الجميع أولاً
        setIsLoading(true);
        try {
            // سنفترض أن جلب بدون 'params' يجلب الجميع
            const response = await axios.get(`${API_BASE_URL}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            // تخزين جميع المستخدمين في 'allUsers'
            setAllUsers(response.data); 
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Erreur lors de la récupération des utilisateurs.");
        } finally {
            setIsLoading(false);
        }
    };

    // 🌟 وظيفة التصفية المحلية باستخدام useMemo 🌟
    // سيتم إعادة حساب 'filteredUsers' فقط عند تغير 'allUsers' أو 'searchQuery'
    const filteredUsers = useMemo(() => {
        if (!searchQuery) {
            return allUsers; // إذا كان حقل البحث فارغاً، نعرض الجميع
        }

        const lowerCaseQuery = searchQuery.toLowerCase();

        return allUsers.filter(user => {
            // البحث حسب الاسم أو البريد الإلكتروني
            const nameMatch = user.fullName && user.fullName.toLowerCase().includes(lowerCaseQuery);
            const emailMatch = user.email && user.email.toLowerCase().includes(lowerCaseQuery);
            
            return nameMatch || emailMatch;
        });
    }, [allUsers, searchQuery]); // التبعيات: البيانات الأصلية واستعلام البحث

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // بما أننا نستخدم التصفية المحلية، يكفي أن يقوم 'searchQuery' بتحديث نفسه
        // و'useMemo' سيعيد حساب 'filteredUsers'.
        // لا نحتاج لـ 'fetchUsers(searchQuery)' مجدداً إلا إذا كنت تريد البحث عبر الـ API.
        
        // إذا كنت تصر على استخدام الـ API للبحث في كل نقرة:
        // fetchUsers(searchQuery); 
        
        // **سنعتمد على التصفية المحلية حالياً**، لذا لا يوجد كود هنا.
    };

    const toggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'student' ? 'admin' : 'student';
        if (!window.confirm(`Voulez-vous vraiment changer le rôle vers "${newRole}" ?`)) return;

        try {
            const response = await axios.put(`${API_BASE_URL}/${userId}/role`, { role: newRole }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // تحديث حالة 'allUsers' بعد تغيير الدور
            setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            
            alert(response.data.message || 'Rôle modifié avec succès !');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Erreur lors de la modification du rôle.');
        }
    };
    
    // ... (بقية الـ styles تبقى كما هي)
    const styles = {
        overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
        modal: { backgroundColor: '#fff', borderRadius: '10px', padding: '30px', width: '90%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  closeButton: { 
        background: '#000000ff', // Rouge/Noir pour la fermeture
        color: '#fff', 
        border: 'none', 
        borderRadius: '50%', 
        width: '32px', 
        position:"absolute",
        height: '32px', 
        right:"30px",
        top:"10px",
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        transition: 'background 0.3s'
        // Idéalement, ajouter un hover: '&:hover': { background: '#c82333' }
    },        header: { borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' },
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

                {/* النموذج لم يعد يحتاج لـ 'onSubmit' لأنه سيحدث التصفية في كل تغيير */}
                <form style={styles.searchForm}> 
                    <input 
                        type="text" 
                        placeholder="Rechercher par Nom ou Email..." 
                        value={searchQuery} 
                        // التصفية تحدث في كل تغيير للكتابة
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        style={styles.searchInput} 
                    />
                    {/* زر البحث يمكن أن يكون مجرد زر تحديث في حال قمنا بتعطيل التصفية التلقائية */}
                    <button type="submit" style={styles.searchButton} onClick={(e) => { e.preventDefault(); /* لا يوجد إجراء هنا */ }} disabled={isLoading}>
                         <FaSearch /> Rechercher
                    </button>
                </form>

                {isLoading && <div style={styles.loadingMessage}><FaSpinner className="fa-spin" /> Chargement...</div>}

                {/* 🌟 عرض 'filteredUsers' بدلاً من 'users' 🌟 */}
                {!isLoading && filteredUsers.length === 0 && <div style={styles.loadingMessage}>Aucun utilisateur trouvé.</div>}

                {!isLoading && filteredUsers.length > 0 && (
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
                            {/* 🌟 استخدام 'filteredUsers' هنا 🌟 */}
                            {filteredUsers.map(user => (
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