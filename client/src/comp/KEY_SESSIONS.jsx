import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- ICONS SVG & COMPOSANTS D'ICONES ---
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
    <path d="M4.93 19.07a10 10 0 0 1 14.14 0" />
    <path d="M16.24 7.76a6 6 0 1 0-8.49 0" />
  </svg>
);
const LearnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10v6" />
    <path d="M2 10l10-5 10 5-10 5z" />
    <path d="M12 12v9" />
  </svg>
);

const getIcon = (type) => type === 'learn' ? <LearnIcon /> : <BrainIcon />;

// --- URL API ---
const API_URL = "http://localhost:3000/api/KeySession";
// نقطة نهاية للتحقق من الدور
const USER_ROLE_CHECK_URL = "http://localhost:3000/api/user/role";


// ===== KeySession Card Component (مكون فرعي للمنطق) =====
const KeySessionCard = ({ session, onUpdate, onDelete, isAdmin }) => {
  return (
    <div key={session._id} className="ks-card">
      <div className="ks-card-bg"></div>
      <div className="ks-content">
        <div className="ks-icon-box">{session.icon}</div>
        <h3 className="ks-session-title">{session.title}</h3>
        <div className="ks-divider"></div>
        <div className="ks-speaker-info">
          <div className="ks-img-wrapper">
            {session.image ? <img src={session.image} alt={session.speaker} className="ks-speaker-img" /> : <div className="ks-img-placeholder"></div>}
            <div className="ks-online-dot"></div>
          </div>
          <div className="ks-speaker-text">
            <span className="ks-role">{session.role}</span>
            <h4 className="ks-name">{session.speaker}</h4>
          </div>
        </div>

        {/* عرض الأزرار فقط إذا كان isAdmin صحيحًا */}
        {isAdmin && (
          <div className="ks-card-actions">
            <button className="ks-action-btn update" onClick={() => onUpdate(session)}><EditIcon /> Update</button>
            <button className="ks-action-btn delete" onClick={() => onDelete(session._id)}><TrashIcon /> Delete</button>
          </div>
        )}
      </div>
    </div>
  );
};


const KeySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  // حالة جديدة لتخزين ما إذا كان المستخدم مسؤولاً (admin)
  const [isAdmin, setIsAdmin] = useState(false);


  // --- FETCH SESSIONS FROM API ---
  const fetchSessions = async () => {
    try {
      const res = await axios.get(API_URL);
      const mappedSessions = res.data.map(sess => ({
        ...sess,
        icon: sess.iconType === 'learn' ? <LearnIcon /> : <BrainIcon />
      }));
      setSessions(mappedSessions);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  // --- CHECK USER ROLE ---
  const checkUserRole = async () => {
    // 1. قراءة البريد الإلكتروني من localStorage
    const userEmail = localStorage.getItem("userEmail");

    if (userEmail) {
      try {
        // 2. إرسال البريد الإلكتروني كـ Path Parameter
        const res = await axios.get(`${USER_ROLE_CHECK_URL}/${userEmail}`);

        // 3. التحقق من الدور
        if (res.data && res.data.role === "admin") {
          setIsAdmin(true); // تعيين isAdmin إلى true إذا كان الدور admin
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error checking user role:", err);
        setIsAdmin(false); // الافتراض هو عدم الإدارة في حالة وجود خطأ
      }
    } else {
      setIsAdmin(false);
    }
  };


  useEffect(() => {
    fetchSessions();
    checkUserRole(); // التحقق من الدور عند التحميل
  }, []);

  // --- HANDLERS ---
  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert("Vous n'êtes pas autorisé à effectuer cette action.");
      return;
    }
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette session ?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setSessions(sessions.filter(s => s._id !== id));
      } catch (err) { console.error(err); }
    }
  };

  const handleAddClick = () => {
    if (!isAdmin) return; // منع الإضافة إذا لم يكن مسؤولاً
    setCurrentSession({
      title: '',
      speaker: '',
      role: '',
      image: '',
      iconType: 'brain'
    });
    setIsModalOpen(true);
  };

  const handleUpdateClick = (session) => {
    if (!isAdmin) return; // منع التحديث إذا لم يكن مسؤولاً
    setCurrentSession({ ...session });
    setIsModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setCurrentSession(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; // منع الحفظ إذا لم يكن مسؤولاً

    try {
      if (currentSession._id) {
        // UPDATE
        const res = await axios.put(`${API_URL}/${currentSession._id}`, currentSession);
        setSessions(sessions.map(s => s._id === res.data._id ? { ...res.data, icon: res.data.iconType === 'learn' ? <LearnIcon /> : <BrainIcon /> } : s));
      } else {
        // CREATE
        const res = await axios.post(API_URL, currentSession);
        setSessions([...sessions, { ...res.data, icon: res.data.iconType === 'learn' ? <LearnIcon /> : <BrainIcon /> }]);
      }
      setIsModalOpen(false);
      setCurrentSession(null);
    } catch (err) {
      console.error("Error saving session:", err);
    }
  };

  return (
    <section className="ks-section">
      <div className="ks-container">
        <div className="ks-header">
          <span className="ks-badge">Highlights</span>
          <h2 className="ks-title">Key Sessions</h2>
          <div className="ks-line"></div>
          {/* عرض زر الإضافة فقط إذا كان isAdmin صحيحًا */}
          {isAdmin && (
            <button className="ks-add-btn" onClick={handleAddClick}><PlusIcon /> Add Key Session</button>
          )}
        </div>

        <div className="ks-grid">
          {sessions.map(session => (
            <KeySessionCard
              key={session._id}
              session={session}
              onUpdate={handleUpdateClick}
              onDelete={handleDelete}
              isAdmin={isAdmin} // تمرير حالة isAdmin
            />
          ))}
        </div>
      </div>

      {/* فتح المودال فقط إذا كان isAdmin صحيحًا */}
      {isModalOpen && currentSession && isAdmin && (
        <div className="ks-modal-overlay">
          <div className="ks-modal-content">
            <div className="ks-modal-header">
              <h3>{currentSession._id ? 'Edit Session' : 'Nouvelle Session'}</h3>
              <button className="ks-close-btn" onClick={() => setIsModalOpen(false)}><XIcon /></button>
            </div>
            <form onSubmit={handleSave} className="ks-modal-form">
              <div className="ks-form-group">
                <label>Session Title</label>
                <textarea name="title" value={currentSession.title} onChange={handleModalChange} required rows="3" />
              </div>
              <div className="ks-form-group">
                <label>Speaker Name</label>
                <input type="text" name="speaker" value={currentSession.speaker} onChange={handleModalChange} required />
              </div>
              <div className="ks-form-group">
                <label>Role (e.g., Keynote Speaker)</label>
                <input type="text" name="role" value={currentSession.role} onChange={handleModalChange} required />
              </div>
              <div className="ks-form-group">
                <label>Speaker Image URL</label>
                <input type="text" name="image" value={currentSession.image} onChange={handleModalChange} placeholder="https://..." />
              </div>
              <div className="ks-form-group">
                <label>Icon Type</label>
                <select name="iconType" value={currentSession.iconType} onChange={handleModalChange}>
                  <option value="brain">Brain</option>
                  <option value="learn">Learn</option>
                </select>
              </div>
              <div className="ks-modal-actions">
                <button type="button" className="ks-cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="ks-save-btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        /* Header ajustement pour centrer le bouton */
        .ks-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin-bottom: 50px;
        }

        /* Bouton Add Key Session */
        .ks-add-btn {
            margin-top: 20px;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 25px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
            transition: transform 0.2s;
        }
        .ks-add-btn:hover { transform: scale(1.05); }

        /* Ajustement de la carte pour placer les boutons en bas */
        .ks-content {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        /* Cette marge auto pousse les actions en bas */
        .ks-speaker-info {
             margin-bottom: 20px; 
        }

        /* Container boutons actions */
        .ks-card-actions {
            margin-top: auto;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.1);
            display: flex;
            gap: 10px;
        
        }

        .ks-action-btn {
            flex: 1;
            padding: 8px;
            border-radius: 8px;
            border: 1px solid transparent;
            cursor: pointer;
            font-size: 0.85rem;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 6px;
            background: rgba(255,255,255,0.05);
 
            transition: all 0.2s;
        }
        .ks-action-btn.update:hover { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; }
        .ks-action-btn.delete:hover { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }

        /* Styles Modal (Cohérent avec les précédents) */
        .ks-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(4px);
            z-index: 9999; display: flex; justify-content: center; align-items: center;
        }
        .ks-modal-content {
            background: #1f1f2e; border: 1px solid rgba(255,255,255,0.1);
            width: 90%; max-width: 450px; padding: 25px; border-radius: 16px;
            color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.6);
        }
        .ks-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .ks-close-btn { background: none; border: none; color: #aaa; cursor: pointer; }
        .ks-close-btn:hover { color: white; }
        
        .ks-form-group { margin-bottom: 15px; text-align: left; }
        .ks-form-group label { display: block; margin-bottom: 6px; color: #ffffffff; font-size: 0.9rem; }
        .ks-form-group input, .ks-form-group textarea {
            width: 100%; padding: 10px; background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
            color: white; outline: none; font-family: inherit;
        }
        
        .ks-modal-actions { display: flex; gap: 10px; margin-top: 25px; }
        .ks-save-btn { flex: 1; background: #6366f1; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .ks-cancel-btn { flex: 1; background: transparent; border: 1px solid #555; color: #ffffffff; padding: 10px; border-radius: 8px; cursor: pointer; }

        /* Petit placeholder si pas d'image */
        .ks-img-placeholder { width: 50px; height: 50px; background: #333; border-radius: 50%; }
      `}</style>
    </section>
  );
};

export default KeySessions;