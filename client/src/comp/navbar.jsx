import React, { useState, useEffect } from 'react';
import logo from "../img/logo.png";
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiLayout, FiUsers, FiCheckSquare, FiCheckCircle, FiLink } from "react-icons/fi";
import { auth, getRedirectResult } from '../firebase'; // Import firebase auth
import API_BASE_URL from '../config';
import LiveStreamManagement from './LiveStreamManagement'; // Import Admin Component
const ROLE_API_URL = `${API_BASE_URL}/api/user/role/`;

export default function Navbar({ isWorkshopOpen, onOpenWorkshop, onCloseWorkshop, onAuthUpdate, isRegistrationClosed }) {
  const navigate = useNavigate();
  // --- UI States ---
  const [isOpen, setIsOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null); // 'login' | 'register' | null
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false); // 🌟 New Live Stream Admin Modal
  // 🌟 حالة جديدة لتأكيد تسجيل الخروج 🌟
  const [showPresenceModal, setShowPresenceModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDashboardDropdown, setShowDashboardDropdown] = useState(false);

  // 🌟 Registration Capacity State (Now a Prop) 🌟
  // const [isRegistrationClosed, setIsRegistrationClosed] = useState(false); // REMOVED: Now passed as prop
  const [showCapacityAlert, setShowCapacityAlert] = useState(false);

  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('login') === 'true');
  const [userRole, setUserRole] = useState(null);

  // --- Workshop Form State ---
  const [workshopForm, setWorkshopForm] = useState({
    fullname: '', email: '', institution: '', level: '', phone: '', isProfessor: false
  });

  // --- Login/Register Form States ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    fullname: '', email: '', password: '', confirmPassword: ''
  });

  const openPresenceModal = () => {
    navigate('/presence');
    setIsOpen(false);
  };


  // --- Helpers ---
  const lockScroll = () => { document.body.style.overflow = 'hidden'; };
  const unlockScroll = () => { document.body.style.overflow = 'auto'; };

  const openModal = () => { if (onOpenWorkshop) onOpenWorkshop(); setIsOpen(false); };
  const closeModal = () => { if (onCloseWorkshop) onCloseWorkshop(); };
  const openAdminModal = () => { navigate('/users'); setIsOpen(false); };
  const openRegistrationsModal = () => { navigate('/workshop-registrations'); setIsOpen(false); };
  const openLiveModal = () => { setShowLiveModal(true); setIsOpen(false); lockScroll(); }; // 🌟 New Function
  const closeLiveModal = () => { setShowLiveModal(false); unlockScroll(); }; // 🌟 New Function
  const closeAdminModal = () => { setShowAdminModal(false); unlockScroll(); };

  // Update existing openers to ensure they close alerts if open
  const openModal_register = () => {
    // 🌟 Check Capacity First 🌟
    if (isRegistrationClosed) {
      setShowAuthAlert(false);
      setShowSuccessAlert(false);
      setIsOpen(false);
      setShowCapacityAlert(true);
      lockScroll();
      return;
    }

    setShowAuthAlert(false);
    setShowSuccessAlert(false);
    setAuthMode('register');
    setIsOpen(false);
    lockScroll();
  };
  const closeModal_register = () => { setAuthMode(null); unlockScroll(); };

  const openModal_login = () => {
    setShowAuthAlert(false);
    setShowSuccessAlert(false);
    setAuthMode('login');
    setIsOpen(false);
    lockScroll();
  };
  const closeModal_login = () => { setAuthMode(null); unlockScroll(); };

  const closeAuthModal = () => {
    setAuthMode(null);
    unlockScroll();
  };

  // 🌟 دالة إغلاق نافذة تأكيد تسجيل الخروج 🌟
  const closeLogoutConfirmModal = () => {
    setShowLogoutConfirm(false);
    unlockScroll();
  };


  // 🌟 دالة التحقق من الدور 🌟
  const checkUserRole = async (userEmail) => {
    if (!userEmail) {
      setUserRole(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${ROLE_API_URL}${userEmail}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUserRole(response.data.role);
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole('student');
    }
  };

  // ----------------------------------------------------------------
  // Listeners for Hero Buttons (Auth Alert & Success Alert)
  // ----------------------------------------------------------------

  // ----------------------------------------------------------------
  // Listeners for Hero Buttons (Auth Alert & Success Alert) ET Workshop
  // ----------------------------------------------------------------
  useEffect(() => {
    const handleAuthTrigger = () => {
      setShowAuthAlert(true);
      lockScroll();
    };
    const handleOpenRegister = () => { openModal_register(); };
    const handleOpenLogin = () => { openModal_login(); };
    const handleOpenWorkshopModal = () => { openModal(); };

    const handleSuccessTrigger = () => {
      setShowSuccessAlert(true);
      lockScroll();
    };

    // 🌟 Capacity Alert Trigger 🌟
    const handleCapacityTrigger = () => {
      setShowCapacityAlert(true);
      lockScroll();
    };

    window.addEventListener('trigger-auth-alert', handleAuthTrigger);
    window.addEventListener('trigger-success-alert', handleSuccessTrigger);
    window.addEventListener('open-register-modal', handleOpenRegister);
    window.addEventListener('open-login-modal', handleOpenLogin);
    window.addEventListener('open-workshop-modal', handleOpenWorkshopModal);
    window.addEventListener('trigger-capacity-alert', handleCapacityTrigger); // New Listener

    if (isWorkshopOpen) {
      lockScroll();
    }

    return () => {
      window.removeEventListener('trigger-auth-alert', handleAuthTrigger);
      window.removeEventListener('trigger-success-alert', handleSuccessTrigger);
      window.removeEventListener('open-register-modal', handleOpenRegister);
      window.removeEventListener('open-login-modal', handleOpenLogin);
      window.removeEventListener('open-workshop-modal', handleOpenWorkshopModal);
      window.removeEventListener('trigger-capacity-alert', handleCapacityTrigger);
    };
  }, [isWorkshopOpen, onOpenWorkshop]);

  // 🌟 Fetch Registration Settings (REMOVED - Handled by Parent Home.jsx) 🌟
  // useEffect(() => { ... });

  // ... (code existant)

  // ----------------------------------------------------------------
  // 0. useEffect: Handle Redirect Result (For In-App Browsers)
  // ----------------------------------------------------------------
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Redirect Login Success:", result.user);
          const user = result.user;
          const email = user.email;
          const fullname = user.displayName;

          // Store auth data
          localStorage.setItem('login', 'true');
          localStorage.setItem('userName', fullname);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('token', user.accessToken);

          // Check role
          await checkUserRole(email);

          setIsLoggedIn(true);
          setAuthMode(null);
          setShowSuccessAlert(true);
          setTimeout(() => setShowSuccessAlert(false), 3000);

          if (onAuthUpdate) onAuthUpdate();
        }
      } catch (error) {
        console.error("Redirect Login Error:", error);
      }
    };
    handleRedirect();
  }, []);

  // ----------------------------------------------------------------
  // 1. useEffect: Refresh Logic 
  // ----------------------------------------------------------------
  useEffect(() => {
    const checkRegistrationStatusAndRole = async () => {
      const isAuth = localStorage.getItem('login') === 'true';
      const savedEmail = localStorage.getItem('userEmail');
      const savedName = localStorage.getItem('userName');

      if (isAuth && savedEmail) {
        await checkUserRole(savedEmail);

        try {
          const response = await axios.get(`https://remet-ai-nate.vercel.app/api/check-registration/${savedEmail}`);

          if (response.data.registered) {
            localStorage.setItem('WORKSHOP', 'true');
          } else {
            localStorage.removeItem('WORKSHOP');
            setWorkshopForm(prev => ({
              ...prev,
              fullname: savedName || prev.fullname,
              email: savedEmail || prev.email
            }));
          }
        } catch (error) {
          console.error("Error checking registration status:", error);
        }
      } else {
        setUserRole(null);
      }
    };
    checkRegistrationStatusAndRole();
  }, [isLoggedIn]);

  // ----------------------------------------------------------------
  // 2. Google Login Logic
  // ----------------------------------------------------------------
  const loginToGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        const userData = userInfo.data;

        let token;
        try {
          const res = await axios.post(`${API_BASE_URL}/api/google-login`, {
            fullName: userData.name,
            email: userData.email
          });

          // Only proceed if backend success
          if (res.data.token) localStorage.setItem('token', res.data.token);
          if (res.data.userId) localStorage.setItem('userId', res.data.userId);
          if (res.data._id) localStorage.setItem('userId', res.data._id);

          localStorage.setItem('userName', userData.name);
          localStorage.setItem('userEmail', userData.email);
          localStorage.setItem('login', 'true');

          setIsLoggedIn(true);
          if (onAuthUpdate) onAuthUpdate();

          await checkUserRole(userData.email);

          setWorkshopForm(prev => ({
            ...prev,
            fullname: userData.name,
            email: userData.email
          }));

          closeModal_login();
          closeModal_register();

          setTimeout(() => {
            axios.get(`${API_BASE_URL}/api/check-registration/${userData.email}`)
              .then(res => {
                if (!res.data.registered) {
                  localStorage.removeItem('WORKSHOP');
                  openModal();
                } else {
                  localStorage.setItem('WORKSHOP', 'true');
                  window.location.reload(); // Refresh to ensure state sync
                }
              })
              .catch(() => openModal());
          }, 500);

        } catch (serverError) {
          console.error("Backend Google Sync Error:", serverError);
          // Check for 403 Capacity Error
          if (serverError.response && serverError.response.status === 403) {
            closeModal_login();
            closeModal_register();
            setShowCapacityAlert(true); // Show the alert
            return; // STOP execution
          }
        }
      } catch (error) {
        console.error("Google Login Error:", error);
      }
    },
    onError: (error) => console.log('Login Failed:', error),
  });

  // ----------------------------------------------------------------
  // 3. Manual Register Logic
  // ----------------------------------------------------------------
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/register`, {
        fullName: formData.fullname,
        email: formData.email,
        password: formData.password
      });

      if (res.data.token) localStorage.setItem('token', res.data.token);
      if (res.data.userId) localStorage.setItem('userId', res.data.userId);
      if (res.data._id) localStorage.setItem('userId', res.data._id);

      localStorage.setItem('login', 'true');
      localStorage.setItem('userName', formData.fullname);
      localStorage.setItem('userEmail', formData.email);

      setIsLoggedIn(true);
      if (onAuthUpdate) onAuthUpdate();

      await checkUserRole(formData.email);

      closeModal_register();

      setWorkshopForm(prev => ({
        ...prev,
        fullname: formData.fullname,
        email: formData.email
      }));

      alert("Account created successfully!");
      localStorage.removeItem('WORKSHOP');
      setTimeout(() => { openModal(); }, 500);

    } catch (error) {
      console.error("Registration Error:", error);
      alert(error.response?.data?.message || "Registration error");
    }
  };

  // ----------------------------------------------------------------
  // 4. Manual Login Logic
  // ----------------------------------------------------------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/login`, {
        email: email,
        password: password
      });

      if (res.data.token) localStorage.setItem('token', res.data.token);
      if (res.data.userId) localStorage.setItem('userId', res.data.userId);
      if (res.data._id) localStorage.setItem('userId', res.data._id);

      localStorage.setItem('login', 'true');
      localStorage.setItem('userName', res.data.fullName);
      localStorage.setItem('userEmail', email);

      setIsLoggedIn(true);
      if (onAuthUpdate) onAuthUpdate();

      await checkUserRole(email);

      setWorkshopForm(prev => ({
        ...prev,
        fullname: res.data.fullName,
        email: email
      }));

      closeModal_login();

      setTimeout(() => {
        axios.get(`${API_BASE_URL}/api/check-registration/${email}`)
          .then(apiRes => {
            if (!apiRes.data.registered) {
              localStorage.removeItem('WORKSHOP');
              openModal();
            } else {
              localStorage.setItem('WORKSHOP', 'true');
            }
          })
          .catch(() => openModal());
      }, 500);

    } catch (error) {
      console.error("Login Error:", error);
      alert("Incorrect email or password");
    }
  };

  // ----------------------------------------------------------------
  // 5. Workshop Registration Logic
  // ----------------------------------------------------------------
  const handleWorkshopSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!userId) {
      alert("Error: User ID not found. Please log in again.");
      return;
    }

    const registrationData = {
      fullName: workshopForm.fullname,
      email: workshopForm.email,
      institution: workshopForm.institution,
      class: workshopForm.isProfessor ? "Professor" : workshopForm.level,
      phone: workshopForm.phone
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      await axios.post(`${API_BASE_URL}/api/registration/${userId}`, registrationData, config);
      localStorage.setItem('login', 'true');
      localStorage.setItem('WORKSHOP', 'true');
      closeModal();
      alert("Registration confirmed successfully!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Error during registration.";
      alert(errorMsg);
    }
  };

  const handleWorkshopChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWorkshopForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // If switching to professor, clear level or set it but disabling UI is what user asked
      level: (name === 'isProfessor' && checked) ? '' : (name === 'level' ? value : prev.level)
    }));
  };

  // 🌟 دالة تسجيل الخروج الفعلية 🌟
  const confirmLogout = () => {
    googleLogout();
    localStorage.removeItem('login');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('WORKSHOP');

    setIsLoggedIn(false);
    setUserRole(null);
    setWorkshopForm({ fullname: '', email: '', institution: '', level: '', phone: '', isProfessor: false });

    if (onAuthUpdate) onAuthUpdate();

    closeLogoutConfirmModal(); // إغلاق النافذة المنبثقة
    window.location.reload();
  };

  // 🌟 دالة فتح نافذة التأكيد (التي يتم استدعاؤها من الزر) 🌟
  const handleLogout = () => {
    setShowLogoutConfirm(true);
    lockScroll();
  };

  const toggleMenu = () => { setIsOpen(!isOpen); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };


  return (
    <>
      <nav className={`navbar ${isOpen ? 'scrolled' : ''}`}>
        <div className="navbar-logo">
          <img src={logo} alt="REMET-AI Logo" className="logo-image" />
        </div>

        <div className='desktop-links-wrapper'>
          <ul className="navbar-links">
            <li><a href="#about">About</a></li>
            <li><a href="#speakers">Speakers</a></li>
            <li><a href="#key-sessions">Key Sessions</a></li>

            <li><a href="#program">Program</a></li>
            {/* Resources Link Visible to All */}
            <li><a onClick={() => navigate('/resources')} style={{ cursor: 'pointer' }}>Materials</a></li>
          </ul>
        </div>

        <div className="navbar-actions desktop-only">
          {!isLoggedIn ? (
            <>
              <button className="nav-register-btn" onClick={openModal_register}>
                Create Account
              </button>
              <div className="navbar-login">
                <button className="login-button" onClick={openModal_login}>Sign In</button>
              </div>
            </>
          ) : (
            <div className="navbar-logged-actions">
              {isLoggedIn && userRole === 'admin' && (
                <div className="dashboard-dropdown-container">
                  <button
                    className="nav-dashboard-btn"
                    onClick={() => setShowDashboardDropdown(!showDashboardDropdown)}
                  >
                    <FiLayout size={18} />
                    Dashboard
                  </button>

                  {showDashboardDropdown && (
                    <div className="dashboard-dropdown">
                      <button onClick={() => { openAdminModal(); setShowDashboardDropdown(false); }}>
                        <FiUsers size={16} />
                        Account Management
                      </button>
                      <button onClick={() => { openPresenceModal(); setShowDashboardDropdown(false); }}>
                        <FiCheckSquare size={16} />
                        Presence Management
                      </button>
                      <button onClick={() => { openRegistrationsModal(); setShowDashboardDropdown(false); }}>
                        <FiUsers size={16} />
                        Workshop Registrations
                      </button>
                      <button onClick={() => { openLiveModal(); setShowDashboardDropdown(false); }}>
                        <FiLayout size={16} />
                        Live Management
                      </button>
                      <button onClick={() => { navigate('/resources'); setShowDashboardDropdown(false); }}>
                        <FiLink size={16} />
                        Materials Management
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="navbar-login">

                <button
                  className="login-button"
                  onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <FiLogOut size={20} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`hamburger-menu ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>

        <div className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`}>
          <ul className="mobile-links">
            <li><a href="#about" onClick={toggleMenu}>About</a></li>
            <li><a href="#key-sessions" onClick={toggleMenu}>Key Sessions</a></li>
            <li><a href="#speakers" onClick={toggleMenu}>Speakers</a></li>

            <li><a href="#program" onClick={toggleMenu}>Program</a></li>
            <li><a onClick={() => { navigate('/resources'); toggleMenu(); }} style={{ cursor: 'pointer' }}>Materials</a></li>

            {!isLoggedIn ? (
              <>
                <li>
                  <button className="nav-register-btn" onClick={openModal_register} style={{ width: '100%', justifyContent: 'center' }}>
                    Create Account
                  </button>
                </li>
                <li className="mobile-login-item">
                  <button className="login-button" onClick={openModal_login} style={{ width: '100%', justifyContent: 'center' }}>Sign In</button>
                </li>
              </>
            ) : (
              <>
                {isLoggedIn && userRole === 'admin' && (
                  <>
                    <li>
                      <button className="nav-dashboard-btn" onClick={openAdminModal} style={{ width: '100%', justifyContent: 'center', marginBottom: '10px' }}>
                        <FiUsers size={18} />
                        Account Management
                      </button>
                    </li>
                    <li>
                      <button className="nav-dashboard-btn" onClick={openPresenceModal} style={{ width: '100%', justifyContent: 'center', marginBottom: '10px' }}>
                        <FiCheckSquare size={18} />
                        Presence Management
                      </button>
                    </li>
                    <li>
                      <button className="nav-dashboard-btn" onClick={openRegistrationsModal} style={{ width: '100%', justifyContent: 'center', marginBottom: '10px' }}>
                        <FiUsers size={18} />
                        Workshop Registrations
                      </button>
                    </li>
                  </>
                )}

                <li className="mobile-login-item">
                  <button
                    className="login-button"
                    onClick={handleLogout}
                    style={{ backgroundColor: '#dc3545', width: '100%', marginTop: '10px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <FiLogOut size={20} />
                    Sign Out
                  </button>
                </li>
              </>
            )}
          </ul>
        </div >
      </nav >

      {/* --- MODALE 4 : AUTH ALERT POPUP --- */}
      {
        showAuthAlert && (
          <div className="rm-overlay" onClick={() => { setShowAuthAlert(false); unlockScroll(); }}>
            <div className="rm-modal-container rm-modal-small" onClick={(e) => e.stopPropagation()}>
              <div className="rm-modal-body auth-alert-body">
                <button className="rm-close-btn" onClick={() => { setShowAuthAlert(false); unlockScroll(); }}>×</button>

                <div className="auth-alert-icon">🔒</div>

                <h2 className="auth-alert-title">Login Required</h2>
                <p className="auth-alert-text">
                  To register for RemetAI, you must first log in or create an account.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                  <button className="nav-register-btn" onClick={openModal_register} style={{ width: '100%', justifyContent: 'center' }}>
                    Create Account
                  </button>

                  <button className="login-button" onClick={openModal_login} style={{ width: '100%', justifyContent: 'center', backgroundColor: '#e5e7eb', color: '#374151' }}>
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* --- NEW MODALE 5 : ALREADY REGISTERED (SUCCESS) POPUP --- */}
      {
        showSuccessAlert && (
          <div className="rm-overlay" onClick={() => { setShowSuccessAlert(false); unlockScroll(); }}>
            <div className="rm-modal-container rm-modal-small success-alert-container" onClick={(e) => e.stopPropagation()}>
              <div className="rm-modal-body success-alert-body">
                <button className="rm-close-btn" onClick={() => { setShowSuccessAlert(false); unlockScroll(); }}>×</button>

                <div className="success-alert-icon-box">
                  <FiCheckCircle size={40} />
                </div>

                <h2 className="success-alert-title">Registration Confirmed</h2>
                <p className="success-alert-text">
                  You are already a participant of the <strong style={{ color: '#0f172a' }}>REMET-AI</strong> workshop.<br />
                  We can't wait to see you there!
                </p>

                <button
                  className="ai-btn-primary"
                  onClick={() => { setShowSuccessAlert(false); unlockScroll(); }}
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '14px' }}
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* --- MODALE 6 : CAPACITY REACHED ALERT --- */}
      {
        showCapacityAlert && (
          <div className="rm-overlay" onClick={() => { setShowCapacityAlert(false); unlockScroll(); }}>
            <div className="rm-modal-container rm-modal-small" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
              <div className="rm-modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
                <button className="rm-close-btn" onClick={() => { setShowCapacityAlert(false); unlockScroll(); }}>×</button>

                <div style={{
                  width: '60px',
                  height: '60px',
                  background: '#fff1f2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: '#e11d48'
                }}>
                  <FiUsers size={30} />
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>Maximum Capacity Reached</h2>
                <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '2rem' }}>
                  We truly appreciate your interest! However, we have reached maximum capacity for REMET-AI workshop.
                  <br /><br />
                  We hope to welcome you at our next event!
                </p>

                <button
                  className="ai-btn-primary"
                  onClick={() => { setShowCapacityAlert(false); unlockScroll(); }}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: '12px', background: '#e11d48' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* --- MODALE 1 : WORKSHOP (لم تتغير) --- */}
      {
        isWorkshopOpen && (
          <div className="rm-overlay" onClick={closeModal}>
            <div className="rm-modal-container" onClick={(e) => e.stopPropagation()}>
              <button className="rm-close-btn" onClick={closeModal}>×</button>
              <div className="rm-modal-header">
                <h2>Join REMET-AI</h2>
                <p>Fill out this form to confirm your workshop spot.</p>
              </div>

              <form className="rm-form" onSubmit={handleWorkshopSubmit}>
                <div className="rm-input-group">
                  <label>Full Name</label>
                  <input type="text" name="fullname" placeholder="Ex: Full Name" value={workshopForm.fullname} onChange={handleWorkshopChange} required />
                </div>

                <div className="rm-input-group">
                  <label>Academic Email</label>
                  <input
                    type="email"
                    name="email"
                    value={workshopForm.email}
                    onChange={handleWorkshopChange}
                    required
                    readOnly
                    style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#6c757d' }}
                  />
                </div>

                <div className="rm-input-group" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#4b5563' }}>
                    <input
                      type="checkbox"
                      name="isProfessor"
                      checked={workshopForm.isProfessor}
                      onChange={handleWorkshopChange}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    Register as a Professor
                  </label>
                </div>

                <div className="rm-row">
                  <div className="rm-input-group">
                    <label>Institution / Faculty</label>
                    <input type="text" name="institution" placeholder="FST-SBZ" value={workshopForm.institution} onChange={handleWorkshopChange} required />
                  </div>
                  <div className="rm-input-group">
                    <label>Class / Level</label>
                    <input
                      type="text"
                      name="level"
                      placeholder={workshopForm.isProfessor ? "N/A" : "Ex: 3rd Year"}
                      value={workshopForm.isProfessor ? "Professor" : workshopForm.level}
                      onChange={handleWorkshopChange}
                      required={!workshopForm.isProfessor}
                      disabled={workshopForm.isProfessor}
                      style={workshopForm.isProfessor ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#9ca3af' } : {}}
                    />
                  </div>
                </div>
                <div className="rm-input-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" placeholder="+216 00 000 000" value={workshopForm.phone} onChange={handleWorkshopChange} required />
                </div>
                <button type="submit" className="rm-submit-btn">
                  Confirm Registration
                </button>
              </form>
            </div>
          </div>
        )
      }

      {/* --- MODALE UNIFIÉE : AUTH (LOGIN & REGISTER) --- */}
      {
        authMode && (
          <div className="rm-overlay" onClick={closeAuthModal}>
            <div className="rm-modal-container" onClick={(e) => e.stopPropagation()}>
              <button
                className="rm-close-btn"
                onClick={closeAuthModal}
                style={{ background: authMode === 'login' ? 'white' : 'black', color: authMode === 'login' ? '#0f172a' : '#e7e7e7' }}
              >
                ×
              </button>

              <div className={`auth-fade-container auth-form-animate ${authMode === 'login' ? 'lo-page-container' : 're-page-container'}`} key={authMode}>
                <div className={authMode === 'login' ? 'lo-content-wrapper' : 're-content-wrapper'}>

                  {/* --- Lado Esquerdo (Visual para Register, Form para Login) --- */}
                  {authMode === 'register' ? (
                    <div className="re-visual-side">
                      <img
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                        alt="Future Tech"
                        className="re-bg-image"
                      />
                    </div>
                  ) : (
                    <div className="lo-form-side">
                      <div className="lo-header">
                        <div className="lo-logo-mark">REMET-AI</div>
                        <p className="lo-subtitle">Access your account</p>
                      </div>

                      <form onSubmit={handleLoginSubmit} className="lo-form">
                        <div className="lo-input-group">
                          <label htmlFor="email">Email</label>
                          <div className="lo-input-wrapper">
                            <input type="email" id="email" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <span className="lo-input-icon">✉️</span>
                          </div>
                        </div>
                        <div className="lo-input-group">
                          <label htmlFor="password">Password</label>
                          <div className="lo-input-wrapper">
                            <input type="password" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <span className="lo-input-icon">🔒</span>
                          </div>
                        </div>
                        <button type="submit" className="lo-submit-btn">
                          Sign In
                          <span className="lo-btn-arrow">→</span>
                        </button>
                      </form>

                      <p className="lo-footer-text">
                        No account yet?
                        <button onClick={() => setAuthMode('register')} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', marginLeft: '5px' }}>Create Account</button>
                      </p>
                      <div className="lo-divider">
                        <span>Or continue with</span>
                      </div>
                      <div className="lo-social-buttons">
                        <button type="button" className="lo-social-btn google" onClick={() => loginToGoogle()}>
                          <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" />
                          Google
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- Lado Direito (Form para Register, Visual para Login) --- */}
                  {authMode === 'register' ? (
                    <div className="re-form-side">
                      <div className="re-header">
                        <p className="re-subtitle">Join the community !</p>
                      </div>

                      <form className="re-form" onSubmit={handleRegisterSubmit}>
                        <div className="re-input-group">
                          <label>Full Name</label>
                          <div className="re-input-wrapper">
                            <input type="text" name="fullname" placeholder="Your Full Name" value={formData.fullname} onChange={handleChange} required />
                            <span className="re-icon">👤</span>
                          </div>
                        </div>
                        <div className="re-input-group">
                          <label>Email</label>
                          <div className="re-input-wrapper">
                            <input type="email" name="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} required />
                            <span className="re-icon">✉️</span>
                          </div>
                        </div>
                        <div className="re-row">
                          <div className="re-input-group">
                            <label>Password</label>
                            <div className="re-input-wrapper">
                              <input type="password" name="password" placeholder="••••••" value={formData.password} onChange={handleChange} required />
                              <span className="re-icon">🔒</span>
                            </div>
                          </div>
                          <div className="re-input-group">
                            <label>Confirm Password</label>
                            <div className="re-input-wrapper">
                              <input type="password" name="confirmPassword" placeholder="••••••" value={formData.confirmPassword} onChange={handleChange} required />
                              <span className="re-icon">🔒</span>
                            </div>
                          </div>
                        </div>
                        <button type="submit" className="re-submit-btn">
                          Create Account
                          <span className="re-shine"></span>
                        </button>
                      </form>

                      <p className="re-footer">
                        Already a member? <button onClick={() => setAuthMode('login')} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}>Sign In</button>
                      </p>
                      <div className="lo-divider">
                        <span>Or continue with</span>
                      </div>
                      <div className="lo-social-buttons">
                        <button type="button" className="lo-social-btn google" onClick={() => loginToGoogle()}>
                          <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" />
                          Google
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="lo-visual-side">
                      <img
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                        alt="Abstract Tech"
                        className="lo-bg-image"
                      />
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        showPresenceModal && (
          <PresenceManagement onClose={closePresenceModal} />
        )
      }
      {/* -------------------------------------------------------- */}
      {/* 🌟 MODAL 6: LOGOUT CONFIRMATION POPUP (نافذة التأكيد) 🌟 */}
      {/* -------------------------------------------------------- */}
      {
        showLogoutConfirm && (
          <div className="rm-overlay" onClick={closeLogoutConfirmModal}>
            <div
              className="rm-modal-container"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '420px',
                textAlign: 'center',
                padding: '30px',
                backgroundColor: '#ffffff', // خلفية بيضاء (فاتح)
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e0e0e0',
                color: '#333'
              }}
            >
              {/* زر الإغلاق */}
              <button
                className="rm-close-btn"
                onClick={closeLogoutConfirmModal}
                style={{
                  color: '#aaa',
                  backgroundColor: 'transparent',
                  fontSize: '1.5rem',
                  top: '15px',
                  right: '15px'
                }}
              >
                ×
              </button>

              {/* أيقونة تحذير */}
              <div style={{ color: '#dc3545', fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>

              {/* عنوان ورسالة */}
              <h2 style={{ marginBottom: '10px', color: '#0f172a' }}>Confirm Sign Out  </h2>
              <p style={{ marginBottom: '30px', color: '#64748b', lineHeight: '1.6' }}>
                Are you sure you want to Sign Out of your account?
                <br />
                You will need to Sign In again to access the workshops.
              </p>

              {/* أزرار الإجراءات */}
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                {/* زر الإلغاء */}
                <button
                  onClick={closeLogoutConfirmModal}
                  style={{
                    flexGrow: 1,
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    backgroundColor: '#f8f9fa',
                    color: '#333',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>

                {/* زر التأكيد */}
                <button
                  onClick={confirmLogout}
                  style={{
                    flexGrow: 1,
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#dc3545', // أحمر للخروج
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Yes, Sign Out
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* --- MODAL 7: LIVE STREAM MANAGEMENT --- */}
      {
        showLiveModal && (
          <LiveStreamManagement onClose={closeLiveModal} />
        )
      }
    </>
  );
}