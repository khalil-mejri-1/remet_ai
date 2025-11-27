import React from 'react';

const KeySessions = () => {
  const sessions = [
    {
      id: 1,
      title: "Rethinking the Human-AI relationship: challenges, limitations and opportunities",
      speaker: "Pr. Mohamed Mohsen Gammoudi",
      role: "Keynote Speaker",
      // Image générique "Professeur/Expert"
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
          <path d="M4.93 19.07a10 10 0 0 1 14.14 0"/>
          <path d="M16.24 7.76a6 6 0 1 0-8.49 0"/>
        </svg>
      )
    },
    {
      id: 2,
      title: "Learning in the age of AI : understand, adapt, excel",
      speaker: "Pr. Adel Alimi",
      role: "Guest of Honor",
      // Image générique "Professeur/Expert"
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10v6"/>
          <path d="M2 10l10-5 10 5-10 5z"/>
          <path d="M12 12v9"/>
        </svg>
      )
    }
  ];

  return (
    <section className="ks-section">
      <div className="ks-container">
        
        <div className="ks-header">
          <span className="ks-badge">Highlights</span>
          <h2 className="ks-title">Key Sessions</h2>
          <div className="ks-line"></div>
        </div>

        <div className="ks-grid">
          {sessions.map((session) => (
            <div key={session.id} className="ks-card">
              {/* Fond décoratif de la carte */}
              <div className="ks-card-bg"></div>
              
              <div className="ks-content">
                <div className="ks-icon-box">
                  {session.icon}
                </div>
                
                <h3 className="ks-session-title">{session.title}</h3>
                
                <div className="ks-divider"></div>
                
                <div className="ks-speaker-info">
                  <div className="ks-img-wrapper">
                    <img src={session.image} alt={session.speaker} className="ks-speaker-img" />
                    <div className="ks-online-dot"></div>
                  </div>
                  <div className="ks-speaker-text">
                    <span className="ks-role">{session.role}</span>
                    <h4 className="ks-name">{session.speaker}</h4>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default KeySessions;