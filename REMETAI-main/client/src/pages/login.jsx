import React, { useState } from 'react';
import Navbar from '../comp/navbar';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", email, password);
  };

  return (
    <>
    <Navbar/>
    <br /><br />
       <div className="lo-page-container">
      <div className="lo-content-wrapper">
        
        {/* --- PARTIE GAUCHE : FORMULAIRE --- */}
        <div className="lo-form-side">
          <div className="lo-header">
            <div className="lo-logo-mark">AI</div>
            <h1 className="lo-title">Bon retour !</h1>
            <p className="lo-subtitle">Entrez vos identifiants pour accéder à votre espace.</p>
          </div>

          <form onSubmit={handleSubmit} className="lo-form">
            
            {/* Input Email */}
            <div className="lo-input-group">
              <label htmlFor="email">Email professionnel</label>
              <div className="lo-input-wrapper">
                <input 
                  type="email" 
                  id="email" 
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="lo-input-icon">✉️</span>
              </div>
            </div>

            {/* Input Password */}
            <div className="lo-input-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="lo-input-wrapper">
                <input 
                  type="password" 
                  id="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="lo-input-icon">🔒</span>
              </div>
            </div>

            {/* Options */}
            <div className="lo-actions">
              <label className="lo-checkbox">
                <input type="checkbox" />
                <span>Se souvenir de moi</span>
              </label>
              <a href="#" className="lo-forgot">Mot de passe oublié ?</a>
            </div>

            {/* Bouton Principal */}
            <button type="submit" className="lo-submit-btn">
              Se connecter
              <span className="lo-btn-arrow">→</span>
            </button>

            {/* Séparateur */}
            <div className="lo-divider">
              <span>Ou continuer avec</span>
            </div>

            {/* Social Login */}
            <div className="lo-social-buttons">
              <button type="button" className="lo-social-btn google">
                <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" />
                Google
              </button>
              <button type="button" className="lo-social-btn linkedin">
                <img src="https://img.icons8.com/color/48/000000/linkedin.png" alt="LinkedIn" />
                LinkedIn
              </button>
            </div>
          </form>
<Link to="/register" style={{textDecoration:"none"}}>

     <p className="lo-footer-text">
            Pas encore de compte ? <a href="#">Inscrivez-vous </a>
          </p>
</Link>
     
        </div>

        {/* --- PARTIE DROITE : VISUEL CREATIF --- */}
        <div className="lo-visual-side">
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" 
            alt="Abstract Tech" 
            className="lo-bg-image" 
          />
          <div className="lo-overlay"></div>
          
          {/* Carte Flottante (Glassmorphism) */}
          <div className="lo-glass-card">
            <div className="lo-card-icon">🚀</div>
            <h3>L'Innovation commence ici.</h3>
            <p>Rejoignez une communauté de plus de 5000 experts en Intelligence Artificielle.</p>
            <div className="lo-avatars">
              <img src="https://i.pravatar.cc/100?img=1" alt="User" />
              <img src="https://i.pravatar.cc/100?img=5" alt="User" />
              <img src="https://i.pravatar.cc/100?img=8" alt="User" />
              <span className="lo-more">+2k</span>
            </div>
          </div>
        </div>

      </div>
    </div>
    </>
 
  )
}