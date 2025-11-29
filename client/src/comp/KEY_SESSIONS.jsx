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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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

// --- COMPOSANT DE CHARGEMENT SQUELETTE ---
const LoadingPlaceholder = ({ count = 3 }) => {
  // Skeleton Card
  const SkeletonCard = () => (
    <div className="ks-card ks-skeleton">
      <div className="ks-card-bg ks-skeleton-animate"></div>
      <div className="ks-content">
        <div className="ks-icon-box ks-skeleton-line" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
        <div className="ks-skeleton-line" style={{ height: '24px', width: '80%', margin: '10px 0' }}></div>
        <div className="ks-divider"></div>
        <div className="ks-speaker-info">
          <div className="ks-img-wrapper">
            <div className="ks-skeleton-line" style={{ width: '50px', height: '50px', borderRadius: '50%' }}></div>
          </div>
          <div className="ks-speaker-text">
            <div className="ks-skeleton-line" style={{ height: '16px', width: '60%' }}></div>
            <div className="ks-skeleton-line" style={{ height: '20px', width: '90%', marginTop: '5px' }}></div>
          </div>
        </div>
        {/* Placeholder for admin buttons if the admin check is quick */}
        <div className="ks-card-actions">
          <div className="ks-action-btn ks-skeleton-line" style={{ height: '36px', width: '50%' }}></div>
          <div className="ks-action-btn ks-skeleton-line" style={{ height: '36px', width: '50%' }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ks-grid">
      {Array(count).fill(0).map((_, index) => <SkeletonCard key={index} />)}
    </div>
  );
};


// --- URL API ---
const API_URL = 'https://remet-ai-sbf9.vercel.app/api';

const KeySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); // <-- NOUVEL ÉTAT DE CHARGEMENT

  // Helper function to dynamically return the correct icon component
  const getIconComponent = (type) => type === 'learn' ? <LearnIcon /> : <BrainIcon />;


  /**
   * Checks the user's role by email stored in localStorage.
   */
  const checkUserRole = async () => {
    // 1. استرجاع البريد الإلكتروني من localStorage
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
      setUserRole('student'); // Default role if no login
      return;
    }

    try {
      // 2. إرسال طلب إلى الخادم للبحث عن المستخدم
      // The endpoint should be '/user/role/:email' on the Node/Express server
      const res = await fetch(`${API_URL}/user/role/${userEmail}`);

      if (res.ok) {
        const data = await res.json();
        // 3. تخزين الدور المسترجع (admin أو student)
        setUserRole(data.role);
      } else {
        console.error("Erreur lors de la récupération du rôle", res.status);
        setUserRole('student'); // Safety fallback
      }
    } catch (error) {
      console.error("Erreur réseau pour le rôle:", error);
      setUserRole('student');
    }
  };

  // --- FETCH SESSIONS FROM API ---
  const fetchSessions = async () => {
    setLoading(true); // Début du chargement
    await checkUserRole();

    try {
      // Assuming the root API URL returns all sessions
      const res = await axios.get("https://remet-ai-sbf9.vercel.app/api/KeySession");
      const mappedSessions = res.data.map(sess => ({
        ...sess,
        // Ensure icon is correctly set based on iconType
        icon: getIconComponent(sess.iconType)
      }));
      setSessions(mappedSessions);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false); // Fin du chargement
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // --- HANDLERS ---
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette session ?")) {
      try {
        // Corrected endpoint path: it seems the API endpoint for DELETE is /KeySession/:id
        await axios.delete(`${API_URL}/KeySession/${id}`);
        setSessions(sessions.filter(s => s._id !== id));
      } catch (err) { console.error("Error deleting session:", err); }
    }
  };

  const handleAddClick = () => {
    setCurrentSession({
      title: '',
      speaker: '',
      role: '',
      image: '',
      iconType: 'brain' // Default icon type
    });
    setIsModalOpen(true);
  };

  const handleUpdateClick = (session) => {
    // Ensure we capture all necessary fields for the form, especially iconType
    setCurrentSession({
      ...session,
      iconType: session.iconType || 'brain' // Set default if somehow missing
    });
    setIsModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setCurrentSession(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentSession._id) {
        // UPDATE
        const res = await axios.put(`${API_URL}/KeySession/${currentSession._id}`, currentSession);

        // Update the sessions array with the modified item
        setSessions(sessions.map(s =>
          s._id === res.data._id
            ? { ...res.data, icon: getIconComponent(res.data.iconType) }
            : s
        ));
      } else {
        // CREATE
        // NOTE: Endpoint for POST should be just /KeySession if API_URL is root.
        // Assuming API_URL is 'https://remet-ai-sbf9.vercel.app/api', then the endpoint should be `${API_URL}/KeySession`
        // Corrected POST endpoint:
        const res = await axios.post(`${API_URL}/KeySession`, currentSession);

        // Add the new session to the array
        setSessions([...sessions, { ...res.data, icon: getIconComponent(res.data.iconType) }]);
      }
      setIsModalOpen(false);
      setCurrentSession(null);
    } catch (err) {
      console.error("Error saving session:", err);
    }
  };

  const isAdmin = userRole === 'admin';

  return (
    <section className="ks-section">
      <div className="ks-container">
        <div className="ks-header">
          <span className="ks-badge">Highlights</span>
          <h2 className="ks-title">Key Sessions</h2>
          <div className="ks-line"></div>
          {/* Show Add button only for admin */}
          {isAdmin && (
            <button className="ks-add-btn" onClick={handleAddClick}>
              <PlusIcon /> Add Key Session
            </button>
          )}
        </div>

        {/* --- Rendu Conditionnel pour le Chargement --- */}
        {loading ? (
          <LoadingPlaceholder count={3} />
        ) : (
          <div className="ks-grid">
            {sessions.map(session => (
              <div key={session._id} className="ks-card">
                <div className="ks-card-bg"></div>
                <div className="ks-content">
                  <div className="ks-icon-box">{session.icon}</div>
                  <h3 className="ks-session-title">{session.title}</h3>
                  <div className="ks-divider"></div>
                  <div className="ks-speaker-info">
                    <div className="ks-img-wrapper">
                      {/* Placeholder div rendering for a missing image */}
                      {session.image ? <img src={session.image} alt={session.speaker} className="ks-speaker-img" /> : <div className="ks-img-placeholder"></div>}
                      <div className="ks-online-dot"></div>
                    </div>
                    <div className="ks-speaker-text">
                      <span className="ks-role">{session.role}</span>
                      <h4 className="ks-name">{session.speaker}</h4>
                    </div>
                  </div>

                  {isAdmin && (
                  <div className="ks-card-actions">
                    <button
                      className="ab-action-btn update"
                      onClick={() => handleUpdateClick(session)}
                    >
                      <EditIcon /> Update
                    </button>
                    <button
                      className="ab-action-btn delete"
                      onClick={() => handleDelete(session._id)}
                    >
                      <TrashIcon /> Delete
                    </button>
                  </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* --- Fin Rendu Conditionnel --- */}

      </div>

      {isModalOpen && currentSession && (
        <div className="ks-modal-overlay">
          <div className="ks-modal-content">
            <div className="ks-modal-header">
              <h3>{currentSession._id ? 'Modifier Session' : 'Nouvelle Session'}</h3>
              <button className="ks-close-btn" onClick={() => setIsModalOpen(false)}><XIcon /></button>
            </div>
            <form onSubmit={handleSave} className="ks-modal-form">
              <div className="ks-form-group">
                <label>Titre de la session</label>
                <textarea name="title" value={currentSession.title} onChange={handleModalChange} required rows="3" />
              </div>
              <div className="ks-form-group">
                <label>Nom du Speaker</label>
                <input type="text" name="speaker" value={currentSession.speaker} onChange={handleModalChange} required />
              </div>
              <div className="ks-form-group">
                <label>Rôle (ex: Keynote Speaker)</label>
                <input type="text" name="role" value={currentSession.role} onChange={handleModalChange} required />
              </div>
              <div className="ks-form-group">
                <label>URL Image Speaker</label>
                <input type="text" name="image" value={currentSession.image} onChange={handleModalChange} placeholder="https://..." />
              </div>
              <div className="ks-form-group">
                <label>Type d'icône</label>
                <select
                  name="iconType"
                  value={currentSession.iconType}
                  onChange={handleModalChange}
                  required // Added required attribute
                >
                  <option value="brain">Brain</option>
                  <option value="learn">Learn</option>
                </select>
              </div>
              <div className="ks-modal-actions">
                <button type="button" className="ks-cancel-btn" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" className="ks-save-btn">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STYLES block included below */}
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
        /* Changed ab-card-actions to ks-card-actions for consistency */
        .ks-card-actions {
            margin-top: auto;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.1);
            display: flex;
            gap: 10px;
        }

        /* Changed ab-action-btn to ks-action-btn for consistency */
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
            color: #ccc;
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
        .ks-form-group label { display: block; margin-bottom: 6px; color: #ccc; font-size: 0.9rem; }
        .ks-form-group input, .ks-form-group textarea, .ks-form-group select {
            width: 100%; padding: 10px; background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
            color: white; outline: none; font-family: inherit;
        }

        .ks-modal-actions { display: flex; gap: 10px; margin-top: 25px; }
        .ks-save-btn { flex: 1; background: #6366f1; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .ks-cancel-btn { flex: 1; background: transparent; border: 1px solid #555; color: #ccc; padding: 10px; border-radius: 8px; cursor: pointer; }

        /* Petit placeholder si pas d'image */
        .ks-img-placeholder { width: 50px; height: 50px; background: #333; border-radius: 50%; }

        /* --- SKELETON LOADING STYLES --- */
        @keyframes loading-skeleton {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }

        .ks-skeleton-animate {
          /* Gradient pour l'effet de balayage de la lumière */
          background: #f0f0f0ff; /* Couleur de base du squelette */
          background-image: linear-gradient(to right, #ddddddff 0%, #d4d4d4ff 20%, #dfdfdfff 40%, #e2e2e2ff 100%);
          background-repeat: no-repeat;
          background-size: 400px 100%;
          animation: loading-skeleton 1.5s infinite linear;
        }

        .ks-skeleton .ks-card-bg {
          /* Assurez-vous que le fond est visible si besoin */
          opacity: 0.5; /* Rendre le fond de la carte squelette plus subtil */
        }

        .ks-skeleton-line {
          background: #dbdbdbff; /* Couleur pour les lignes/blocs */
          border-radius: 4px;
          opacity: 0.8;
          /* Appliquer l'animation de balayage à chaque ligne/bloc */
          background-image: linear-gradient(to right, #ffffffff 0%, #dfdfdfff 20%, #f1f1f1ff 40%, #eeeeeeff 100%);
          background-repeat: no-repeat;
          background-size: 400px 100%;
          animation: loading-skeleton 1.5s infinite linear;
        }

        /* Appliquer la classe de squelette au conteneur de la carte */
        .ks-card.ks-skeleton {
          /* Enlever les ombres, bordures spécifiques pour le mode squelette */
          border: 1px solid rgba(2, 2, 2, 0.05); /* Ligne légère pour délimiter */
          background-color: #f3f3f3ff;
        }

        /* Empêcher l'interaction sur le squelette */
        .ks-skeleton * {
          pointer-events: none;
        }
      `}</style>
    </section>
  );
};

export default KeySessions;