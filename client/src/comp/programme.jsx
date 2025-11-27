

import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from "qrcode.react";
import QRScannerModal from '../comp/QRScannerModal.jsx'; 

// --- ICONS ---
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const XIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const MinusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const ClockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const QRIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M21 15h-3a2 2 0 0 0-2 2v3"></path><path d="M16 21v-2a2 2 0 0 0 2-2h3"></path></svg>;
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
const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false); // NOUVEAU
  const [qrCodeData, setQrCodeData] = useState(''); // NOUVEAU pour stocker les données du QR


   const [showPresenceBtn, setShowPresenceBtn] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [showWorkshopModal, setShowWorkshopModal] = useState(false);
    const [name, setName] = useState(""); 
  
    // Note: 'correctQR' is likely not needed on frontend anymore if the backend validates it, 
    // but we keep it here if your Modal uses it for UI checks.
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
  
    useEffect(() => {
      checkAuthStatus();
    }, []);
  
    // --- QR Scanner Logic (FIXED) ---
  const sendAttendance = async (scannedValue) => {
      const token = localStorage.getItem('token'); 
      const userId = localStorage.getItem('userId');
      const fullName = localStorage.getItem('username'); 
      const email = localStorage.getItem('email');
  
      if (!token || !userId || !fullName || !email) {
          alert("Erreur: informations manquantes ou utilisateur non connecté.");
          return;
      }
  
      try {
          const res = await fetch("https://remet-ai-yudu.vercel.app/api/attendance/scan", { 
              method: "POST",
              headers: { 
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ 
                  secretCode: scannedValue,
                  userId,
                  fullName,
                  email
              }),
          });
  
          const data = await res.json();
  
          if (res.ok) {
              console.log("Attendance Success:", data);
              // Save info to localStorage
              localStorage.setItem('attendanceSessionId', data.data.sessionId || null);
              localStorage.setItem('attendanceClass', data.data.class || null);
  
              alert(`✅ ${data.message}`);
              setShowScannerModal(false); 
              unlockScroll();
          } else {
              console.error("Attendance Error:", data);
              alert(`⚠️ ${data.message}`);
          }
  
      } catch (error) {
          console.error("Network Error:", error);
          alert("❌ Erreur de connexion au serveur.");
      }
  };
  
  
    const openScanner = () => { setShowScannerModal(true); lockScroll(); };
    const closeScanner = () => { setShowScannerModal(false); unlockScroll(); };
  




  // Fetch data from backend
  const fetchData = async () => {
    const res = await fetch('http://localhost:3000/api/program');
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
    if (!newDayName) return;
    const res = await fetch('http://localhost:3000/api/program', {
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
    if (!dayToRemove) return;
    const res = await fetch(`http://localhost:3000/api/program/${encodeURIComponent(dayToRemove)}`, { method: 'DELETE' });
    if (res.ok) {
      fetchData();
      setIsRemoveDayModalOpen(false);
      setDayToRemove('');
    }
  };

  const handleSaveNewSession = async (e) => {
    e.preventDefault();
    const updatedSessions = [...(data[activeDay] || []), newSession];
    const res = await fetch(`http://localhost:3000/api/program/${encodeURIComponent(activeDay)}`, {
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
    try {
      // Update the sessions array for the current day
      const updatedSessions = data[activeDay].map(sess =>
        sess.id === currentItem.id ? currentItem : sess
      );

      await fetch(`http://localhost:3000/api/program/${encodeURIComponent(activeDay)}`, {
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
    if (window.confirm("Supprimer cet élément du programme ?")) {
      const updatedSessions = data[activeDay].filter(item => item.id !== itemId);
      await fetch(`http://localhost:3000/api/program/${encodeURIComponent(activeDay)}`, {
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
  setCurrentItem({ ...session }); // تمرير نسخة من session الحالية
  setIsItemModalOpen(true);
};


const handleItemChange = (e) => {
  const { name, value } = e.target;
  setCurrentItem(prev => ({ ...prev, [name]: value })); // صححت setCurrentSession -> setCurrentItem
};


  const days = Object.keys(data);
  const programmeData = data[activeDay] || [];


  // NOUVEAU: Gère l'ouverture du modal QR Code
const handleShowQRCode = (item) => {
  // Construire la chaîne de données pour le QR Code. Ex: Titre, Heure, Intervenant
  const qrData = `Session: ${item.title} - Heure: ${item.time} - Intervenant: ${item.ledBy || 'N/A'} - Jour: ${activeDay}`;
  setQrCodeData(qrData);
  setIsQRCodeModalOpen(true);
};


  return (
    <section className="programme-section">
      {/* Header avec Actions Jours */}
      <div className="prog-header-wrapper">
        <h2 className="programme-title">📅 Agenda de la Conférence</h2>

        <div className="prog-day-actions">
          {/* Bouton Add Day */}
          <button className="prog-btn add-day" onClick={() => setIsAddDayModalOpen(true)}>
            <PlusIcon /> Add Day
          </button>

          {/* NOUVEAU: Bouton Add Session */}
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
        </div>
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
              <div style={{display:"flex"}}>

                       <h3 className="item-title">{item.title}</h3>      
              </div>
       
              {item.ledBy && (
                <p className="item-led-by">
                  {item.ledBy}
         
                </p>
                
              )}

              {/* Boutons Update / Remove pour chaque item */}
              <div className="prog-item-actions">
                <button className="prog-action-btn update" onClick={() => handleOpenUpdate(item)}>
                  <EditIcon /> Update
                </button>

                <button className="prog-action-btn delete" onClick={() => handleDeleteItem(item.id)}>
                  <TrashIcon /> Remove
                </button>
 <button className="prog-btn add-day" style={{}} onClick={() => handleShowQRCode(item)}>
                  <QRIcon /> QR Code
                </button>

              <button className="prog-btn add-day" style={{}} onClick={openScanner}>
                  <QRIcon /> Scan QR Code
                </button>
  
                
              </div>
  
            </div>

          </div>
        )) : (
          <div className="no-data-msg">Aucun programme pour ce jour.</div>
        )}
      </div>

      {/* --- MODAL ADD DAY --- */}
      {isAddDayModalOpen && (
        <div className="prog-modal-overlay">
          <div className="prog-modal-content">
            <div className="prog-modal-header">
              <h3>Ajouter une Journée</h3>
              <button onClick={() => setIsAddDayModalOpen(false)} className="prog-close-btn"><XIcon /></button>
            </div>
            <form onSubmit={handleAddDay}>
              <div className="prog-form-group">
                <label>Nom du jour (ex: Jour 3)</label>
                <input type="text" value={newDayName} onChange={(e) => setNewDayName(e.target.value)} required />
              </div>
              <div className="prog-modal-actions">
                <button type="submit" className="prog-save-btn">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL ADD SESSION (NOUVEAU) --- */}
      {isAddSessionModalOpen && (
        <div className="prog-modal-overlay">
          <div className="prog-modal-content">
            <div className="prog-modal-header">
              <h3>Ajouter une Session ({activeDay})</h3>
              <button onClick={() => setIsAddSessionModalOpen(false)} className="prog-close-btn"><XIcon /></button>
            </div>
            <form onSubmit={handleSaveNewSession} className="prog-modal-form">
              <div className="prog-form-group">
                <label>Horaire (ex: 10:00 - 11:00)</label>
                <input type="text" name="time" value={newSession.time} onChange={handleNewSessionChange} required />
              </div>

              <div className="prog-form-group">
                <label>Titre de la session</label>
                <input type="text" name="title" value={newSession.title} onChange={handleNewSessionChange} required />
              </div>

              <div className="prog-form-group">
                <label>Type de session (Style)</label>
                <select name="type" value={newSession.type} onChange={handleNewSessionChange} className="prog-select">
                  <option value="SessionPractical ">Session Practical </option>
                  <option value="SessionTheoretical">Session Theoretical</option>
                  <option value="Break">Break</option>
                  <option value="ClosingSession">Closing Session</option>
                  <option value="OpeningSession">Opening Session</option>
                </select>
              </div>

              <div className="prog-form-group">
                <label>Intervenant / Info (Optionnel)</label>
                <input type="text" name="ledBy" value={newSession.ledBy} onChange={handleNewSessionChange} placeholder="ex: Dirigé par Dr. X" />
              </div>

              <div className="prog-form-group">
                <label>Icône (Emoji)</label>
                <input type="text" name="icon" value={newSession.icon} onChange={handleNewSessionChange} style={{ width: '60px', textAlign: 'center' }} />
              </div>

              <div className="prog-modal-actions">
                <button type="submit" className="prog-save-btn add-session-btn">Ajouter la Session</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL REMOVE DAY --- */}
      {isRemoveDayModalOpen && (
        <div className="prog-modal-overlay">
          <div className="prog-modal-content">
            <div className="prog-modal-header">
              <h3>Supprimer une Journée</h3>
              <button onClick={() => setIsRemoveDayModalOpen(false)} className="prog-close-btn"><XIcon /></button>
            </div>
            <form onSubmit={handleRemoveDay}>
              <div className="prog-form-group">
                <label>Sélectionner le jour à supprimer</label>
                <select value={dayToRemove} onChange={(e) => setDayToRemove(e.target.value)} required className="prog-select">
                  <option value="">-- Choisir --</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="prog-modal-actions">
                <button type="submit" className="prog-delete-confirm-btn">Supprimer définitivement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL UPDATE ITEM --- */}
 {isItemModalOpen && currentItem && (
  <div className="prog-modal-overlay">
    <div className="prog-modal-content">
      <div className="prog-modal-header">
        <h3>Modifier la Session</h3>
        <button onClick={() => setIsItemModalOpen(false)} className="prog-close-btn"><XIcon /></button>
      </div>
      <form onSubmit={handleSaveItem} className="prog-modal-form">
        <div className="prog-form-group">
          <label>Horaire</label>
          <input
            type="text"
            name="time"
            value={currentItem.time}
            onChange={handleItemChange}
            required
          />
        </div>
        <div className="prog-form-group">
          <label>Titre</label>
          <input
            type="text"
            name="title"
            value={currentItem.title}
            onChange={handleItemChange}
            required
          />
        </div>
        <div className="prog-form-group">
          <label>Intervenant / Info (Optionnel)</label>
          <input
            type="text"
            name="ledBy"
            value={currentItem.ledBy}
            onChange={handleItemChange}
          />
        </div>
        <div className="prog-form-group">
          <label>Icône (Emoji)</label>
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

{/* --- MODAL QR CODE (NOUVEAU) --- */}
{isQRCodeModalOpen && (
  programmeData.map(item => (
        <div className="prog-modal-overlay"  key={item.id}>
          <div className="prog-modal-content qr-modal-content">
            <div className="prog-modal-header">
              <h3>QR CODE</h3> {/* Titre demandé */}
              <button onClick={() => setIsQRCodeModalOpen(false)} className="prog-close-btn"><XIcon /></button>
            </div>
            {/* {
              item.id
            } */}
            <div className="qr-code-container">
              
                    <QRCodeCanvas value= {item.id.toString()} size={200} level="M" includeMargin={false} className='qr_code_img' />
       
            </div>
            <button className='prog-btn add-day' style={{margin:"auto"}}>download</button>
          </div>
        </div>
        ))
      )}


  {showScannerModal && (
        <QRScannerModal 
            isOpen={showScannerModal}
            onClose={closeScanner}
            correctQR={correctQR} // Pass this if you want pre-validation in Modal, otherwise backend handles it
            onSuccess={sendAttendance} 
        />
      )}


      {/* STYLES CSS */}
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
        .prog-item-actions {
            display: flex; gap: 10px; margin-top: 15px; padding-top: 10px;
            border-top: 1px dashed rgba(255,255,255,0.1);
        }
        .prog-action-btn {
            padding: 6px 12px; border-radius: 6px; border: 1px solid transparent;
            cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; gap: 5px;
            background: rgba(255,255,255,0.05); color: #ccc; transition: all 0.2s;
        }
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
        .prog-form-group label { display: block; margin-bottom: 6px; color: #ccc; font-size: 0.9rem; }
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
