import React, { useState, useEffect } from 'react';

// Configuration API URL (Make sure your Node server is running on port 5000)
const API_URL = 'http://localhost:3000/api';

const About = () => {
  // --- STATE ---
  
  // 1. Hero Image State
  const [heroImage, setHeroImage] = useState(''); 
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [tempHeroUrl, setTempHeroUrl] = useState('');

  // 2. Team Members State
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);

  // --- EFFECT: FETCH DATA ON LOAD ---
  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Récupération de l'image Hero
      try {
        const heroRes = await fetch(`${API_URL}/hero`);
        if (heroRes.ok) {
            const heroData = await heroRes.json();
            setHeroImage(heroData.imageUrl);
        }
      } catch (err) {
        console.warn("Impossible de charger l'image Hero", err);
      }

      // 2. Récupération de l'équipe (Team)
      const teamRes = await fetch(`${API_URL}/team`);
      
      // Si le serveur renvoie une erreur (ex: 404 ou 500)
      if (!teamRes.ok) {
        throw new Error(`Erreur serveur: ${teamRes.status}`);
      }

      const teamData = await teamRes.json();
      
      // SÉCURITÉ CRUCIALE : On vérifie que c'est bien une liste (Array)
      if (Array.isArray(teamData)) {
        setTeamMembers(teamData);
      } else {
        console.error("Format de données invalide reçu:", teamData);
        setTeamMembers([]); // On met une liste vide pour éviter le crash .map()
      }
      
    } catch (error) {
      console.error("Erreur générale fetch:", error);
      // Optionnel : ne rien afficher ou mettre des données factices
      setTeamMembers([]); 
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS ---

  // A. HERO IMAGE (Update)
  const handleUpdateHeroImage = () => {
    setTempHeroUrl(heroImage); 
    setIsHeroModalOpen(true);
  };

  const handleSaveHeroImage = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/hero`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: tempHeroUrl })
        });
        const data = await res.json();
        setHeroImage(data.imageUrl);
        setIsHeroModalOpen(false);
    } catch (err) {
        alert("Erreur lors de la mise à jour de l'image");
    }
  };

  // B. TEAM - ADD MEMBER (Create)
  const handleAddMember = async () => {
    try {
        const newMemberData = {
            name: "Nouveau Membre",
            role: "Role à définir",
            image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=400&q=80"
        };

        const res = await fetch(`${API_URL}/team`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMemberData)
        });
        
        if (res.ok) {
            const savedMember = await res.json();
            setTeamMembers([...teamMembers, savedMember]); // Add to UI
        }
    } catch (err) {
        alert("Erreur lors de l'ajout");
    }
  };

  // C. TEAM - DELETE MEMBER (Delete)
  const handleDeleteMember = async (id) => {
    if(window.confirm("Supprimer ce membre de l'équipe ?")) {
        try {
            await fetch(`${API_URL}/team/${id}`, { method: 'DELETE' });
            // Remove from UI
            setTeamMembers(teamMembers.filter(member => member._id !== id));
        } catch (err) {
            alert("Erreur lors de la suppression");
        }
    }
  };

  // D. TEAM - PREPARE EDIT
  const handleUpdateClick = (member) => {
    setCurrentMember({ ...member });
    setIsEditModalOpen(true);
  };

  // E. TEAM - HANDLE INPUT CHANGE
  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setCurrentMember(prev => ({ ...prev, [name]: value }));
  };

  // F. TEAM - SAVE CHANGES (Update)
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/team/${currentMember._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: currentMember.name,
                role: currentMember.role,
                image: currentMember.image
            })
        });

        if (res.ok) {
            const updatedMember = await res.json();
            // Update UI
            setTeamMembers(teamMembers.map(m => (m._id === updatedMember._id ? updatedMember : m)));
            setIsEditModalOpen(false);
            setCurrentMember(null);
        }
    } catch (err) {
        alert("Erreur lors de la sauvegarde");
    }
  };

  // --- ICONS SVG ---
  const CameraIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>);
  const PlusIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
  const EditIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
  const TrashIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>);
  const XIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);

  if (isLoading) {
      return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Chargement des données...</div>;
  }

  return (
    <div className="ab-main-container">
      <div className="ab-grid-bg"></div>

      {/* Hero Section */}
      <section className="ab-hero-section">
        <div className="ab-hero-content">
          <span className="ab-badge">Notre Vision</span>
          <h1 className="ab-hero-title">L'Intelligence <br /><span className="ab-text-gradient">Au Service de l'Humain.</span></h1>
          <p className="ab-hero-desc">
            Nous fusionnons algorithmes avancés et design intuitif pour créer les solutions de demain.
          </p>
        </div>
        
        <div className="ab-hero-visual">
          <div className="ab-img-container-tech">
            <img 
              src={heroImage || "https://via.placeholder.com/600"} 
              alt="AI Vision" 
              className="ab-hero-img"
            />
            <button className="ab-hero-edit-btn" onClick={handleUpdateHeroImage}>
                <CameraIcon /> <span>Update Vision</span>
            </button>
            <div className="ab-tech-card float-1"><span style={{fontWeight:"700"}}>REMET - AI</span></div>
            <div className="ab-tech-dots"></div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="ab-team-section">
        <div className="ab-team-header-wrapper">
            <h2 className="ab-section-title">Les Architectes du Futur</h2>
            <p className="ab-section-subtitle">Une expertise pluridisciplinaire pour des défis complexes.</p>
            
            <button className="ab-add-member-btn" onClick={handleAddMember}>
                <PlusIcon />
                <span>Add Team Member</span>
            </button>
        </div>
        
        <div className="ab-team-grid">
          {teamMembers.map(member => (
            <div key={member._id} className="ab-team-card">
              <div className="ab-img-ring-container">
                <div className="ab-img-ring"></div>
                <img src={member.image} alt={member.name} className="ab-member-img" />
              </div>
              
              <h3 className="ab-member-name">{member.name}</h3>
              <p className="ab-member-role">{member.role}</p>
              
              <div className="ab-social-dots">
                  <span></span><span></span><span></span>
              </div>

              <div className="ab-card-actions">
                  <button 
                    className="ab-action-btn update" 
                    onClick={() => handleUpdateClick(member)}
                  >
                    <EditIcon /> Update
                  </button>
                  <button 
                    className="ab-action-btn delete" 
                    onClick={() => handleDeleteMember(member._id)}
                  >
                    <TrashIcon /> Delete
                  </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- MODAL 1: EDIT TEAM MEMBER --- */}
      {isEditModalOpen && currentMember && (
        <div className="ab-modal-overlay">
            <div className="ab-modal-content">
                <div className="ab-modal-header">
                    <h3>Modifier le profil</h3>
                    <button className="ab-close-btn" onClick={() => setIsEditModalOpen(false)}>
                        <XIcon />
                    </button>
                </div>
                
                <form onSubmit={handleSaveChanges} className="ab-modal-form">
                    <div className="ab-form-group">
                        <label>Nom complet</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={currentMember.name} 
                            onChange={handleModalChange} 
                            required 
                        />
                    </div>
                    
                    <div className="ab-form-group">
                        <label>Rôle</label>
                        <input 
                            type="text" 
                            name="role" 
                            value={currentMember.role} 
                            onChange={handleModalChange} 
                            required 
                        />
                    </div>

                    <div className="ab-form-group">
                        <label>URL de l'image</label>
                        <input 
                            type="text" 
                            name="image" 
                            value={currentMember.image} 
                            onChange={handleModalChange} 
                        />
                    </div>

                    <div className="ab-modal-actions">
                        <button type="button" className="ab-cancel-btn" onClick={() => setIsEditModalOpen(false)}>Annuler</button>
                        <button type="submit" className="ab-save-btn">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- MODAL 2: UPDATE HERO IMAGE --- */}
      {isHeroModalOpen && (
        <div className="ab-modal-overlay">
            <div className="ab-modal-content">
                <div className="ab-modal-header">
                    <h3>Changer l'image Vision</h3>
                    <button className="ab-close-btn" onClick={() => setIsHeroModalOpen(false)}>
                        <XIcon />
                    </button>
                </div>
                
                <form onSubmit={handleSaveHeroImage} className="ab-modal-form">
                    <div className="ab-form-group">
                        <label>URL de la nouvelle image</label>
                        <input 
                            type="text" 
                            placeholder="https://..."
                            value={tempHeroUrl} 
                            onChange={(e) => setTempHeroUrl(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="ab-modal-actions">
                        <button type="button" className="ab-cancel-btn" onClick={() => setIsHeroModalOpen(false)}>Annuler</button>
                        <button type="submit" className="ab-save-btn">Mettre à jour</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* STYLES CSS AJOUTÉS */}
      <style>{`
        /* Header Centré */
        .ab-team-header-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin-bottom: 50px;
            gap: 20px;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }

        /* Bouton Add - Style Futuriste */
        .ab-add-member-btn {
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 30px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
            margin-top: 10px;
        }
        .ab-add-member-btn:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 8px 25px rgba(168, 85, 247, 0.6);
        }

        /* --- MODAL STYLES (Glassmorphism) --- */
        .ab-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .ab-modal-content {
            background: rgba(30, 30, 40, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
            width: 90%;
            max-width: 400px;
            padding: 25px;
            border-radius: 20px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            animation: fadeIn 0.3s ease;
            color: white;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .ab-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding-bottom: 10px;
        }

        .ab-close-btn {
            background: transparent;
            border: none;
            color: rgba(255,255,255,0.5);
            cursor: pointer;
            transition: color 0.2s;
        }
        .ab-close-btn:hover { color: white; }

        .ab-form-group {
            margin-bottom: 15px;
            text-align: left;
        }

        .ab-form-group label {
            display: block;
            margin-bottom: 5px;
            font-size: 0.85rem;
            color: #a5b4fc;
        }

        .ab-form-group input {
            width: 100%;
            padding: 10px;
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: white;
            outline: none;
        }
        .ab-form-group input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }

        .ab-modal-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }

        .ab-save-btn {
            flex: 1;
            background: #6366f1;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }
        .ab-cancel-btn {
            flex: 1;
            background: transparent;
            color: #ccc;
            border: 1px solid rgba(255,255,255,0.2);
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
        }
        
        /* Boutons Update existants */
        .ab-img-container-tech { position: relative; }
        .ab-hero-edit-btn {
            position: absolute; bottom: 20px; right: 20px;
            background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2); color: white;
            padding: 8px 16px; border-radius: 30px; display: flex; align-items: center; gap: 8px;
            cursor: pointer; font-size: 0.9rem; transition: all 0.3s ease; z-index: 10;
        }
        .ab-hero-edit-btn:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-2px); }

        .ab-card-actions {
            display: flex; justify-content: center; gap: 10px; margin-top: 15px;
            padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); width: 100%;
        }
        .ab-action-btn {
            flex: 1; padding: 8px; border-radius: 8px; border: 1px solid transparent;
            cursor: pointer; font-size: 0.8rem; display: flex; justify-content: center; align-items: center;
            gap: 5px; transition: all 0.2s ease; font-weight: 500;
        }
        .ab-action-btn.update { background: rgba(99, 102, 241, 0.1); color: #a5b4fc; border-color: rgba(99, 102, 241, 0.2); }
        .ab-action-btn.update:hover { background: rgba(99, 102, 241, 0.2); color: white; }
        .ab-action-btn.delete { background: rgba(239, 68, 68, 0.1); color: #fca5a5; border-color: rgba(239, 68, 68, 0.2); }
        .ab-action-btn.delete:hover { background: rgba(239, 68, 68, 0.2); color: white; }
      `}</style>
    </div>
  );
}

export default About;