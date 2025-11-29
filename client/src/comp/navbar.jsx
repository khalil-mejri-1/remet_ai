import React, { useState, useEffect } from 'react';
import logo from "../img/logo.png";
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import axios from 'axios';
import { FiLogOut } from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";
import Gestion_compte from './Gestioncompte';

// تعريف الـ URL الخاص بالتحقق من الدور
const ROLE_API_URL = 'https://remet-ai-nate.vercel.app/api/user/role/';

export default function Navbar({ isWorkshopOpen, onOpenWorkshop, onCloseWorkshop, onAuthUpdate }) {

  // --- UI States ---
  const [isOpen, setIsOpen] = useState(false);
  const [showModal_register, setShowModal_register] = useState(false);
  const [showModal_login, setShowModal_login] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  // 🌟 حالة جديدة لتأكيد تسجيل الخروج 🌟
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('login') === 'true');
  const [userRole, setUserRole] = useState(null);

  // --- Workshop Form State ---
  const [workshopForm, setWorkshopForm] = useState({
    fullname: '', email: '', institution: '', level: '', phone: ''
  });

  // --- Login/Register Form States ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    fullname: '', email: '', password: '', confirmPassword: ''
  });

  // --- Helpers ---
  const lockScroll = () => { document.body.style.overflow = 'hidden'; };
  const unlockScroll = () => { document.body.style.overflow = 'auto'; };

  const openModal = () => { if (onOpenWorkshop) onOpenWorkshop(); setIsOpen(false); };
  const closeModal = () => { if (onCloseWorkshop) onCloseWorkshop(); };
  const openAdminModal = () => { setShowAdminModal(true); setIsOpen(false); lockScroll(); };
  const closeAdminModal = () => { setShowAdminModal(false); unlockScroll(); };

  // Update existing openers to ensure they close alerts if open
  const openModal_register = () => {
    setShowAuthAlert(false);
    setShowSuccessAlert(false);
    setShowModal_register(true);
    setShowModal_login(false);
    setIsOpen(false);
    lockScroll();
  };
  const closeModal_register = () => { setShowModal_register(false); unlockScroll(); };

  const openModal_login = () => {
    setShowAuthAlert(false);
    setShowSuccessAlert(false);
    setShowModal_login(true);
    setShowModal_register(false);
    setIsOpen(false);
    lockScroll();
  };
  const closeModal_login = () => { setShowModal_login(false); unlockScroll(); };

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
  useEffect(() => {
    const handleAuthTrigger = () => {
      setShowAuthAlert(true);
      lockScroll();
    };
    const handleOpenRegister = () => { openModal_register(); }; // 👈 NOUVEAU
        const handleOpenLogin = () => { openModal_login(); };      // 👈 NOUVEAU

    const handleSuccessTrigger = () => {
      setShowSuccessAlert(true);
      lockScroll();
    };

    window.addEventListener('trigger-auth-alert', handleAuthTrigger);
    window.addEventListener('trigger-success-alert', handleSuccessTrigger);
    window.addEventListener('open-register-modal', handleOpenRegister); // 👈 Écouteur
    window.addEventListener('open-login-modal', handleOpenLogin);       //

    return () => {
      window.removeEventListener('trigger-auth-alert', handleAuthTrigger);
      window.removeEventListener('trigger-success-alert', handleSuccessTrigger);
      window.removeEventListener('open-register-modal', handleOpenRegister); // 👈 Nettoyage
            window.removeEventListener('open-login-modal', handleOpenLogin);
    };
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
          const res = await axios.post('https://remet-ai-nate.vercel.app/api/google-login', {
            fullName: userData.name,
            email: userData.email
          });
          token = res.data.token;
          if (res.data.token) localStorage.setItem('token', res.data.token);
          if (res.data.userId) localStorage.setItem('userId', res.data.userId);
          if (res.data._id) localStorage.setItem('userId', res.data._id);
        } catch (serverError) {
          console.error("Backend Google Sync Error:", serverError);
        }

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
          axios.get(`https://remet-ai-nate.vercel.app/api/check-registration/${userData.email}`)
            .then(res => {
              if (!res.data.registered) {
                localStorage.removeItem('WORKSHOP');
                openModal();
              } else {
                localStorage.setItem('WORKSHOP', 'true');
              }
            })
            .catch(() => openModal());
        }, 500);

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
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    try {
      const res = await axios.post('https://remet-ai-nate.vercel.app/api/register', {
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

      alert("Compte créé avec succès !");
      localStorage.removeItem('WORKSHOP');
      setTimeout(() => { openModal(); }, 500);

    } catch (error) {
      console.error("Registration Error:", error);
      alert(error.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  // ----------------------------------------------------------------
  // 4. Manual Login Logic
  // ----------------------------------------------------------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://remet-ai-nate.vercel.app/api/login', {
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
        axios.get(`https://remet-ai-nate.vercel.app/api/check-registration/${email}`)
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
      alert("Email ou mot de passe incorrect");
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
      alert("Erreur: ID utilisateur introuvable. Veuillez vous reconnecter.");
      return;
    }

    const registrationData = {
      fullName: workshopForm.fullname,
      email: workshopForm.email,
      institution: workshopForm.institution,
      class: workshopForm.level,
      phone: workshopForm.phone
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      await axios.post(`https://remet-ai-nate.vercel.app/api/registration/${userId}`, registrationData, config);
      localStorage.setItem('login', 'true');
      localStorage.setItem('WORKSHOP', 'true');
      closeModal();
      alert("Inscription confirmée avec succès !");
      window.location.reload();
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Erreur lors de l'inscription.";
      alert(errorMsg);
    }
  };

  const handleWorkshopChange = (e) => {
    const { name, value } = e.target;
    setWorkshopForm(prev => ({ ...prev, [name]: value }));
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
    setWorkshopForm({ fullname: '', email: '', institution: '', level: '', phone: '' });

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
            <li><a href="#about">ABOUT</a></li>
            <li><a href="#speakers">SPEAKERS</a></li>
            <li><a href="#key-sessions">KEY SESSIONS</a></li>
            <li><a href="#program">PROGRAM</a></li>
            {isLoggedIn && userRole === 'admin' && (
              <li>
                <a
                  onClick={openAdminModal}
                  style={{ cursor: "pointer", fontWeight: '900' }}
                >
                  Gestion de compte
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="navbar-actions desktop-only">
          {!isLoggedIn ? (
            <>
              <button className="nav-register-btn" onClick={openModal_register}>
                S'inscrire
                <span className="btn-glow"></span>
              </button>
              <div className="navbar-login">
                <button className="login-button" onClick={openModal_login}>Log in</button>
              </div>
            </>
          ) : (
            <div className="navbar-login">
              {/* 🌟 استدعاء الدالة الجديدة لفتح التأكيد 🌟 */}
              <button
                className="login-button"
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FiLogOut size={20} />
                Log out
              </button>
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
            <li><a href="#about" onClick={toggleMenu}>ABOUT</a></li>
            <li><a href="#key-sessions" onClick={toggleMenu}>KEY SESSIONS</a></li>
            <li><a href="#speakers" onClick={toggleMenu}>SPEAKERS</a></li>
            <li><a href="#program" onClick={toggleMenu}>PROGRAM</a></li>
            {isLoggedIn && userRole === 'admin' && (
              <li>
                <a
                  onClick={openAdminModal}
                  style={{ cursor: "pointer", color: '#ffcc00', fontWeight: 'bold' }}
                >
                  Gestion de compte
                </a>
              </li>
            )}

            {!isLoggedIn ? (
              <>
                <li>
                  <button className="nav-register-btn" onClick={openModal_register}>
                    S'inscrire
                  </button>
                </li>
                <li className="mobile-login-item">
                  <button className="login-button" onClick={openModal_login}>Log in</button>
                </li>
              </>
            ) : (
              <li className="mobile-login-item">
                {/* 🌟 استدعاء الدالة الجديدة لفتح التأكيد 🌟 */}
                <button
                  className="login-button"
                  onClick={handleLogout}
                  style={{ backgroundColor: '#dc3545', width: '100%', marginTop: '10px', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <FiLogOut size={20} />
                  Log out
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* --- MODALE 4 : AUTH ALERT POPUP (لم تتغير) --- */}
      {showAuthAlert && (
        <div className="rm-overlay" onClick={() => { setShowAuthAlert(false); unlockScroll(); }}>
          <div className="rm-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 30px' }}>
            <button className="rm-close-btn" onClick={() => { setShowAuthAlert(false); unlockScroll(); }}>×</button>

            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔒</div>

            <h2 style={{ marginBottom: '10px', color: '#0f172a' }}>Connexion Requise</h2>
            <p style={{ marginBottom: '30px', color: '#64748b', lineHeight: '1.5' }}>
              Pour vous inscrire à remetAI, vous devez d'abord vous connecter ou créer un compte.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
              <button className="nav-register-btn" onClick={openModal_register} style={{ width: '100%', justifyContent: 'center' }}>
                S'inscrire
                <span className="btn-glow"></span>
              </button>

              <button className="login-button" onClick={openModal_login}   style={{ width: '100%', justifyContent: 'center', backgroundColor: '#e5e7eb', color: '#374151' }}>
                Log in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NEW MODALE 5 : ALREADY REGISTERED (SUCCESS) POPUP (لم تتغير) --- */}
      {showSuccessAlert && (
        <div className="rm-overlay" onClick={() => { setShowSuccessAlert(false); unlockScroll(); }}>
          <div className="rm-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 30px' }}>
            <button className="rm-close-btn" onClick={() => { setShowSuccessAlert(false); unlockScroll(); }}>×</button>

            <div style={{ color: '#22c55e', fontSize: '4rem', marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
              <FaCheckCircle />
            </div>

            <h2 style={{ marginBottom: '10px', color: '#0f172a' }}>Congratulations !</h2>
            <p style={{ marginBottom: '30px', color: '#64748b', lineHeight: '1.5' }}>
              You are already registered for the REMET-AI workshop.<br />
              We look forward to seeing you!
            </p>

            <button
              className="login-button"
              onClick={() => { setShowSuccessAlert(false); unlockScroll(); }}
              style={{ width: '100%', border: '1px solid #e2e8f0', justifyContent: 'center', backgroundColor: '#0f172a', color: 'black' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- MODALE 1 : WORKSHOP (لم تتغير) --- */}
      {isWorkshopOpen && (
        <div className="rm-overlay" onClick={closeModal}>
          <div className="rm-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="rm-close-btn" onClick={closeModal}>×</button>
            <div className="rm-modal-header">
              <h2>Rejoignez REMET-AI</h2>
              <p>Remplissez ce formulaire pour valider votre place au workshop.</p>
            </div>

            <form className="rm-form" onSubmit={handleWorkshopSubmit}>
              <div className="rm-input-group">
                <label>Nom complet</label>
                <input type="text" name="fullname" placeholder="Ex: Jean Dupont" value={workshopForm.fullname} onChange={handleWorkshopChange} required />
              </div>

              <div className="rm-input-group">
                <label>Email académique</label>
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

              <div className="rm-row">
                <div className="rm-input-group">
                  <label>Institution / Faculté</label>
                  <input type="text" name="institution" placeholder="ENIS, FSEG..." value={workshopForm.institution} onChange={handleWorkshopChange} required />
                </div>
                <div className="rm-input-group">
                  <label>Classe / Niveau</label>
                  <input type="text" name="level" placeholder="Ex: 2ème Année" value={workshopForm.level} onChange={handleWorkshopChange} required />
                </div>
              </div>
              <div className="rm-input-group">
                <label>Numéro de téléphone</label>
                <input type="tel" name="phone" placeholder="+216 00 000 000" value={workshopForm.phone} onChange={handleWorkshopChange} required />
              </div>
              <button type="submit" className="rm-submit-btn">
                Confirmer l'inscription
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODALE 2 : REGISTER (لم تتغير) --- */}
      {showModal_register && (
        <div className="rm-overlay" onClick={closeModal_register}>
          <div className="rm-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="re-page-container">
              <div className="re-content-wrapper">
                <div className="re-visual-side">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                    alt="Future Tech"
                    className="re-bg-image"
                  />
                  <div className="re-overlay"></div>
                  <div className="re-glass-card">
                    <div className="re-card-icon">💎</div>
                    <h3>Devenez Membre VIP</h3>
                    <p>Débloquez l'accès complet aux conférences.</p>
                  </div>
                </div>

                <div className="re-form-side">
                  <button
                    className="rm-close-btn"
                    onClick={closeModal_register}
                    style={{ background: 'black', color: '#e7e7e7ff' }}
                  >
                    ×
                  </button>
                  <div className="re-header">
                    <h1 className="re-title">Créer un compte</h1>
                    <p className="re-subtitle">Rejoignez la communauté.</p>
                  </div>

                  <form className="re-form" onSubmit={handleRegisterSubmit}>
                    <div className="re-input-group">
                      <label>Nom complet</label>
                      <div className="re-input-wrapper">
                        <input type="text" name="fullname" placeholder="Votre nom" value={formData.fullname} onChange={handleChange} required />
                        <span className="re-icon">👤</span>
                      </div>
                    </div>
                    <div className="re-input-group">
                      <label>Email professionnel</label>
                      <div className="re-input-wrapper">
                        <input type="email" name="email" placeholder="nom@tech.com" value={formData.email} onChange={handleChange} required />
                        <span className="re-icon">✉️</span>
                      </div>
                    </div>
                    <div className="re-row">
                      <div className="re-input-group">
                        <label>Mot de passe</label>
                        <div className="re-input-wrapper">
                          <input type="password" name="password" placeholder="••••••" value={formData.password} onChange={handleChange} required />
                          <span className="re-icon">🔒</span>
                        </div>
                      </div>
                    </div>
                    <div className="re-row">
                      <div className="re-input-group">
                        <label>Conform Mot de passe</label>
                        <div className="re-input-wrapper">
                          <input type="password" name="confirmPassword" placeholder="••••••" value={formData.confirmPassword} onChange={handleChange} required />
                          <span className="re-icon">🔒</span>
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="re-submit-btn">
                      Commencer l'aventure
                      <span className="re-shine"></span>
                    </button>
                  </form>

                  <p className="re-footer">
                    Déjà membre ? <button onClick={openModal_login} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}>Connectez-vous</button>
                  </p>
                  <div className="lo-divider">
                    <span>Ou continuer avec</span>
                  </div>
                  <div className="lo-social-buttons">
                    <button
                      type="button"
                      className="lo-social-btn google"
                      onClick={() => loginToGoogle()}
                    >
                      <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" />
                      Google
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE 3 : LOGIN (لم تتغير) --- */}
      {showModal_login && (
        <div className="rm-overlay" onClick={closeModal_login}>
          <div className="rm-modal-container" onClick={(e) => e.stopPropagation()}>
            <button
              className="rm-close-btn"
              onClick={closeModal_login}
              style={{ background: 'white', color: '#0f172a' }}
            >
              ×
            </button>
            <div className="lo-page-container">
              <div className="lo-content-wrapper">
                <div className="lo-form-side">
                  <div className="lo-header">
                    <div className="lo-logo-mark">AI</div>
                    <h1 className="lo-title">Bon retour !</h1>
                    <p className="lo-subtitle">Entrez vos identifiants.</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="lo-form">
                    <div className="lo-input-group">
                      <label htmlFor="email">Email professionnel</label>
                      <div className="lo-input-wrapper">
                        <input type="email" id="email" placeholder="nom@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <span className="lo-input-icon">✉️</span>
                      </div>
                    </div>
                    <div className="lo-input-group">
                      <label htmlFor="password">Mot de passe</label>
                      <div className="lo-input-wrapper">
                        <input type="password" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <span className="lo-input-icon">🔒</span>
                      </div>
                    </div>
                    <button type="submit" className="lo-submit-btn">
                      Se connecter
                      <span className="lo-btn-arrow">→</span>
                    </button>
                  </form>

                  <p className="lo-footer-text">
                    Pas encore de compte ?
                    <button onClick={openModal_register} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', marginLeft: '5px' }}>Inscrivez-vous</button>
                  </p>
                  <div className="lo-divider">
                    <span>Ou continuer avec</span>
                  </div>
                  <div className="lo-social-buttons">
                    <button
                      type="button"
                      className="lo-social-btn google"
                      onClick={() => loginToGoogle()}
                    >
                      <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" />
                      Google
                    </button>
                  </div>
                </div>
                <div className="lo-visual-side">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                    alt="Abstract Tech"
                    className="lo-bg-image"
                  />
                  <div className="lo-overlay"></div>
                  <div className="lo-glass-card">
                    <div className="lo-card-icon">🚀</div>
                    <h3>L'Innovation commence ici.</h3>
                    <p>Rejoignez une communauté d'experts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdminModal && (
        <Gestion_compte onClose={closeAdminModal} />
      )}

      {/* -------------------------------------------------------- */}
      {/* 🌟 MODAL 6: LOGOUT CONFIRMATION POPUP (نافذة التأكيد) 🌟 */}
      {/* -------------------------------------------------------- */}
      {showLogoutConfirm && (
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
            <h2 style={{ marginBottom: '10px', color: '#0f172a' }}>Confirm Logout  </h2>
            <p style={{ marginBottom: '30px', color: '#64748b', lineHeight: '1.6' }}>
              Are you sure you want to log out of your account?
              <br />
              You will need to log in again to access the workshops.
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
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}