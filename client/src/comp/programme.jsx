import React, { useState } from 'react';

const fullProgrammeData = {
  'Jour 1': [
    { id: 1, time: '08:30 - 09:00', title: "Enregistrement des participants et retrait des kits", type: 'break', icon: '📝' },
    { id: 2, time: '09:00 - 10:30', title: 'Modèles, Architecture et Implémentation du Deep Learning', ledBy: 'Dirigé par : Dr. Khalil Mejri', type: 'session', icon: '🧠' },
    { id: 3, time: '10:30 - 11:00', title: 'Pause café et Networking', type: 'break', icon: '☕' },
    { id: 4, time: '11:00 - 12:30', title: 'Éthique dans l’IA : Construire des Systèmes Responsables', ledBy: 'Dirigé par : Dr. Hela Ltifi', type: 'keynote', icon: '⚖️' },
    { id: 5, time: '12:30 - 13:30', title: 'Déjeuner (Networking Lunch)', type: 'break', icon: '🍽️' },
    { id: 6, time: '13:30 - 15:00', title: 'Vision par Ordinateur : Applications Avancées', ledBy: 'Dirigé par : Dr. Nessrine Jellali', type: 'session', icon: '👁️' },
    { id: 7, time: '15:00 - 16:00', title: 'Table Ronde : L\'Avenir de l\'IA dans l\'Industrie', ledBy: 'Modéré par : Dr. Rebh Soltani', type: 'panel', icon: '💬' },
  ],
  'Jour 2': [
    { id: 10, time: '09:00 - 09:30', title: 'Accueil et Session de Synthèse du Jour 1', type: 'break', icon: '📝' },
    { id: 11, time: '09:30 - 11:00', title: 'Atelier Pratique: MLOps', ledBy: 'Dirigé par : Expert MLOps', type: 'session', icon: '⚙️' },
    { id: 12, time: '11:00 - 11:30', title: 'Pause Technique', type: 'break', icon: '☕' },
    { id: 13, time: '11:30 - 13:00', title: 'Keynote : L\'Impact de l\'IA Générative', ledBy: 'Dirigé par : Dr. Amira Benali', type: 'keynote', icon: '💡' },
    { id: 14, time: '13:00 - 14:00', title: 'Déjeuner (Business Lunch)', type: 'break', icon: '🍽️' },
    { id: 15, time: '14:00 - 15:30', title: 'Cas d\'Étude: IA dans la Santé', ledBy: 'Dirigé par : Dr. Sami Gharbi', type: 'session', icon: '⚕️' },
    { id: 16, time: '15:30 - 16:30', title: 'Clôture et Certificats', type: 'closing', icon: '🏆' },
  ],
};

const days = Object.keys(fullProgrammeData);

export default function Programme() {
  const [activeDay, setActiveDay] = useState(days[0]);
  const programmeData = fullProgrammeData[activeDay];

  return (
    <section className="programme-section">
      <h2 className="programme-title">📅 Agenda de la Conférence</h2>

      <div className="day-tabs-container">
        {days.map((day) => (
          <button
            key={day}
            className={`day-tab-button ${activeDay === day ? 'active' : ''}`}
            onClick={() => setActiveDay(day)}
          >
            {day}
          </button>
        ))}
      </div>
      
      <div className="timeline-container">
        {programmeData.map((item) => (
          <div key={item.id} className={`programme-item ${item.type}`}>
            
            <div className="time-marker">
              {item.icon}
            </div>

            <div className="programme-content">
              <span className="item-time">{item.time}</span>
              <h3 className="item-title">{item.title}</h3>
              {item.ledBy && (
                <p className="item-led-by">
                  {item.ledBy}
                </p>
              )}
            </div>
            
          </div>
        ))}
      </div>
    </section>
  );
}