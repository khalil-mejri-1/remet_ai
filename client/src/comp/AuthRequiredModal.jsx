// AuthRequiredModal.jsx

import React from 'react';

const AuthRequiredModal = ({ isOpen, onClose, onRedirectToAuth, XIcon }) => {
    if (!isOpen) return null;

    // Le style 'rm-modal-container-light' sera défini dans la section CSS pour l'apparence claire
    return (
        <div className="rm-overlay" onClick={onClose}>
            <div
                className="rm-modal-container"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 30px' }}
            >
                <button
                    className="rm-close-btn"
                    onClick={onClose}
                >
                    <XIcon />
                </button>

                <div style={{ fontSize: '3rem', marginBottom: '15px', color: '#f59e0b' }}>⚠️</div>

                <h2 style={{ marginBottom: '10px', color: '#0f172a' }}>Connexion requise pour la présence</h2>
                <p style={{ marginBottom: '30px', color: '#64748b', lineHeight: '1.5' }}>
                    Vous ne pouvez pas enregistrer votre présence sans être connecté. Veuillez vous identifier pour continuer.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                    <button
                        className="nav-register-btn"
                        onClick={() => onRedirectToAuth('register')}
                        style={{ width: '100%', justifyContent: 'center', backgroundColor: '#3b82f6' }}
                    >
                        Create Account
                    </button>

                    <button
                        className="login-button"
                        onClick={() => onRedirectToAuth('login')}
                        style={{ width: '100%', justifyContent: 'center', backgroundColor: '#e5e7eb', color: '#374151' }}
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthRequiredModal;