import React, { useState } from 'react';
import Navbar from '../comp/navbar';
import { Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
    
        <Navbar/>
        <br /><br />
    <div className="re-page-container">
      <div className="re-content-wrapper">
        
        {/* --- PARTIE GAUCHE : VISUEL CRÉATIF (Style Login Glass) --- */}
        <div className="re-visual-side">
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" 
            alt="Future Tech" 
            className="re-bg-image" 
          />
          <div className="re-overlay"></div>
          
          {/* Carte Glassmorphism (Identique au Login mais contenu VIP) */}
          <div className="re-glass-card">
            <div className="re-card-icon">💎</div>
            <h3>Devenez Membre VIP</h3>
            <p>Débloquez l'accès complet aux conférences, ateliers et ressources exclusives.</p>
            
            {/* Preuve Sociale (Avatars) */}
            <div className="re-avatars">
              <img src="https://i.pravatar.cc/100?img=12" alt="User" />
              <img src="https://i.pravatar.cc/100?img=33" alt="User" />
              <img src="https://i.pravatar.cc/100?img=59" alt="User" />
              <span className="re-more">PRO</span>
            </div>
          </div>
        </div>

        {/* --- PARTIE DROITE : FORMULAIRE --- */}
        <div className="re-form-side">
          <div className="re-header">
            <h1 className="re-title">Créer un compte</h1>
            <p className="re-subtitle">Rejoignez la communauté des innovateurs.</p>
          </div>

          <form className="re-form">
            
            {/* Nom Complet */}
            <div className="re-input-group">
              <label>Nom complet</label>
              <div className="re-input-wrapper">
                <input 
                  type="text" 
                  name="fullname"
                  placeholder="Votre nom" 
                  value={formData.fullname}
                  onChange={handleChange}
                />
                <span className="re-icon">👤</span>
              </div>
            </div>

            {/* Email */}
            <div className="re-input-group">
              <label>Email professionnel</label>
              <div className="re-input-wrapper">
                <input 
                  type="email" 
                  name="email"
                  placeholder="nom@tech.com" 
                  value={formData.email}
                  onChange={handleChange}
                />
                <span className="re-icon">✉️</span>
              </div>
            </div>

            {/* Mot de passe (Double colonne) */}
            <div className="re-row">
              <div className="re-input-group">
                <label>Mot de passe</label>
                <div className="re-input-wrapper">
                  <input 
                    type="password" 
                    name="password"
                    placeholder="••••••" 
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <span className="re-icon">🔒</span>
                </div>
              </div>
              <div className="re-input-group">
                <label>Confirmer</label>
                <div className="re-input-wrapper">
                  <input 
                    type="password" 
                    name="confirmPassword"
                    placeholder="••••••" 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <span className="re-icon">🛡️</span>
                </div>
              </div>
            </div>

            {/* Checkbox Terms */}
            <div className="re-terms">
              <label className="re-checkbox">
                <input type="checkbox" />
                <span>J'accepte les <a href="#">Conditions d'utilisation</a></span>
              </label>
            </div>

            <button type="submit" className="re-submit-btn">
              Commencer l'aventure
              <span className="re-shine"></span>
            </button>

            <div className="re-divider">Ou s'inscrire avec</div>

            <div className="re-socials">
              <button type="button" className="re-social-btn">G</button>
              <button type="button" className="re-social-btn">in</button>
              <button type="button" className="re-social-btn">𝕏</button>
            </div>

          </form>

          <p className="re-footer">
            Déjà membre ? <Link to="/login">Connectez-vous</Link>
          </p>
        </div>

      </div>
    </div>
    </>

  )
}