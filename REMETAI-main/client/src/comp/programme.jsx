import React, { useEffect, useState, useRef } from 'react';
import { QRCodeCanvas } from "qrcode.react";
import QRScannerModal from '../comp/QRScannerModal.jsx';
import EntryExitModal from '../comp/EntryExitModal.jsx';
import AuthRequiredModal from '../comp/AuthRequiredModal.jsx';
import API_BASE_URL from '../config';

// --- ICONS (Minimalist Tech Style) ---
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const EditIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const QRIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M21 15h-3a2 2 0 0 0-2 2v3"></path><path d="M16 21v-2a2 2 0 0 0 2-2h3"></path></svg>;
const XIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function Programme() {
  // --- ÉTATS ---
  const [data, setData] = useState({});
  const [activeDay, setActiveDay] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPresenceBtn, setShowPresenceBtn] = useState(false);

  const [activeModal, setActiveModal] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [qrCodeData, setQrCodeData] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [currentScanType, setCurrentScanType] = useState('entry');

  const [newDayName, setNewDayName] = useState('');
  const [dayToRemove, setDayToRemove] = useState('');
  const [newSession, setNewSession] = useState({
    time: '', title: '', ledBy: '', icon: '🎤', type: 'SessionTheoretical',
    attendanceEnabled: true, id: Date.now()
  });

  const qrCodeRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/program`);
      const programs = await res.json();
      const formatted = {};
      programs.forEach(p => formatted[p.day] = p.sessions);
      setData(formatted);
      if (programs.length > 0 && !activeDay) setActiveDay(programs[0].day);
    } catch (error) { console.error("Data error:", error); }
  };

  const checkAdminStatus = async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/role/${encodeURIComponent(email)}`);
      const roleData = await res.json();
      setIsAdmin(roleData.role === 'admin');
    } catch (err) { setIsAdmin(false); }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchData(), checkAdminStatus()]);
      const isLogin = localStorage.getItem('login') === 'true';
      const isWorkshop = localStorage.getItem('WORKSHOP') === 'true';
      setShowPresenceBtn(isLogin && isWorkshop);
      setIsLoading(false);
    };
    init();
  }, []);

  const handleOpenQRSelect = (item) => {
    setSelectedId(item.id);
    setActiveModal('qrSelect');
  };

  const generateFinalQR = (type) => {
    setQrCodeData(`AI_CONF_${selectedId}_${type}`);
    setCurrentScanType(type);
    setActiveModal('qrDisplay');
  };

  const downloadQR = () => {
    const canvas = qrCodeRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `QR_${currentScanType}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // --- CRUD FUNCTIONS ---
  const handleAddDay = async (e) => {
    e.preventDefault();
    if (!isAdmin || !newDayName) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/program`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day: newDayName })
      });
      if (res.ok) {
        await fetchData();
        setActiveModal(null);
        setNewDayName('');
      }
    } catch (err) { alert("Error adding day"); }
  };

  const handleRemoveDay = async (e) => {
    e.preventDefault();
    if (!isAdmin || !dayToRemove) return;
    if (!window.confirm(`Delete ${dayToRemove} and all its sessions?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/program/${encodeURIComponent(dayToRemove)}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        setActiveModal(null);
        setDayToRemove('');
      }
    } catch (err) { alert("Error removing day"); }
  };

  const handleSaveNewSession = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      const updatedSessions = [...(data[activeDay] || []), { ...newSession, id: Date.now() }];
      const res = await fetch(`${API_BASE_URL}/api/program/${encodeURIComponent(activeDay)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: updatedSessions })
      });
      if (res.ok) {
        await fetchData();
        setActiveModal(null);
        setNewSession({ time: '', title: '', ledBy: '', icon: '🎤', type: 'SessionTheoretical', attendanceEnabled: true, id: Date.now() });
      }
    } catch (err) { alert("Error adding session"); }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      const updatedSessions = data[activeDay].map(sess =>
        sess.id === currentItem.id ? currentItem : sess
      );
      const res = await fetch(`${API_BASE_URL}/api/program/${encodeURIComponent(activeDay)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: updatedSessions })
      });
      if (res.ok) {
        await fetchData();
        setActiveModal(null);
      }
    } catch (err) { alert("Error updating session"); }
  };

  const handleDeleteItem = async (itemId) => {
    if (!isAdmin || !window.confirm("Delete this program item?")) return;
    try {
      const updatedSessions = data[activeDay].filter(item => item.id !== itemId);
      const res = await fetch(`${API_BASE_URL}/api/program/${encodeURIComponent(activeDay)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: updatedSessions })
      });
      if (res.ok) fetchData();
    } catch (err) { alert("Error deleting session"); }
  };

  // --- SCAN LOGIC ---
  const handleRedirectToAuth = (type) => {
    setActiveModal(null);
    unlockScroll();
    if (type === 'register') window.dispatchEvent(new Event('open-register-modal'));
    else if (type === 'login') window.dispatchEvent(new Event('open-login-modal'));
  };

  const openScanner = async (item) => {
    const isUserLoggedIn = localStorage.getItem('login') === 'true';
    const userEmail = localStorage.getItem('userEmail');

    if (!isUserLoggedIn) {
      setActiveModal('authRequired');
      return;
    }

    if (userEmail) {
      try {
        const encodedEmail = encodeURIComponent(userEmail);
        const registrationRes = await fetch(`${API_BASE_URL}/api/check-registration/${encodedEmail}`);
        const registrationData = await registrationRes.json();

        if (!registrationRes.ok || registrationData.registered === false) {
          window.dispatchEvent(new Event('open-workshop-modal'));
          return;
        }
      } catch (error) {
        window.dispatchEvent(new Event('open-workshop-modal'));
        return;
      }
    }

    setSelectedId(item.id);
    setActiveModal('entryExit');
  };

  const openScannerByType = (type) => {
    setCurrentScanType(type);
    setActiveModal('scanner'); // This will close entryExit and open scanner
  };

  const handleScanSuccess = async (scannedValue, scanType) => {
    try {
      const payload = {
        userId: localStorage.getItem("userId"),
        fullName: localStorage.getItem("userName"),
        email: localStorage.getItem("userEmail"),
        sessionId: scannedValue.replace(/\D/g, ""), // Extract numeric ID
        type: scanType
      };

      const res = await fetch(`${API_BASE_URL}/api/attendance/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      return { success: res.ok, message: result.message };
    } catch (err) {
      return { success: false, message: "Server connection error" };
    }
  };

  const lockScroll = () => { document.body.style.overflow = 'hidden'; };
  const unlockScroll = () => { document.body.style.overflow = 'auto'; };

  // PDF Export Handler
  const handleExportPDF = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/export-pdf`);

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || 'Error generating PDF');
        return;
      }

      // Create blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `REMET-AI-2026-Attendance-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to export PDF');
    }
  };

  const days = Object.keys(data);
  const programmeData = data[activeDay] || [];

  return (
    <section className="prog-page-wrapper">
      <style>{cssStyles}</style>

      <div className="prog-main-container">
        {/* HEADER SECTION */}
        <header className="prog-header">
          <div className="prog-title-group">
            <span className="prog-badge">REMET-AI</span>
            <h1 className="prog-main-title">Workshop's Program</h1>
            <p className="prog-desc">Discover the sessions, workshops, and conferences..</p>
          </div>

          {isAdmin && (
            <div className="prog-admin-actions">
              <button className="prog-btn-secondary" onClick={() => setActiveModal('addDay')}>
                <PlusIcon /> Day
              </button>
              <button className="prog-btn-primary" onClick={() => setActiveModal('addSession')}>
                <PlusIcon /> Session
              </button>
              <button className="prog-btn-secondary" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }} onClick={() => setActiveModal('removeDay')}>
                <TrashIcon /> Delete Day
              </button>
              <button className="prog-btn-secondary" style={{ backgroundColor: '#dcfce7', color: '#16a34a', borderColor: '#16a34a' }} onClick={handleExportPDF}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export PDF
              </button>
            </div>
          )}
        </header>

        {/* DAY SELECTOR */}
        <nav className="prog-tabs">
          {days.map(day => (
            <button
              key={day}
              className={`prog-tab-item ${activeDay === day ? 'active' : ''}`}
              onClick={() => setActiveDay(day)}
            >
              {day}
            </button>
          ))}
        </nav>

        {/* TIMELINE CONTENT */}
        <div className="prog-content">
          {isLoading ? (
            <div className="prog-loading">Chargement du programme...</div>
          ) : programmeData.length > 0 ? (
            programmeData.map((item) => (
              <div key={item.id} className="prog-card">
                <div className="prog-card-time">
                  <span className="time-badge">{item.time}</span>
                  <div className="time-line"></div>
                </div>

                <div className="prog-card-main">
                  <div className="prog-card-top">
                    <span className="prog-type-label">{item.type}</span>
                    {isAdmin && (
                      <div className="prog-admin-tools">
                        <button className="tool-btn" onClick={() => { setCurrentItem(item); setActiveModal('editSession'); }}><EditIcon /></button>
                        <button className="tool-btn danger" onClick={() => handleDeleteItem(item.id)}><TrashIcon /></button>
                      </div>
                    )}
                  </div>

                  <h3 className="prog-session-title">{item.title}</h3>
                  {item.ledBy && <p className="prog-session-lead">Led by : <strong>{item.ledBy}</strong></p>}

                  {item.attendanceEnabled && (
                    <div className="prog-card-footer">
                      {showPresenceBtn && (
                        <button className="prog-scan-btn" onClick={() => openScanner(item)}>
                          <QRIcon /> Scan QR
                        </button>
                      )}
                      {isAdmin && (
                        <button className="prog-qr-btn" onClick={() => handleOpenQRSelect(item)}>
                          <QRIcon /> Manage QR
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="prog-empty">No session scheduled for today.</div>
          )}
        </div>
      </div>

      {/* --- ADD DAY MODAL --- */}
      {activeModal === 'addDay' && (
        <div className="prog-overlay" onClick={() => setActiveModal(null)}>
          <div className="prog-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Day</h3>
              <button onClick={() => setActiveModal(null)}><XIcon /></button>
            </div>
            <form onSubmit={handleAddDay} className="prog-modal-form">
              <div className="prog-form-group">
                <label>Day Name (e.g., Day 3)</label>
                <input type="text" value={newDayName} onChange={(e) => setNewDayName(e.target.value)} required placeholder="Day 3" />
              </div>
              <button type="submit" className="prog-btn-primary full">Add Day</button>
            </form>
          </div>
        </div>
      )}

      {/* --- REMOVE DAY MODAL --- */}
      {activeModal === 'removeDay' && (
        <div className="prog-overlay" onClick={() => setActiveModal(null)}>
          <div className="prog-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete a Day</h3>
              <button onClick={() => setActiveModal(null)}><XIcon /></button>
            </div>
            <form onSubmit={handleRemoveDay} className="prog-modal-form">
              <div className="prog-form-group">
                <label>Select day to remove</label>
                <select value={dayToRemove} onChange={(e) => setDayToRemove(e.target.value)} required className="prog-select">
                  <option value="">-- Choose Day --</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <button type="submit" className="prog-btn-primary full" style={{ backgroundColor: '#ef4444' }}>Permanently Delete</button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD SESSION MODAL --- */}
      {activeModal === 'addSession' && (
        <div className="prog-overlay" onClick={() => setActiveModal(null)}>
          <div className="prog-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Session ({activeDay})</h3>
              <button onClick={() => setActiveModal(null)}><XIcon /></button>
            </div>
            <form onSubmit={handleSaveNewSession} className="prog-modal-form">
              <div className="prog-form-group">
                <label>Time Slot</label>
                <input type="text" placeholder="10:00 - 11:30" value={newSession.time} onChange={e => setNewSession({ ...newSession, time: e.target.value })} required />
              </div>
              <div className="prog-form-group">
                <label>Title</label>
                <input type="text" placeholder="AI Fundamentals" value={newSession.title} onChange={e => setNewSession({ ...newSession, title: e.target.value })} required />
              </div>
              <div className="prog-form-group">
                <label>Type</label>
                <select value={newSession.type} onChange={e => setNewSession({ ...newSession, type: e.target.value })}>
                  <option value="SessionPractical">Practical Session</option>
                  <option value="SessionTheoretical">Theoretical Session</option>
                  <option value="Break">Break</option>
                  <option value="OpeningSession">Opening Session</option>
                  <option value="ClosingSession">Closing Session</option>
                </select>
              </div>
              <div className="prog-form-group">
                <label>Led By</label>
                <input type="text" placeholder="Dr. Sarah Chen" value={newSession.ledBy} onChange={e => setNewSession({ ...newSession, ledBy: e.target.value })} />
              </div>
              <div className="prog-form-group checkbox-group">
                <input type="checkbox" id="add-att" checked={newSession.attendanceEnabled} onChange={e => setNewSession({ ...newSession, attendanceEnabled: e.target.checked })} />
                <label htmlFor="add-att">Enable QR Attendance</label>
              </div>
              <button type="submit" className="prog-btn-primary full">Create Session</button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT SESSION MODAL --- */}
      {activeModal === 'editSession' && currentItem && (
        <div className="prog-overlay" onClick={() => setActiveModal(null)}>
          <div className="prog-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Session</h3>
              <button onClick={() => setActiveModal(null)}><XIcon /></button>
            </div>
            <form onSubmit={handleSaveItem} className="prog-modal-form">
              <div className="prog-form-group">
                <label>Time Slot</label>
                <input type="text" value={currentItem.time} onChange={e => setCurrentItem({ ...currentItem, time: e.target.value })} required />
              </div>
              <div className="prog-form-group">
                <label>Title</label>
                <input type="text" value={currentItem.title} onChange={e => setCurrentItem({ ...currentItem, title: e.target.value })} required />
              </div>
              <div className="prog-form-group">
                <label>Type</label>
                <select value={currentItem.type} onChange={e => setCurrentItem({ ...currentItem, type: e.target.value })}>
                  <option value="SessionPractical">Practical Session</option>
                  <option value="SessionTheoretical">Theoretical Session</option>
                  <option value="Break">Break</option>
                  <option value="OpeningSession">Opening Session</option>
                  <option value="ClosingSession">Closing Session</option>
                </select>
              </div>
              <div className="prog-form-group">
                <label>Led By</label>
                <input type="text" value={currentItem.ledBy} onChange={e => setCurrentItem({ ...currentItem, ledBy: e.target.value })} />
              </div>
              <div className="prog-form-group checkbox-group">
                <input type="checkbox" id="edit-att" checked={currentItem.attendanceEnabled} onChange={e => setCurrentItem({ ...currentItem, attendanceEnabled: e.target.checked })} />
                <label htmlFor="edit-att">Enable QR Attendance</label>
              </div>
              <button type="submit" className="prog-btn-primary full">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* --- QR SELECTION MODAL --- */}
      {activeModal === 'qrSelect' && (
        <div className="prog-overlay" onClick={() => setActiveModal(null)}>
          <div className="prog-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>QR Code Type</h3>
              <button onClick={() => setActiveModal(null)}><XIcon /></button>
            </div>
            <div className="modal-grid">
              <button className="modal-choice-btn" onClick={() => generateFinalQR('entry')}>Entry Code</button>
              <button className="modal-choice-btn" onClick={() => generateFinalQR('exit')}>Exit Code</button>
            </div>
          </div>
        </div>
      )}

      {/* --- QR DISPLAY MODAL --- */}
      {activeModal === 'qrDisplay' && (
        <div className="prog-overlay" onClick={() => setActiveModal(null)}>
          <div className="prog-modal qr-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>QR Code Generated</h3>
              <button onClick={() => setActiveModal(null)}><XIcon /></button>
            </div>
            <div className="qr-container" ref={qrCodeRef}>
              <QRCodeCanvas value={qrCodeData} size={200} />
              <p className="qr-info">{currentScanType === 'entry' ? 'ENTRY' : 'EXIT'}</p>
            </div>
            <button className="prog-btn-primary full" onClick={downloadQR}>Download QR Code</button>
          </div>
        </div>
      )}

      {/* --- ENTRY/EXIT MODAL (STUDENT) --- */}
      {activeModal === 'entryExit' && (
        <EntryExitModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onSelectScan={openScannerByType}
          EnterIcon={() => '📥'}
          ExitIcon={() => '📤'}
          XIcon={XIcon}
        />
      )}

      {/* --- SCANNER MODAL --- */}
      {activeModal === 'scanner' && (
        <QRScannerModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          correctQR={`AI_CONF_${selectedId}_${currentScanType}`}
          onSuccess={handleScanSuccess}
          scanType={currentScanType}
        />
      )}

      {/* --- AUTH REQUIRED MODAL --- */}
      {activeModal === 'authRequired' && (
        <AuthRequiredModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onRedirectToAuth={handleRedirectToAuth}
          XIcon={XIcon}
        />
      )}
    </section>
  );
}

const cssStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    .prog-page-wrapper {
        background-color: #f8fafc;
        min-height: 100vh;
        padding: 40px 20px;
        font-family: 'Inter', sans-serif;
        color: #1e293b;
    }

    .prog-main-container {
        max-width: 850px;
        margin: 0 auto;
    }

    /* Header */
    .prog-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 40px;
    }

    .prog-badge {
        background: #e0e7ff;
        color: #4338ca;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        display: inline-block;
        margin-bottom: 12px;
    }

    .prog-main-title {
        font-size: 2.2rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        margin: 0;
    }

    .prog-desc {
        color: #64748b;
        margin-top: 5px;
    }

    /* Buttons */
    .prog-admin-actions { display: flex; gap: 10px; }
    
    .prog-btn-primary {
        background: #2563eb;
        color: white;
        border: none;
        padding: 10px 18px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: 0.2s;
    }

    .prog-btn-secondary {
        background: white;
        color: #1e293b;
        border: 1px solid #e2e8f0;
        padding: 10px 18px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
    }

    /* Tabs */
    .prog-tabs {
        display: flex;
        gap: 10px;
        background: #f1f5f9;
        padding: 6px;
        border-radius: 14px;
        margin-bottom: 35px;
    }

    .prog-tab-item {
        flex: 1;
        padding: 10px;
        border: none;
        background: transparent;
        border-radius: 10px;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
        transition: 0.2s;
    }

    .prog-tab-item.active {
        background: white;
        color: #2563eb;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    /* Timeline Cards */
    .prog-card {
        display: flex;
        gap: 20px;
        margin-bottom: 25px;
    }

    .prog-card-time {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 80px;
    }

    .time-badge {
        font-weight: 700;
        color: #1e293b;
        font-size: 0.95rem;
    }

    .time-line {
        width: 2px;
        flex: 1;
        background: #e2e8f0;
        margin: 10px 0;
    }

    .prog-card-main {
        flex: 1;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        padding: 24px;
        transition: 0.3s;
    }

    .prog-card-main:hover {
        border-color: #cbd5e1;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.04);
    }

    .prog-card-top {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
    }

    .prog-type-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #6366f1;
        letter-spacing: 0.05em;
    }

    .prog-session-title {
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0 0 8px 0;
    }

    .prog-session-lead {
        color: #64748b;
        font-size: 0.95rem;
    }

    .prog-card-footer {
        margin-top: 20px;
        display: flex;
        gap: 10px;
    }

    .prog-scan-btn {
        background: #10b981;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center; gap: 8px;
    }

    .prog-qr-btn {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center; gap: 8px;
    }

    .tool-btn {
        background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px;
    }

    .tool-btn.danger:hover { color: #ef4444; }

    /* Modal */
    .prog-overlay {
        position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); 
        backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000;
    }

    .prog-modal {
        background: white; border-radius: 24px; padding: 30px; width: 90%; max-width: 400px;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }

    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;}
    .modal-header h3 { margin: 0; font-size: 1.2rem; }
    .modal-header button { background: none; border: none; cursor: pointer; color: #94a3b8; }

    .modal-grid { display: flex; flex-direction: column; gap: 10px; }
    .modal-choice-btn {
        padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: white;
        font-weight: 600; cursor: pointer; text-align: left; transition: 0.2s;
    }
    .modal-choice-btn:hover { background: #f8fafc; border-color: #2563eb; color: #2563eb; }

    .qr-container {
        text-align: center; background: #f8fafc; padding: 30px; border-radius: 16px; margin-bottom: 20px;
    }
    .qr-info { font-weight: 800; color: #1e293b; margin-top: 15px; letter-spacing: 2px; }
    .prog-btn-primary.full { width: 100%; justify-content: center; padding: 14px; }

    /* Forms */
    .prog-modal-form { display: flex; flex-direction: column; gap: 18px; }
    .prog-form-group { display: flex; flex-direction: column; gap: 6px; }
    .prog-form-group label { font-size: 0.85rem; font-weight: 600; color: #64748b; }
    .prog-form-group input, .prog-select {
        padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; outline: none;
    }
    .prog-form-group input:focus { border-color: #2563eb; }
    
    .checkbox-group { flex-direction: row; align-items: center; gap: 10px; cursor: pointer; }
    .checkbox-group input { width: 18px; height: 18px; cursor: pointer; }
    .checkbox-group label { color: #1e293b; font-size: 0.9rem; cursor: pointer; }

    .qr-modal { max-width: 450px; }
`;