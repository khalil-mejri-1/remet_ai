import React, { useState, useEffect } from 'react';
import Navbar from '../comp/navbar.jsx';
import Hero_main from '../comp/hero_main.jsx';
import Speakers from '../comp/speakers.jsx';
import Programme from '../comp/programme.jsx';
import Footer from '../comp/Footer.jsx';
import About from '../comp/about.jsx';
import KEY_SESSIONS from '../comp/KEY_SESSIONS.jsx';
import QRScannerModal from '../comp/QRScannerModal.jsx'; 

export default function Home() {
  // --- States ---
  const [showPresenceBtn, setShowPresenceBtn] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showWorkshopModal, setShowWorkshopModal] = useState(false);
  const [name, setName] = useState(""); 

  // Note: 'correctQR' is likely not needed on frontend anymore if the backend validates it, 
  // but we keep it here if your Modal uses it for UI checks.
  const correctQR = "MY_SECRET_QR"; 

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
    
    // 1. Get the Token
    const token = localStorage.getItem('token'); 
    if (!token) {
        alert("Erreur: Vous n'êtes pas connecté (Token manquant).");
        return;
    }

    try {
      // 2. Call the Backend API
      // Ensure the port (3000 or 5000) matches your running server
      const res = await fetch("http://localhost:3000/api/attendance/scan", { 
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Send Token for AuthMiddleware
        },
        body: JSON.stringify({ secretCode: scannedValue }), // Send the scanned QR code
      });

      const data = await res.json();

      if (res.ok) {
          // 3. Success Case
          console.log("Attendance Success:", data);
          alert(`✅ ${data.message}`); // Show Success Message
          setShowScannerModal(false); 
          unlockScroll();
      } else {
          // 4. Error Case (Invalid QR or Already Scanned)
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

  return (
    <>
      <Navbar 
        isWorkshopOpen={showWorkshopModal}
        onOpenWorkshop={openWorkshop}
        onCloseWorkshop={closeWorkshop}
        onAuthUpdate={checkAuthStatus} 
      />

      <Hero_main onRegisterClick={openWorkshop} />

      <section id="about"><About /></section>
      <section id="speakers"><Speakers /></section>
      <section id="key-sessions"><KEY_SESSIONS /></section>
      <section id="program"><Programme /></section>
      <Footer />

      {/* --- Presence Button --- */}
      {showPresenceBtn && (
        <button className="floating-presence-btn" onClick={openScanner}>
          <span className="scan-icon">📷</span> Présence
        </button>
      )}

      {showScannerModal && (
        <QRScannerModal 
            isOpen={showScannerModal}
            onClose={closeScanner}
            correctQR={correctQR} // Pass this if you want pre-validation in Modal, otherwise backend handles it
            onSuccess={sendAttendance} 
        />
      )}
    </>
  );
}