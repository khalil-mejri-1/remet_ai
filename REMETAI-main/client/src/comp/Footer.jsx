import React from 'react';

export default function Footer() {
  return (
    <footer className="modern-footer">
      <div className="footer-content">
        <h3 className="footer-brand">REMET-AI 2026</h3>
        <p className="footer-tagline">AI GENERATION : LEAD THE CHANGE</p>
      </div>

      <style>{`
        .modern-footer {
          background: white;
          border-top: 1px solid #e2e8f0;
          padding: 25px 20px;
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
          margin: 0;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        @media (max-width: 768px) {
          .footer-brand {
            font-size: 1rem;
          }

          .footer-tagline {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </footer>
  );
}