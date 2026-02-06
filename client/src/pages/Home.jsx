import React, { useState, useEffect } from 'react';
import Navbar from '../comp/navbar.jsx';
import Hero_main from '../comp/hero_main.jsx';
import Speakers from '../comp/speakers.jsx';
import Programme from '../comp/programme.jsx';
import Footer from '../comp/Footer.jsx';
import About from '../comp/about.jsx';
import KEY_SESSIONS from '../comp/KEY_SESSIONS.jsx';
import VisitCounter from '../comp/VisitCounter.jsx';

export default function Home() {
  // --- States ---
  const [showPresenceBtn, setShowPresenceBtn] = useState(false);
  const [showWorkshopModal, setShowWorkshopModal] = useState(false);

  // Note: 'correctQR' is likely not needed on frontend anymore if the backend validates it, 
  // but we keep it here if your Modal uses it for UI checks.

  // --- Scroll Helpers ---
  const lockScroll = () => { document.body.style.overflow = 'hidden'; };
  const unlockScroll = () => { document.body.style.overflow = 'auto'; };

  // --- Workshop Modal Handlers ---
  const openWorkshop = () => { setShowWorkshopModal(true); lockScroll(); };
  const closeWorkshop = () => { setShowWorkshopModal(false); unlockScroll(); };

  // 🌟 Registration Status 🌟
  const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);

  // --- Auth Check ---
  const checkAuthStatus = () => {
    const isLogin = localStorage.getItem('login') === 'true';
    const isWorkshop = localStorage.getItem('WORKSHOP') === 'true';

    if (isLogin && isWorkshop) {
      setShowPresenceBtn(true);
    } else {
      setShowPresenceBtn(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();

    // Fetch Registration Settings
    const fetchSettings = async () => {
      try {
        const API_BASE_URL = 'http://localhost:3000'; // Or import from config
        const response = await fetch(`${API_BASE_URL}/api/settings/workshop_registration`);
        const data = await response.json();
        // Check if value is FALSE (meaning disabled)
        if (data.value === false) {
          setIsRegistrationClosed(true);
        } else {
          setIsRegistrationClosed(false);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, []);



  return (
    <>
      <Navbar
        isWorkshopOpen={showWorkshopModal}
        onOpenWorkshop={openWorkshop}
        onCloseWorkshop={closeWorkshop}
        onAuthUpdate={checkAuthStatus}
        isRegistrationClosed={isRegistrationClosed}
      />

      <Hero_main
        onRegisterClick={openWorkshop}
        isRegistrationClosed={isRegistrationClosed}
      />

      <section id="about"><About /></section>
      <section id="speakers"><Speakers /></section>
      <section id="key-sessions"><KEY_SESSIONS /></section>
      <section id="program"><Programme /></section>
      <VisitCounter />
      <Footer />


      {showPresenceBtn && (
        <a href="#program">

          <button className="floating-presence-btn">
            <div className="tag-pulse" style={{ position: 'static' }}></div>
            <span className="scan-icon"></span> Attendance
          </button>
        </a>

      )}




    </>
  );
}


