import React, { useState, useEffect } from 'react';

// Configuration API URL (Make sure your Node server is running on port 5000)
// Nous allons ajouter un endpoint pour vérifier le rôle de l'utilisateur par email.
import API_BASE_URL from '../config';
const API_URL = `${API_BASE_URL}/api`;

const About = () => {
  // --- STATE ---

  // NOUVEL ÉTAT POUR LE RÔLE DE L'UTILISATEUR
  const [userRole, setUserRole] = useState(null);

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

  // Variable pour simplifier l'affichage des boutons d'administration
  const isAdmin = userRole === 'admin';

  // --- EFFECT: FETCH DATA ON LOAD ---
  useEffect(() => {
    // Appeler fetchData pour charger l'image/équipe ET vérifier le rôle
    fetchData();
    // Le rôle est vérifié dans fetchData
  }, []);

  // --- NOUVELLE FONCTION: VÉRIFIER LE RÔLE ---
  const checkUserRole = async () => {
    // 1. استرجاع البريد الإلكتروني من localStorage
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
      setUserRole('student'); // Rôle par défaut si pas de login
      return;
    }

    try {
      // 2. إرسال طلب إلى الخادم للبحث عن المستخدم
      // ATTENTION: Il faut créer l'endpoint /user/role/:email sur le serveur Node/Express
      const res = await fetch(`${API_URL}/user/role/${userEmail}`);

      if (res.ok) {
        const data = await res.json();
        // 3. تخزين الدور المسترجع (admin أو student)
        setUserRole(data.role);
      } else {
        console.error("Erreur lors de la récupération du rôle", res.status);
        setUserRole('student'); // Sécurité
      }
    } catch (error) {
      console.error("Erreur réseau pour le rôle:", error);
      setUserRole('student');
    }
  };
  // ---------------------------------------------

  const fetchData = async () => {
    // VÉRIFIER LE RÔLE AVANT OU PENDANT LE CHARGEMENT DES AUTRES DONNÉES
    await checkUserRole();

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

      if (!teamRes.ok) {
        throw new Error(`Erreur serveur: ${teamRes.status}`);
      }

      const teamData = await teamRes.json();

      if (Array.isArray(teamData)) {
        setTeamMembers(teamData);
      } else {
        console.error("Format de données invalide reçu:", teamData);
        setTeamMembers([]);
      }

    } catch (error) {
      console.error("Erreur générale fetch:", error);
      setTeamMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS (UNCHANGED) ---
  // A. HERO IMAGE (Update)
  const handleUpdateHeroImage = () => {
    if (!isAdmin) return; // Sécurité
    setTempHeroUrl(heroImage);
    setIsHeroModalOpen(true);
  };

  const handleSaveHeroImage = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; // Sécurité
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
    if (!isAdmin) return; // Sécurité
    try {
      const newMemberData = {
        name: "New Visionary",
        role: "Architecture Specialist"
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
    if (!isAdmin) return; // Sécurité
    if (window.confirm("Supprimer ce membre de l'équipe ?")) {
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
    if (!isAdmin) return; // Sécurité
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
    if (!isAdmin) return; // Sécurité
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


  // --- ICONS SVG (UNCHANGED) ---
  const CameraIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>);
  const PlusIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
  const EditIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
  const TrashIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>);
  const XIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);

  // Si isLoading est vrai OU si le rôle n'a pas encore été chargé
  if (isLoading || userRole === null) {
    return (
      <>
        <div className="ab-main-container">
          <div className="ab-grid-bg"></div>

          {/* Hero Section */}
          <section className="ab-hero-section">
            <div className="ab-hero-content">
              <span className="ab-badge">Our Vision</span>
              <h1 className="ab-hero-title">Intelligence<br /><span className="ab-text-gradient">at the Service of Humanity.</span></h1>
              <p className="ab-hero-desc">
                We combine advanced algorithms with intuitive design to create the solutions of tomorrow.
              </p>
            </div>

            <div className="ab-hero-visual">
              <div className="ab-img-container-tech">
                <img
                  src="https://img.freepik.com/photos-gratuite/arriere-plan-gris-lisse-haute-qualite_53876-124606.jpg?uid=R146232678&ga=GA1.1.468840471.1762219905&semt=ais_hybrid&w=740&q=80"
                  alt="AI Vision"
                  className="ab-hero-img"
                />

                <div className="ab-tech-card float-1"><span style={{ fontWeight: "700" }}>REMET - AI</span></div>
                <div className="ab-tech-dots"></div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="ab-team-section">
            <div className="ab-team-header-wrapper">
              <h2 className="ab-section-title">The Architects of the Future</h2>
              <p className="ab-section-subtitle" style={{ textAlign: "center" }}>A multidisciplinary expertise for complex challenges.</p>

              {/* AFFICHAGE CONDITIONNEL POUR Add Team Member */}

            </div>

            <div className="ab-team-grid">
              <div className="ab-team-card-modern">
                <div className="ab-member-info">
                  <h3 className="ab-member-name-modern loading-skeleton"></h3>
                  <div className="ab-role-badge loading-skeleton"></div>
                </div>
                <div className="ab-social-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
              <div className="ab-team-card-modern">
                <div className="ab-member-info">
                  <h3 className="ab-member-name-modern loading-skeleton"></h3>
                  <div className="ab-role-badge loading-skeleton"></div>
                </div>
                <div className="ab-social-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </section>




        </div>

      </>
    )
  }

  return (
    <div className="ab-main-container">
      <div className="ab-grid-bg"></div>

      {/* Hero Section */}
      <section className="ab-hero-section">
        <div className="ab-hero-blob"></div>
        <div className="ab-hero-content">
          <span className="ab-badge">The Future starts Here</span>
          <h1 className="ab-hero-title">
            Driving <span className="ab-text-gradient">Intelligence</span><br />
            Beyond Boundaries
          </h1>
          <p className="ab-hero-desc">
            We bridge the gap between cutting-edge research and real-world application,
            cultivating a ecosystem where human expertise meets artificial potential.
          </p>
        </div>

        <div className="ab-hero-visual">
          <div className="ab-photo-frame">
            <div className="ab-rotating-ring"></div>
            <div className="ab-corner-bracket top-l"></div>
            <div className="ab-corner-bracket top-r"></div>
            <div className="ab-corner-bracket bot-l"></div>
            <div className="ab-corner-bracket bot-r"></div>

            <div className="frame-accent-1"></div>
            <div className="frame-accent-2"></div>
            <div className="ab-img-wrapper">
              <div className="ab-scanline-overlay"></div>
              <img
                src={heroImage || "https://img.freepik.com/photos-gratuite/arriere-plan-gris-lisse-haute-qualite_53876-124606.jpg"}
                alt="AI Vision"
                className="ab-hero-img"
              />
              {isAdmin && (
                <button className="ab-hero-edit-btn" onClick={handleUpdateHeroImage}>
                  <CameraIcon /> <span>Update Vision</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="ab-team-section">
        <div className="ab-team-header-wrapper">
          <h2 className="ab-section-title">The Architects of the Future</h2>
          <p className="ab-section-subtitle">A multidisciplinary expertise for complex challenges.</p>

          {/* AFFICHAGE CONDITIONNEL POUR Add Team Member */}
          {isAdmin && (
            <button className="ab-add-member-btn" onClick={handleAddMember}>
              <PlusIcon />
              <span>Add Team Member</span>
            </button>
          )}
        </div>

        <div className="ab-team-grid">
          {teamMembers.map(member => (
            <div key={member._id} className="ab-team-card-modern">
              <div className="ab-card-glow"></div>
              <div className="ab-member-info">
                <h3 className="ab-member-name-modern">{member.name}</h3>
                <div className="ab-role-badge">
                  {member.role}
                </div>
              </div>

              <div className="ab-social-dots">
                <span></span><span></span><span></span>
              </div>

              {/* AFFICHAGE CONDITIONNEL POUR Update et Delete */}
              {isAdmin && (
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
              )}
            </div>
          ))}
        </div>
      </section>

      {/* --- MODAL 1: EDIT TEAM MEMBER (Affiche seulement si Admin) --- */}
      {isAdmin && isEditModalOpen && currentMember && (
        <div className="ai-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Team Member</h3>
              <button className="close-x" onClick={() => setIsEditModalOpen(false)}>
                <XIcon />
              </button>
            </div>

            <form onSubmit={handleSaveChanges} className="ai-form">
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={currentMember.name}
                  onChange={handleModalChange}
                  required
                  placeholder="e.g. Dr. Sarah Chen"
                />
              </div>

              <div className="input-group">
                <label>Role</label>
                <input
                  type="text"
                  name="role"
                  placeholder="e.g. Lead Architect"
                  value={currentMember.role}
                  onChange={handleModalChange}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="ai-btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* --- MODAL 2: UPDATE HERO IMAGE (Affiche seulement si Admin) --- */}
      {isAdmin && isHeroModalOpen && (
        <div className="ai-modal-overlay" onClick={() => setIsHeroModalOpen(false)}>
          <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Vision Image</h3>
              <button className="close-x" onClick={() => setIsHeroModalOpen(false)}>
                <XIcon />
              </button>
            </div>

            <form onSubmit={handleSaveHeroImage} className="ai-form">
              <div className="input-group">
                <label>New Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={tempHeroUrl}
                  onChange={(e) => setTempHeroUrl(e.target.value)}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsHeroModalOpen(false)}>Cancel</button>
                <button type="submit" className="ai-btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STYLES CSS AJOUTÉS (UNCHANGED) */}
      <style>{`
                /* --- MODERN FUTURISTIC HERO --- */
                .ab-hero-section {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 60px 8%;
                    min-height: auto;
                    position: relative;
                    gap: 60px;
                    overflow: hidden;
                }

                .ab-hero-blob {
                    position: absolute;
                    top: 10%;
                    left: -10%;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
                    border-radius: 50%;
                    filter: blur(60px);
                    z-index: 0;
                }

                .ab-hero-content {
                    flex: 1;
                    position: relative;
                    z-index: 2;
                }

                .ab-hero-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    line-height: 1.1;
                    color: #0f172a;
                    margin: 20px 0;
                    letter-spacing: -0.04em;
                }

                .ab-hero-desc {
                    font-size: 1.1rem;
                    line-height: 1.7;
                    color: #64748b;
                    max-width: 540px;
                    margin-bottom: 40px;
                }

                .ab-hero-visual {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    z-index: 2;
                }

                .ab-photo-frame {
                    position: relative;
                    width: 100%;
                    max-width: 520px;
                    padding: 15px;
                }

                .ab-img-wrapper {
                    position: relative;
                    border-radius: 40px;
                    overflow: hidden;
                    box-shadow: 0 40px 100px rgba(15, 23, 42, 0.15);
                    background: #ffffff;
                    z-index: 2;
                    aspect-ratio: 4/3;
                }

                .ab-hero-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: all 0.8s cubic-bezier(0.2, 0, 0.2, 1);
                }

                .ab-img-wrapper:hover .ab-hero-img {
                    transform: scale(1.05);
                    filter: saturate(1.2) brightness(1.1);
                }

                /* --- ADVANCED TECH EFFECTS --- */
                .ab-rotating-ring {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 110%;
                    height: 110%;
                    border: 2px dashed rgba(99, 102, 241, 0.15);
                    border-radius: 50%;
                    z-index: 1;
                    animation: rotateRing 20s linear infinite;
                }

                @keyframes rotateRing {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }

                .ab-corner-bracket {
                    position: absolute;
                    width: 30px;
                    height: 30px;
                    border: 3px solid #6366f1;
                    z-index: 4;
                    pointer-events: none;
                    transition: all 0.3s ease;
                }

                .top-l { top: -5px; left: -5px; border-right: 0; border-bottom: 0; border-radius: 8px 0 0 0; }
                .top-r { top: -5px; right: -5px; border-left: 0; border-bottom: 0; border-radius: 0 8px 0 0; }
                .bot-l { bottom: -5px; left: -5px; border-right: 0; border-top: 0; border-radius: 0 0 0 8px; }
                .bot-r { bottom: -5px; right: -5px; border-left: 0; border-top: 0; border-radius: 0 0 8px 0; }

                .ab-photo-frame:hover .ab-corner-bracket {
                    width: 40px;
                    height: 40px;
                    border-color: #a855f7;
                }

                .ab-scanline-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        to bottom,
                        transparent 0%,
                        rgba(99, 102, 241, 0.05) 50%,
                        transparent 100%
                    );
                    background-size: 100% 200%;
                    z-index: 5;
                    pointer-events: none;
                    animation: techScan 4s linear infinite;
                }

                @keyframes techScan {
                    0% { background-position: 0% -100%; }
                    100% { background-position: 0% 100%; }
                }

                /* Decor Elements */
                .frame-accent-1 {
                    position: absolute;
                    top: -20px;
                    right: -20px;
                    width: 120px;
                    height: 120px;
                    background: radial-gradient(circle, #6366f1 0%, transparent 70%);
                    opacity: 0.15;
                    filter: blur(20px);
                    z-index: 1;
                }

                .frame-accent-2 {
                    position: absolute;
                    bottom: -30px;
                    left: -30px;
                    width: 180px;
                    height: 180px;
                    border: 2px solid rgba(168, 85, 247, 0.1);
                    border-radius: 50%;
                    z-index: 1;
                }

                .ab-floating-tag {
                    position: absolute;
                    bottom: 40px;
                    right: -20px;
                    background: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(10px);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 100px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                    z-index: 10;
                    border: 1px solid rgba(255,255,255,0.1);
                }

                .tag-pulse {
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #10b981;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }

                /* Header Centré */
                .ab-team-header-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    margin-bottom: 25px;
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

                /* --- UNIFIED MODAL STYLES (Matching Speaker/Programme Design) --- */
                .ai-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .ai-modal {
                    background: white;
                    width: 100%;
                    max-width: 550px;
                    border-radius: 28px;
                    overflow: hidden;
                    animation: modalSlide 0.4s ease-out;
                }

                @keyframes modalSlide { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

                .modal-header {
                    padding: 25px 35px;
                    background: #f8fafc;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e2e8f0;
                }

                .modal-header h3 { margin: 0; font-size: 1.2rem; color: #0f172a; font-weight: 700; }
                .close-x { background: none; border: none; cursor: pointer; color: #94a3b8; }
                .close-x:hover { color: #0f172a; }

                .ai-form { padding: 35px; }
                .input-group { margin-bottom: 20px; }
                .input-group label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 8px; color: #0f172a; }
                .input-group input, .input-group select, .input-group textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1rem;
                    transition: 0.2s;
                    box-sizing: border-box;
                }
                .input-group input:focus, .input-group textarea:focus, .input-group select:focus { 
                    border-color: #6366f1; 
                    outline: none; 
                    box-shadow: 0 0 0 4px rgba(99,102,241,0.1); 
                }

                .ai-btn-primary {
                    background: #0f172a;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 14px;
                    border: none;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: 0.3s;
                }
                .ai-btn-primary:hover { transform: scale(1.02); background: #000; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
                
                .btn-secondary { background: none; border: none; font-weight: 600; color: #64748b; cursor: pointer; }
                .btn-secondary:hover { color: #0f172a; }

                .modal-footer { display: flex; justify-content: flex-end; gap: 20px; margin-top: 30px; align-items: center; }

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
                    color: #f7f7f7ff;
                    border: 1px solid rgba(255,255,255,0.2);
                    padding: 10px;
                    border-radius: 8px;
                    cursor: pointer;
                }

                /* Boutons Update existants */
                .ab-img-container-tech { position: relative; }
                .ab-hero-edit-btn {
                    position: absolute; bottom: 20px; right: 20px;
                    background: #6366f1; backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2); color: white;
                    padding: 8px 16px; border-radius: 30px; display: flex; align-items: center; gap: 8px;
                    cursor: pointer; font-size: 0.9rem; transition: all 0.3s ease; z-index: 10;
                }
                .ab-hero-edit-btn:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-2px); }

                /* --- MODERN TEAM CARDS (No Photo) --- */
                .ab-team-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 25px;
                    padding: 20px 0;
                }

                .ab-team-card-modern {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 24px 20px;
                    text-align: center;
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 160px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    z-index: 1;
                }

                .ab-card-glow {
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle at center, rgba(99, 102, 241, 0.03) 0%, transparent 70%);
                    opacity: 0;
                    transition: opacity 0.5s ease;
                    pointer-events: none;
                    z-index: 0;
                }

                .ab-team-card-modern:hover .ab-card-glow {
                    opacity: 1;
                }

                .ab-team-card-modern::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    width: 4px;
                    background: linear-gradient(to bottom, #6366f1, #a855f7);
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .ab-team-card-modern:hover {
                    transform: translateY(-8px);
                    border-color: #6366f1;
                    box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.04);
                }

                .ab-team-card-modern:hover::before {
                    opacity: 1;
                }

                .ab-member-info {
                    margin-bottom: 15px;
                    z-index: 1;
                }

                .ab-member-name-modern {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 8px;
                    letter-spacing: -0.025em;
                    line-height: 1.2;
                }

                .ab-role-badge {
                    display: inline-block;
                    padding: 6px 16px;
                    background: rgba(99, 102, 241, 0.06);
                    color: #4338ca;
                    border: 1px solid rgba(99, 102, 241, 0.1);
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    line-height: 1.3;
                    letter-spacing: 0.01em;
                    backdrop-filter: blur(4px);
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.05);
                    transition: all 0.3s ease;
                }

                .ab-team-card-modern:hover .ab-role-badge {
                    background: rgba(99, 102, 241, 0.12);
                    border-color: rgba(99, 102, 241, 0.3);
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
                    transform: scale(1.02);
                }

                .ab-social-dots {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                    margin-top: auto;
                }

                .ab-social-dots span {
                    width: 6px;
                    height: 6px;
                    background: #cbd5e1;
                    border-radius: 50%;
                }

                .ab-card-actions {
                    display: flex; justify-content: center; gap: 10px; margin-top: 25px;
                    padding-top: 20px; border-top: 1px solid #f1f5f9; width: 100%;
                    z-index: 2;
                }

                .ab-action-btn {
                    flex: 1; padding: 10px; border-radius: 12px; border: 1px solid transparent;
                    cursor: pointer; font-size: 0.85rem; display: flex; justify-content: center; align-items: center;
                    gap: 6px; transition: all 0.2s ease; font-weight: 600;
                }

                .ab-action-btn.update { background: #f8fafc; color: #475569; border-color: #e2e8f0; }
                .ab-action-btn.update:hover { background: #6366f1; color: white; border-color: #6366f1; }
                .ab-action-btn.delete { background: #fff1f2; color: #e11d48; border-color: #fecdd3; }
                .ab-action-btn.delete:hover { background: #e11d48; color: white; border-color: #e11d48; }

                /* Loading skeleton adaptations */
                .loading-skeleton {
                    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
                    background-size: 200% 100%;
                    animation: skeleton-loading 1.5s infinite;
                    border-radius: 4px;
                }

                @keyframes skeleton-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .ab-member-name-modern.loading-skeleton { height: 28px; width: 180px; margin: 0 auto 15px; }
                .ab-role-badge.loading-skeleton { height: 24px; width: 120px; border: none; box-shadow: none; }
            `}</style>
    </div>
  );
}

export default About;