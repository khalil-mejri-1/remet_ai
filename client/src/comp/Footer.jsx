import React from 'react';
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="modern-footer">
      <div className="footer-content">
        <h3 className="footer-brand">REMET-AI 2026</h3>
        <p className="footer-tagline">AI GENERATION : LEAD THE CHANGE</p>

        <div className="social-links">
          <a href="https://www.facebook.com/profile.php?id=61576808901014&mibextid=wwXIfr&rdid=F7XPOn1HD84AslVv&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1CDUdp267n%2F%3Fmibextid%3DwwXIfr#" target="_blank" rel="noopener noreferrer" className="social-icon fb"><FaFacebook /></a>
          <a href="https://www.instagram.com/remet_ai/" target="_blank" rel="noopener noreferrer" className="social-icon insta"><FaInstagram /></a>
          <a href="https://www.tiktok.com/@remet_ai" target="_blank" rel="noopener noreferrer" className="social-icon tiktok"><FaTiktok /></a>
          <a href="https://www.youtube.com/channel/UCTftGjGyHGhthNyA92PW88A" target="_blank" rel="noopener noreferrer" className="social-icon yt"><FaYoutube /></a>
        </div>
      </div>

      <style>{`
        .modern-footer {
          background: white;
          border-top: 1px solid #e2e8f0;
          padding: 30px 20px; /* Slight increase for spacing */
          margin-top: 10px;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .footer-brand {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
          letter-spacing: 1px;
        }

        .footer-tagline {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          margin: 0 0 20px 0; /* Added margin bottom for icons */
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        /* --- Social Media Icons --- */
        .social-links {
          display: flex;
          justify-content: center;
          gap: 25px;
          margin-top: 15px;
        }

        .social-icon {
          font-size: 1.3rem;
          color: #94a3b8;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .social-icon:hover {
          transform: translateY(-5px) scale(1.1);
        }

        /* Brand Colors on Hover */
        .social-icon.fb:hover { color: #1877F2; }
        .social-icon.insta:hover { color: #E4405F; }
        .social-icon.tiktok:hover { color: #000000; }
        .social-icon.yt:hover { color: #FF0000; }

        @media (max-width: 768px) {
          .footer-brand {
            font-size: 1rem;
          }

          .footer-tagline {
            font-size: 0.7rem;
            margin-bottom: 15px;
          }
          
          .social-links {
             gap: 20px;
          }
          
          .social-icon {
             font-size: 1.2rem;
          }
        }

        @media (max-width: 480px) {
          .modern-footer {
            padding: 20px 15px;
          }
          
          .footer-brand {
            font-size: 0.9rem;
          }
          
          .footer-tagline {
            font-size: 0.65rem;
          }
           
          .social-links {
            gap: 15px;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </footer>
  );
}