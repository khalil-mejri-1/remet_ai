import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from "qrcode.react";
import QRScannerModal from '../comp/QRScannerModal.jsx';
import EntryExitModal from '../comp/EntryExitModal.jsx'; // 👈 NOUVEAU COMPOSANT pour le SCAN

// --- ICONS ---
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const XIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const MinusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const ClockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const QRIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M21 15h-3a2 2 0 0 0-2 2v3"></path><path d="M16 21v-2a2 2 0 0 0 2-2h3"></path></svg>;

// ICÔNES pour le modal Entrée/Sortie
const EnterIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><path d="m18 3-7 7"></path></svg>;
const ExitIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

// NOUVEAU Composant Modal de sélection pour l'Admin (Entrée/Sortie Generation)
const AdminQRSelectionModal = ({ isOpen, onClose, onSelectScan, EnterIcon, ExitIcon, XIcon }) => {
    if (!isOpen) return null;

    return (
        <div className="prog-modal-overlay">
            <div className="prog-modal-content entry-exit-modal-content">
                <div className="prog-modal-header">
                    <h3>Create QR Code for Entry/Exit</h3>
                    <button onClick={onClose} className="prog-close-btn"><XIcon /></button>
                </div>
                <div className="entry-exit-options">
                    <button 
                        className="prog-btn entry-btn" 
                        onClick={() => { onSelectScan('entry'); onClose(); }}
                    >
                        <EnterIcon /> Entrer (Générer QR)
                    </button>
                    <button 
                        className="prog-btn exit-btn" 
                        onClick={() => { onSelectScan('exit'); onClose(); }}
                    >
                        <ExitIcon /> Sortie (Générer QR)
                    </button>
                </div>
            </div>
            <style jsx>{`
                .entry-exit-modal-content { max-width: 300px; text-align: center; }
                .entry-exit-options { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
                .entry-btn { background-color: #10b981; color: white; }
                .exit-btn { background-color: #f59e0b; color: white; }
                /* Styles hérités pour le modal */
                .prog-modal-content { background: #1f1f2e; }
            `}</style>
        </div>
    );
};


export default function Programme() {
  const [data, setData] = useState({});
  const [activeDay, setActiveDay] = useState('');
  const [isAddDayModalOpen, setIsAddDayModalOpen] = useState(false);
  const [isRemoveDayModalOpen, setIsRemoveDayModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [newDayName, setNewDayName] = useState('');
  const [dayToRemove, setDayToRemove] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [newSession, setNewSession] = useState({ time: '', title: '', ledBy: '', icon: '🎤', type: 'session', id: Date.now() });
  
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false); 
  const [qrCodeData, setQrCodeData] = useState(''); 
  // --- NOUVEAUX ÉTATS POUR LA GÉNÉRATION QR ADMIN ---
  const [isAdminScanTypeModalOpen, setIsAdminScanTypeModalOpen] = useState(false); // 👈 NOUVEL ÉTAT pour la sélection Admin
  const [currentAdminQRType, setCurrentAdminQRType] = useState('entry'); // 'entry' ou 'exit'
  // --------------------------------------------------
const qrCodeRef = React.useRef(null);
  // --- NOUVEAU : État Admin ---
  const [isAdmin, setIsAdmin] = useState(false);

  const [showPresenceBtn, setShowPresenceBtn] = useState(false);
  // MIS À JOUR : Nouveau modal de sélection
  const [showEntryExitModal, setShowEntryExitModal] = useState(false); // 👈 NOUVEL ÉTAT
  const [currentScanType, setCurrentScanType] = useState('entry'); // 'entry' ou 'exit'
  
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showWorkshopModal, setShowWorkshopModal] = useState(false);
  const [name, setName] = useState("");

  // Note: 'correctQR' est maintenu pour l'exemple
  const correctQR = "1764270607802";

  // --- Scroll Helpers ---
  const lockScroll = () => { document.body.style.overflow = 'hidden'; };
  const unlockScroll = () => { document.body.style.overflow = 'auto'; };

  // --- Workshop Modal Handlers ---
  const openWorkshop = () => { setShowWorkshopModal(true); lockScroll(); };
  const closeWorkshop = () => { setShowWorkshopModal(false); unlockScroll(); };

  // --- Auth Check ---
  const checkAuthStatus = () => {
    const isLogin = localStorage.getItem('login') === 'true';
    const isWorkshop = localStorage.getItem('WORKSHOP') === 'true';
    const storedName = localStorage.getItem('username');

    if (storedName) setName(storedName);

    if (isLogin && isWorkshop) {
      setShowPresenceBtn(true);
    } else {
      setShowPresenceBtn(false);
    }
  };

  // --- MISE À JOUR : Vérification du statut Admin (Utilise le nouvel endpoint GET) ---
  const checkAdminStatus = async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      setIsAdmin(false);
      return;
    }

    // Encoder l'email pour l'URL
    const encodedEmail = encodeURIComponent(userEmail);

    try {
      // UTILISATION DU NOUVEL ENDPOINT GET
      const res = await fetch(`http://localhost:3000/api/user/role/${encodedEmail}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Vous pourriez ajouter l'Authorization Bearer Token ici si nécessaire pour les routes protégées
        },
      });

      if (res.ok) {
        const data = await res.json();
        // Le backend retourne { role: 'admin' } ou { role: 'student' }
        setIsAdmin(data.role === 'admin');
      } else {
        // En cas d'erreur ou si l'utilisateur n'est pas trouvé
        console.error("Erreur HTTP lors de la vérification du rôle:", res.status);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du rôle admin:", error);
      setIsAdmin(false);
    }
  };
  // --- FIN MISE À JOUR CHECK ADMIN ---

  useEffect(() => {
    checkAuthStatus();
    checkAdminStatus(); // Appel de la nouvelle fonction
  }, []);

  // --- MISE À JOUR : QR Scanner Logic (maintenant avec scanType) ---
  const sendAttendance = async (scannedValue, scanType) => { // 👈 Ajout de scanType
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const fullName = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    if (!token || !userId || !fullName || !email) {
      // Retourne un objet d'erreur si l'utilisateur n'est pas authentifié
      return { success: false, message: "Erreur: informations manquantes ou utilisateur non connecté." };
    }

    try {
      const res = await fetch("https://remet-ai-nate.vercel.app/api/attendance/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          secretCode: scannedValue,
          userId,
          fullName,
          email,
          type: scanType // 👈 ENVOI DU TYPE DE SCAN au backend
        }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Attendance Success:", data);
        // Sauvegarde des informations (comme avant)
        localStorage.setItem('attendanceSessionId', data.data.sessionId || null);
        localStorage.setItem('attendanceClass', data.data.class || null);

        // Retourne un objet de succès
        return { success: true, message: `✅ ${data.message}` };
      } else {
        console.error("Attendance Error:", data);
        // Retourne un objet d'échec
        return { success: false, message: `⚠️ ${data.message}` };
      }

    } catch (error) {
      console.error("Network Error:", error);
      // Retourne un objet d'erreur réseau
      return { success: false, message: "❌ Erreur de connexion au serveur." };
    }
  };
  
  // --- LOGIQUE POUR LE FLUX SCANNER UTILISATEUR/ADMIN (SCAN) ---
  
  // 1. Ouvre le modal de sélection Entrer/Sortir (remplace l'ancien openScanner)
  const openEntryExitModal = () => {
    setShowEntryExitModal(true);
    lockScroll();
  }
  
  // 2. Ferme le modal de sélection
  const closeEntryExitModal = () => {
    setShowEntryExitModal(false);
    unlockScroll();
  }

  // 3. Ouvre le scanner avec le type sélectionné
  const openScannerByType = (type) => {
    setCurrentScanType(type); // Définit 'entry' ou 'exit'
    closeEntryExitModal(); // Ferme le modal de sélection
    setShowScannerModal(true); // Ouvre le scanner
  }

  // 4. Ferme le scanner
  const closeScanner = () => { setShowScannerModal(false); unlockScroll(); };
  
  // openScanner appelle maintenant le modal de sélection pour le SCAN
  const openScanner = openEntryExitModal;
  // --- FIN LOGIQUE SCANNER ---

  // --- NOUVELLE LOGIQUE POUR LA GÉNÉRATION DE QR CODE ADMIN ---
  
  // 1. Ouvre le modal de sélection Entrer/Sortir Admin (pour la génération)
  const openAdminQRSelection = () => {
    if (!isAdmin) return; // Sécurité côté client
    setIsAdminScanTypeModalOpen(true);
    lockScroll();
  };

  // 2. Gère l'ouverture du modal QR Code final après sélection
  const handleGenerateQRCode = (qrType) => {
    if (!isAdmin) return; // Sécurité côté client
    // Générer le code QR. Pour cet exemple, j'utilise un code statique différent par type.
    const qrValue = qrType === 'entry' ? "QR_ENTRANCE_CODE_123" : "QR_EXIT_CODE_456";
    
    setCurrentAdminQRType(qrType); // Sauve le type pour le titre du modal
    setQrCodeData(qrValue);
    setIsAdminScanTypeModalOpen(false); // Ferme le modal de sélection
    setIsQRCodeModalOpen(true); // Ouvre le modal d'affichage du QR Code
    // Pas besoin de lockScroll ici car le modal de sélection l'a déjà fait,
    // mais si vous souhaitez fermer un autre modal avant, c'est mieux:
    // unlockScroll(); // Laissera l'overlay de l'autre modal si non fermé. 
    // On laisse le closeModal du Modal de sélection le faire, ou on le fait ici.
    // Laissez le `AdminQRSelectionModal` s'occuper du `unlockScroll`
  };

  // 3. Ferme le modal d'affichage du QR code généré
  const closeQRCodeModal = () => {
    setIsQRCodeModalOpen(false);
    unlockScroll();
  };
  // --- FIN LOGIQUE GÉNÉRATION QR ADMIN ---


  // Fetch data from backend
  const fetchData = async () => {
    const res = await fetch('https://remet-ai-nate.vercel.app/api/program');
    const programs = await res.json();
    const formatted = {};
    programs.forEach(p => formatted[p.day] = p.sessions);
    setData(formatted);
    if (programs.length > 0) setActiveDay(programs[0].day);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CRUD Handlers (Add, Remove, Update)
  const handleAddDay = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; // Sécurité côté client
    if (!newDayName) return;
    const res = await fetch('https://remet-ai-nate.vercel.app/api/program', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day: newDayName })
    });
    if (res.ok) {
      fetchData();
      setIsAddDayModalOpen(false);
      setNewDayName('');
    }
  };

  const handleRemoveDay = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; // Sécurité côté client
    if (!dayToRemove) return;
    const res = await fetch(`https://remet-ai-nate.vercel.app/api/program/${encodeURIComponent(dayToRemove)}`, { method: 'DELETE' });
    if (res.ok) {
      fetchData();
      setIsRemoveDayModalOpen(false);
      setDayToRemove('');
    }
  };

  const handleSaveNewSession = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; // Sécurité côté client
    const updatedSessions = [...(data[activeDay] || []), newSession];
    const res = await fetch(`https://remet-ai-nate.vercel.app/api/program/${encodeURIComponent(activeDay)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessions: updatedSessions })
    });
    if (res.ok) {
      fetchData();
      setIsAddSessionModalOpen(false);
      setNewSession({ time: '', title: '', ledBy: '', icon: '🎤', type: 'session', id: Date.now() });
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; // Sécurité côté client
    try {
      // Update the sessions array for the current day
      const updatedSessions = data[activeDay].map(sess =>
        sess.id === currentItem.id ? currentItem : sess
      );

      await fetch(`https://remet-ai-nate.vercel.app/api/program/${encodeURIComponent(activeDay)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: updatedSessions })
      });

      setIsItemModalOpen(false);
      fetchData(); // refresh data
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour de la session");
    }
  };


  const handleDeleteItem = async (itemId) => {
    if (!isAdmin) return; // Sécurité côté client
    if (window.confirm("Supprimer cet élément du programme ?")) {
      const updatedSessions = data[activeDay].filter(item => item.id !== itemId);
      await fetch(`https://remet-ai-nate.vercel.app/api/program/${encodeURIComponent(activeDay)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: updatedSessions })
      });
      fetchData();
    }
  };

  const handleNewSessionChange = (e) => {
    const { name, value } = e.target;
    setNewSession(prev => ({ ...prev, [name]: value }));
  };


  const handleOpenUpdate = (session) => {
    if (!isAdmin) return; // Sécurité côté client
    setCurrentItem({ ...session }); // تمرير نسخة من session الحالية
    setIsItemModalOpen(true);
  };


  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value })); // صححت setCurrentSession -> setCurrentItem
  };


  const days = Object.keys(data);
  const programmeData = data[activeDay] || [];


// Dans le composant Programme()

  const handleDownloadQR = () => {
    // Assurez-vous que la référence existe et contient l'élément canvas (qui est le premier enfant de la div)
    const canvasElement = qrCodeRef.current?.querySelector('canvas');

    if (canvasElement) {
      // 1. Convertir le contenu du canvas en image PNG (format data URL)
      const dataUrl = canvasElement.toDataURL('image/png'); 
      
      // 2. Créer un lien temporaire pour déclencher le téléchargement
      const link = document.createElement('a');
      link.href = dataUrl;

      // Définir le nom du fichier à télécharger
      const qrTypeLabel = currentAdminQRType === 'entry' ? 'ENTREE' : 'SORTIE';
      link.download = `QR_Code_${qrTypeLabel}_${Date.now()}.png`;
      
      // 3. Simuler le clic pour lancer le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Erreur: Impossible de trouver l'image du QR code.");
    }
  };

  // NOUVEAU: handleShowQRCode remplacé par la nouvelle logique `openAdminQRSelection`

  return (
    <section className="programme-section">
      {/* Header avec Actions Jours */}
      <div className="prog-header-wrapper">
        <h2 className="programme-title"> Conference Agenda</h2>

        {/* --- ACTIONS ADMIN (CONDITIONNEL) --- */}
        {isAdmin && (
          <div className="prog-day-actions">
            {/* Bouton Add Day */}
            <button className="prog-btn add-day" onClick={() => setIsAddDayModalOpen(true)}>
              <PlusIcon /> Add Day
            </button>

            {/* Bouton Add Session */}
            {days.length > 0 && (
              <button className="prog-btn add-session" onClick={() => setIsAddSessionModalOpen(true)}>
                <ClockIcon /> Add Session
              </button>
            )}

            {/* Bouton Remove Day */}
            {days.length > 0 && (
              <button className="prog-btn remove-day" onClick={() => setIsRemoveDayModalOpen(true)}>
                <MinusIcon /> Remove Day
              </button>
            )}
            
            {/* Bouton pour ouvrir la sélection de QR Code Admin (Génération) */}
           
          </div>
        )}
        {/* --- FIN ACTIONS ADMIN --- */}

      </div>

      {/* Onglets des Jours */}
      <div className="day-tabs-container">
        {days.map((day) => (
          <button
            key={day}
            className={`day-tab-button ${activeDay === day ? 'active' : ''}`}
            onClick={() => setActiveDay(day)}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="timeline-container">
        {programmeData.length > 0 ? programmeData.map((item) => (
          <div key={item.id} className={`programme-item ${item.type}`}>

            <div className="time-marker">
              {item.icon}
            </div>

            <div className="programme-content">
              <span className="item-time">{item.time}</span>
              <div style={{ display: "flex" }}>

                <h3 className="item-title">{item.title}</h3>
              </div>

              {item.ledBy && (
                <p className="item-led-by">
                  {item.ledBy}

                </p>

              )}

              {/* Boutons Update / Remove / QR Code (CONDITIONNEL) */}
              <div className="prog-item-actions">
                {isAdmin && (
                  <>
                    <button className="prog-action-btn update" onClick={() => handleOpenUpdate(item)}>
                      <EditIcon /> Update
                    </button>

                    <button className="prog-action-btn delete" onClick={() => handleDeleteItem(item.id)}>
                      <TrashIcon /> Remove
                    </button>
                  
                    {/* Bouton Generate QR retiré d'ici et mis en haut pour être global (voir section prog-day-actions) */}
                  </>
                )}

                {/* Bouton Scan QR Code (Appelle openEntryExitModal) */}
                <button className="prog-btn add-day scan_qr" style={{}} onClick={openScanner}>
                  <QRIcon /> Scan QR Code
                </button>

 <button className="prog-btn add-day scan_qr" onClick={openAdminQRSelection}>
              <QRIcon /> Generate QR
            </button>

              </div>

            </div>

          </div>
        )) : (
          <div className="no-data-msg">Aucun programme pour ce jour.</div>
        )}
      </div>

      {/* --- MODAL ADD DAY (CONDITIONNEL) --- */}
      {isAdmin && isAddDayModalOpen && (
        <div className="prog-modal-overlay">
          <div className="prog-modal-content">
            <div className="prog-modal-header">
              <h3>Add a Day</h3>
              <button onClick={() => setIsAddDayModalOpen(false)} className="prog-close-btn"><XIcon /></button>
            </div>
            <form onSubmit={handleAddDay}>
              <div className="prog-form-group">
                <label>Day Name (e.g., Day 3)</label>
                <input type="text" value={newDayName} onChange={(e) => setNewDayName(e.target.value)} required />
              </div>
              <div className="prog-modal-actions">
                <button type="submit" className="prog-save-btn">Add</button>
              </div>
            </form>
           </div>
        </div>
      )}

      {/* --- MODAL ADD SESSION (NOUVEAU - CONDITIONNEL) --- */}
      {isAdmin && isAddSessionModalOpen && (
        <div className="prog-modal-overlay">
          <div className="prog-modal-content">
            <div className="prog-modal-header">
              <h3>Add a Session ({activeDay})</h3>
              <button onClick={() => setIsAddSessionModalOpen(false)} className="prog-close-btn"><XIcon /></button>
            </div>
            <form onSubmit={handleSaveNewSession} className="prog-modal-form">
              <div className="prog-form-group">
                <label>Time (e.g., 10:00 - 11:00)</label>
                <input type="text" name="time" value={newSession.time} onChange={handleNewSessionChange} required />
              </div>

              <div className="prog-form-group">
                <label>Session Title</label>
                <input type="text" name="title" value={newSession.title} onChange={handleNewSessionChange} required />
              </div>

              <div className="prog-form-group">
                <label>Session Type (Style)</label>
                <select name="type" value={newSession.type} onChange={handleNewSessionChange} className="prog-select">
                  <option value="SessionPractical ">Session Practical </option>
                  <option value="SessionTheoretical">Session Theoretical</option>
                  <option value="Break">Break</option>
                  <option value="ClosingSession">Closing Session</option>
                  <option value="OpeningSession">Opening Session</option>
                </select>
              </div>

              <div className="prog-form-group">
                <label>Speaker / Info (Optional)</label>
                <input type="text" name="ledBy" value={newSession.ledBy} onChange={handleNewSessionChange} placeholder="e.g., Led by Dr. X" />
              </div>

              <div className="prog-form-group">
                <label>Icon (Emoji)</label>
                <input type="text" name="icon" value={newSession.icon} onChange={handleNewSessionChange} style={{ width: '60px', textAlign: 'center' }} />
              </div>

              <div className="prog-modal-actions">
                <button type="submit" className="prog-save-btn add-session-btn"> Add Session</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL REMOVE DAY (CONDITIONNEL) --- */}
      {isAdmin && isRemoveDayModalOpen && (
        <div className="prog-modal-overlay">
          <div className="prog-modal-content">
            <div className="prog-modal-header">
              <h3>Delete a Day</h3>
              <button onClick={() => setIsRemoveDayModalOpen(false)} className="prog-close-btn"><XIcon /></button>
            </div>
            <form onSubmit={handleRemoveDay}>
              <div className="prog-form-group">
                <label>Select the day to delete</label>
                <select value={dayToRemove} onChange={(e) => setDayToRemove(e.target.value)} required className="prog-select">
                  <option value="">-- Choisir --</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="prog-modal-actions">
                <button type="submit" className="prog-delete-confirm-btn">Permanently Delete</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL UPDATE ITEM (CONDITIONNEL) --- */}
      {isAdmin && isItemModalOpen && currentItem && (
        <div className="prog-modal-overlay">
          <div className="prog-modal-content">
            <div className="prog-modal-header">
              <h3>Edit Session</h3>
              <button onClick={() => setIsItemModalOpen(false)} className="prog-close-btn"><XIcon /></button>
            </div>
            <form onSubmit={handleSaveItem} className="prog-modal-form">
              <div className="prog-form-group">
                <label>Time</label>
                <input
                  type="text"
                  name="time"
                  value={currentItem.time}
                  onChange={handleItemChange}
                  required
                />
              </div>
              <div className="prog-form-group">
                <label>Title  </label>
                <input
                  type="text"
                  name="title"
                  value={currentItem.title}
                  onChange={handleItemChange}
                  required
                />
              </div>
              <div className="prog-form-group">
                <label>Speaker / Info (Optional)</label>
                <input
                  type="text"
                  name="ledBy"
                  value={currentItem.ledBy}
                  onChange={handleItemChange}
                />
              </div>
              <div className="prog-form-group">
                <label>Icon (Emoji)</label>
                <input
                  type="text"
                  name="icon"
                  value={currentItem.icon}
                  onChange={handleItemChange}
                  style={{ width: '60px', textAlign: 'center' }}
                />
              </div>
              <div className="prog-modal-actions">
                <button type="submit" className="prog-save-btn">Mettre à jour</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE SÉLECTION QR ADMIN (GÉNÉRATION) --- */}
      {isAdmin && isAdminScanTypeModalOpen && (
        <AdminQRSelectionModal
          isOpen={isAdminScanTypeModalOpen}
          onClose={() => { setIsAdminScanTypeModalOpen(false); unlockScroll(); }}
          onSelectScan={handleGenerateQRCode} // Appelle la fonction de génération
          EnterIcon={EnterIcon} 
          ExitIcon={ExitIcon}
          XIcon={XIcon}
        />
      )}

      {/* --- MODAL QR CODE (AFFICHAGE DE LA GÉNÉRATION ADMIN) --- */}
      {isAdmin && isQRCodeModalOpen && (
        <div className="prog-modal-overlay">
          <div className="prog-modal-content qr-modal-content">
            <div className="prog-modal-header">
              <h3>QR CODE : {currentAdminQRType === 'entry' ? 'ENTRÉE' : 'SORTIE'}</h3>
              <button onClick={closeQRCodeModal} className="prog-close-btn"><XIcon /></button>
            </div>
            {/* AJOUT DE LA RÉFÉRENCE ICI */}
            <div className="qr-code-container" ref={qrCodeRef}>
              <QRCodeCanvas value={qrCodeData} size={200} level="M" includeMargin={false} className='qr_code_img' />
            </div>
            {/* MISE À JOUR DU BOUTON POUR APPELER handleDownloadQR */}
            <button className='prog-btn add-day' onClick={handleDownloadQR} style={{ margin: "auto" }}>
                Download QR Code
            </button>
          </div>
        </div>
      )}
      
      {/* --- MODAL DE SÉLECTION ENTRER/SORTIR (SCAN UTILISATEUR/ADMIN) --- */}
      {showEntryExitModal && (
        <EntryExitModal
          isOpen={showEntryExitModal}
          onClose={closeEntryExitModal}
          onSelectScan={openScannerByType}
          EnterIcon={EnterIcon} 
          ExitIcon={ExitIcon}
          XIcon={XIcon}
        />
      )}

      {/* --- MODAL SCANNER (Mis à jour avec scanType) --- */}
      {showScannerModal && (
        <QRScannerModal
          isOpen={showScannerModal}
          onClose={closeScanner}
          correctQR={correctQR} 
          onSuccess={sendAttendance}
          scanType={currentScanType} // 👈 PROP AJOUTÉ
        />
      )}


      {/* STYLES CSS (Ajout des styles pour le nouveau modal) */}

          <style>{`

      .prog-header-wrapper {

          display: flex;

          flex-direction: column;

          align-items: center;

          margin-bottom: 30px;

      }

      .prog-day-actions {

          display: flex;

          gap: 15px;

          margin-top: 15px;

          flex-wrap: wrap;

          justify-content: center;

      }

      .prog-btn {

          display: flex; align-items: center; gap: 8px;

          padding: 8px 16px; border-radius: 20px; border: none;

          cursor: pointer; font-weight: 600; font-size: 0.9rem;

          transition: transform 0.2s;

      }

      .prog-btn:hover { transform: scale(1.05); }

     

      .prog-btn.add-day { background: #6366f1; color: white; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }

     

      /* Style distinct pour le bouton Add Session */

      .prog-btn.add-session {

          background: #10b981; /* Vert émeraude */

          color: white;

          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);

      }



      .prog-btn.remove-day { background: rgba(239, 68, 68, 0.1); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.2); }

      .prog-btn.remove-day:hover { background: rgba(239, 68, 68, 0.2); color: white; }



      /* Actions Item (Update/Remove) */



 

      .prog-action-btn.update:hover { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; }

      .prog-action-btn.delete:hover { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }



      /* Modal Styles */

      .prog-modal-overlay {

          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;

          background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(4px);

          z-index: 9999; display: flex; justify-content: center; align-items: center;

      }

      .prog-modal-content {

          background: #1f1f2e; border: 1px solid rgba(255,255,255,0.1);

          width: 90%; max-width: 400px; padding: 25px; border-radius: 16px;

          color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.6);

          animation: fadeIn 0.3s ease;

      }

      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }



      .prog-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }

      .prog-close-btn { background: none; border: none; color: #aaa; cursor: pointer; }

      .prog-close-btn:hover { color: white; }

     

      .prog-form-group { margin-bottom: 15px; text-align: left; }

      .prog-form-group label { display: block; margin-bottom: 6px; color: #ffffffff; font-size: 0.9rem; }

      .prog-form-group input, .prog-select {

          width: 100%; padding: 10px; background: rgba(0,0,0,0.3);

          border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;

          color: white; outline: none; font-family: inherit;

      }

      .prog-select option { background: #1f1f2e; color: white; }



      .prog-modal-actions { display: flex; justify-content: flex-end; margin-top: 20px; }

     

      .prog-save-btn { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; width: 100%; font-weight: bold; }

      .prog-save-btn.add-session-btn { background: #10b981; } /* Bouton vert pour l'ajout */



      .prog-delete-confirm-btn { background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; width: 100%; font-weight: bold; }



      .no-data-msg { text-align: center; color: #aaa; padding: 40px; font-style: italic; }

      `}</style>
    </section>
  );
}