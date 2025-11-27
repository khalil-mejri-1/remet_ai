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
      {/* {showPresenceBtn && (
        <button className="floating-presence-btn" onClick={openScanner}>
          <span className="scan-icon">📷</span> Présence
        </button>
      )} */}
           {showPresenceBtn && (
            <a href="#program">

                <button className="floating-presence-btn" >
          <span className="scan-icon">📷</span> Présence
        </button>
            </a>
      
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