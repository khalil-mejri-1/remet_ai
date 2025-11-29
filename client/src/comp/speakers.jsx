import React, { useState, useEffect } from "react";
import axios from "axios";

// --- ICONS SVG (Non modifiés) ---
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// ===== URL BASE API =====
const API_URL = "https://remet-ai-nate.vercel.app/api/speakers";
  const USER_ROLE_CHECK_URL = "https://remet-ai-nate.vercel.app/api/user/role";


// ===== Speaker Card Component (Non modifié) =====
const SpeakerCard = ({ speaker, onUpdate, onDelete, isAdmin }) => {
  const titleClass = speaker.expertType === "expert" ? "expert-title" : "ia-title";

  return (
    <div className="speaker-card">
      <div className="speaker-photo-placeholder">
        {speaker.image ? <img src={speaker.image} alt={speaker.name} className="speaker-real-img" /> : <span className="photo-text">Photo</span>}
      </div>

      <div className="speaker-details">
        <h3 className="speaker-name">{speaker.name}</h3>
        <p className={`speaker-title ${titleClass}`}>{speaker.title}</p>
        <p className="speaker-description">{speaker.description}</p>
      </div>

      {/* عرض الأزرار فقط إذا كان isAdmin صحيحًا */}
      {isAdmin && (
        <div className="ab-card-actions">
          <button className="ab-action-btn update" onClick={() => onUpdate(speaker)}>
            <EditIcon /> Update
          </button>
          <button className="ab-action-btn delete" onClick={() => onDelete(speaker._id)}>
            <TrashIcon /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ===== Main Component (Speakers) =====
export default function Speakers() {
  const [speakers, setSpeakers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // État de chargement initial pour les données
  const [isLoading, setIsLoading] = useState(true); 
  // État de chargement pour les soumissions de modal
  const [isSubmitting, setIsSubmitting] = useState(false); 


  // --- GET ALL SPEAKERS ---
  const fetchSpeakers = async () => {
    setIsLoading(true); // Début du chargement
    try {
      const res = await axios.get(API_URL);
      setSpeakers(res.data);
    } catch (err) {
      console.error("Error fetching speakers:", err);
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  };

  // --- CHECK USER ROLE (Non modifié) ---
  const checkUserRole = async () => {
    const userEmail = localStorage.getItem("userEmail");

    if (userEmail) {
      try {
        const res = await axios.get(`${USER_ROLE_CHECK_URL}/${userEmail}`);

        if (res.data && res.data.role === "admin") {
          setIsAdmin(true); 
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error checking user role:", err);
        setIsAdmin(false); 
      }
    } else {
      setIsAdmin(false);
    }
  };


  useEffect(() => {
    fetchSpeakers();
    checkUserRole(); 
  }, []); 

  // --- DELETE SPEAKER ---
  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert("Vous n'êtes pas autorisé à effectuer cette action."); 
      return;
    }

    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce speaker ?")) {
        setIsSubmitting(true); // Début du chargement pour la suppression
      try {
        await axios.delete(`${API_URL}/${id}`);
        setSpeakers(speakers.filter((s) => s._id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
        alert("La suppression a échoué.");
      } finally {
            setIsSubmitting(false); // Fin du chargement
        }
    }
  };

  // --- ADD / UPDATE SPEAKER MODAL ---
  const handleAddClick = () => {
    if (!isAdmin) return; 
    setCurrentSpeaker({ name: "", title: "", description: "", expertType: "ia", image: "" });
    setIsModalOpen(true);
  };

  const handleUpdateClick = (speaker) => {
    if (!isAdmin) return; 
    setCurrentSpeaker({ ...speaker });
    setIsModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setCurrentSpeaker((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; 
    
    setIsSubmitting(true); // Début du chargement pour l'enregistrement

    try {
      if (currentSpeaker._id) {
        // Update
        const res = await axios.put(`${API_URL}/${currentSpeaker._id}`, currentSpeaker);
        setSpeakers(speakers.map((s) => (s._id === currentSpeaker._id ? res.data : s)));
      } else {
        // Create
        const res = await axios.post(API_URL, currentSpeaker);
        setSpeakers([...speakers, res.data]);
      }
      setIsModalOpen(false);
      setCurrentSpeaker(null);
    } catch (err) {
      console.error("Save failed:", err);
      alert("L'enregistrement a échoué.");
    } finally {
        setIsSubmitting(false); // Fin du chargement
    }
  };

  return (
    <section className="speakers-section">
      <div className="speakers-header-wrapper">
        <h2 className="section-title">Speakers</h2>

        {/* Affichage du bouton Add Speaker seulement si isAdmin est vrai ET non en soumission */}
        {isAdmin && (
          <button className="ab-add-member-btn" onClick={handleAddClick} disabled={isSubmitting} style={{margin:"auto",marginBottom:"40px"}}>
            <PlusIcon /> {isSubmitting ? "Chargement..." : "Add Speaker"}
          </button>
        )}
      </div>

      <div className="speakers-grid">
        {/* Affichage de l'état de chargement initial */}
        {isLoading ? (



  <div className="speaker-card">
      <div className="speaker-photo-placeholder">
         <img src=""  className="speaker-real-img" /> 
      </div>

     <div class="speaker-details">
    <h3 class="speaker-name loading-skeleton"></h3>
    <p class="speaker-title loading-skeleton"></p>
    <p class="speaker-description loading-skeleton"></p>
</div>
      
    </div>
      
      
          ) : speakers.length === 0 ? (
            <div className="no-speakers-message" style={{textAlign:"center"}}>Aucun speaker trouvé. {isAdmin && "Cliquez sur 'Add Speaker' pour commencer."}</div>
        ) : (
          speakers.map((speaker) => (
            <SpeakerCard
              key={speaker._id}
              speaker={speaker}
              onUpdate={handleUpdateClick}
              onDelete={handleDelete}
              isAdmin={isAdmin} 
            />
          ))
        )}
      </div>

      {isModalOpen && currentSpeaker && isAdmin && ( 
        <div className="ks-modal-overlay">
          <div className="ks-modal-content">
            <div className="ks-modal-header">
              <h3>{currentSpeaker._id ? "Edit Speaker" : "Add Speaker"}</h3>
              <button className="ks-close-btn" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                <XIcon />
              </button>
            </div>

            <form onSubmit={handleSave} className="ks-modal-form">
              <div className="ks-form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={currentSpeaker.name} onChange={handleModalChange} required disabled={isSubmitting} />
              </div>

              <div className="ks-form-group">
                <label>Title</label>
                <input type="text" name="title" value={currentSpeaker.title} onChange={handleModalChange} required disabled={isSubmitting} />
              </div>

              <div className="ks-form-group">
                <label>Expert Type</label>
                <select name="expertType" value={currentSpeaker.expertType} onChange={handleModalChange} disabled={isSubmitting}>
                  <option value="ia">IA (Bleu)</option>
                  <option value="expert">Expert (Vert)</option>
                </select>
              </div>

              <div className="ks-form-group">
                <label>Image URL (Optional)</label>
                <input type="text" name="image" value={currentSpeaker.image || ""} onChange={handleModalChange} placeholder="https://..." disabled={isSubmitting} />
              </div>

              <div className="ks-form-group">
                <label>Description</label>
                <textarea name="description" value={currentSpeaker.description} onChange={handleModalChange} rows="3" disabled={isSubmitting} />
              </div>

              <div className="ks-modal-actions">
                <button type="button" className="ks-cancel-btn" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="ks-save-btn" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- STYLES ADDITIONNELS --- */}
      <style>{`
        /* ... Styles existants ... */

        .loading-message, .no-speakers-message {
            grid-column: 1 / -1; /* Permet d'occuper toute la largeur du grid */
            text-align: center;
            padding: 40px 0;
            font-size: 1.1rem;
            color: #ccc;
        }

        .sp-modal-actions button[type="submit"]:disabled {
            background: #4f46e5;
            cursor: not-allowed;
            opacity: 0.7;
        }
        
        /* Assurez-vous d'inclure les styles originaux ici pour ne pas les perdre */
        
        .speaker-card {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .speaker-real-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: inherit;
            display: block;
        }

        .speakers-header-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 40px;
            text-align: center;
        }

        .sp-add-btn {
            margin-top: 15px;
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
        .sp-add-btn:hover { transform: scale(1.05); }

        .sp-card-actions {
            margin-top: auto; 
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.1);
            display: flex;
            gap: 10px;
        }
        .sp-action-btn {
            flex: 1;
            padding: 6px;
            border-radius: 6px;
            border: 1px solid transparent;
            cursor: pointer;
            font-size: 0.8rem;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 5px;
            background: rgba(255,255,255,0.05);
            color: #ffffff;
            transition: all 0.2s;
        }
        .sp-action-btn.update:hover { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; }
        .sp-action-btn.delete:hover { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }

        .sp-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(4px);
            z-index: 9999; display: flex; justify-content: center; align-items: center;
        }
        .sp-modal-content {
            background: #252530; border: 1px solid rgba(255,255,255,0.1);
            width: 90%; max-width: 400px; padding: 25px; border-radius: 12px;
            color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        .sp-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .sp-close-btn { background: none; border: none; color: #aaa; cursor: pointer; }
        .sp-close-btn:hover { color: white; }
        .sp-form-group { margin-bottom: 12px; text-align: left; }
        .sp-form-group label { display: block; margin-bottom: 5px; color: #ffffffff; font-size: 0.9rem; }
        .sp-form-group input, .sp-form-group textarea, .sp-select {
            width: 100%; padding: 8px; background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
            color: white; outline: none; font-family: inherit;
        }
        .sp-modal-actions { display: flex; gap: 10px; margin-top: 20px; color:white}
        .sp-modal-actions button[type="submit"] { flex: 1; background: #6366f1; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
        .sp-modal-actions button[type="submit"]:hover { background: #4f46e5; }
        .sp-modal-actions button[type="button"] { flex: 1; background: transparent; border: 1px solid #555; color: #ffffffff; padding: 10px; border-radius: 6px; cursor: pointer; transition: border-color 0.2s; }
        .sp-modal-actions button[type="button"]:hover { border-color: #999; color: white; }





      `}</style>
    </section>
  );
}