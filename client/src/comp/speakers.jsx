import React from 'react';

// 1. بيانات المتحدثين
const speakersData = [
  {
    id: 1,
    name: 'Dr. Samar Bouazizi',
    title: 'CHERCHEUSE EN IA',
    description: 'Spécialiste en apprentissage profond et réseaux neuronaux',
    expertType: 'ia',
  },
  {
    id: 2,
    name: 'Dr. Hela Ltifi',
    title: 'EXPERT EN APPLICATIONS INDUSTRIELLES',
    description: 'Pionnière en éthique de l’IA',
    expertType: 'expert',
  },
  {
    id: 3,
    name: 'Dr. Rebh Soltani',
    title: 'CHERCHEUSE EN IA',
    description: 'Spécialiste NLP',
    expertType: 'ia',
  },
  {
    id: 4,
    name: 'Dr. Nessrine Jellali',
    title: 'CHERCHEUSE EN IA',
    description: 'Spécialiste en Vision par Ordinateur',
    expertType: 'ia',
  },
];

// 2. المكون الفرعي لبطاقة المتحدث
const SpeakerCard = ({ speaker }) => {
  // تحديد الفئة بناءً على نوع الخبير لتطبيق اللون من ملف CSS
  const titleClass = speaker.expertType === 'expert' ? 'expert-title' : 'ia-title';

  return (
    <div className="speaker-card">
      {/*Placeholder للصورة */}
      <div className="speaker-photo-placeholder">
        <span className="photo-text">Photo</span>
      </div>

      {/* تفاصيل المتحدث */}
      <div className="speaker-details">
        <h3 className="speaker-name">{speaker.name}</h3>
        {/* العنوان الرئيسي بلون أزرق مخصص من ملف CSS */}
        <p className={`speaker-title ${titleClass}`}>{speaker.title}</p>
        {/* الوصف/التخصص */}
        <p className="speaker-description">{speaker.description}</p>
      </div>
    </div>
  );
};

// 3. المكون الرئيسي للمتحدثين
export default function Speakers() {
  return (
    <section className="speakers-section">
      <h2 className="section-title">Speakers  </h2>
      <div className="speakers-grid">
        {speakersData.map((speaker) => (
          <SpeakerCard key={speaker.id} speaker={speaker} />
        ))}
      </div>
    </section>
  );
}