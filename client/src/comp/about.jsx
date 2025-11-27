import React from 'react';

const About = () => {
  const teamMembers = [
    { 
      id: 1, 
      name: 'Dr. Sarah Ahmed', 
      role: 'CEO & Founder', 
      // Image : Femme professionnelle tech
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' 
    },
    { 
      id: 2, 
      name: 'Ing. Khaled Omar', 
      role: 'Lead AI Architect', 
      // Image : Homme développeur
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80' 
    },
    { 
      id: 3, 
      name: 'Laila Mahmoud', 
      role: 'Head of Product', 
      // Image : Femme créative
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' 
    },
    { 
      id: 4, 
      name: 'Youssef Ali', 
      role: 'Data Scientist', 
      // Image : Homme tech
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' 
    },
  ];

  return (
    <div className="ab-main-container">
      {/* Background Grid Decoration */}
      <div className="ab-grid-bg"></div>

      {/* Hero Section */}
      <section className="ab-hero-section">
        <div className="ab-hero-content">
          <span className="ab-badge">Notre Vision</span>
          <h1 className="ab-hero-title">L'Intelligence <br /><span className="ab-text-gradient">Au Service de l'Humain.</span></h1>
          <p className="ab-hero-desc">
            Nous fusionnons algorithmes avancés et design intuitif pour créer les solutions de demain. Une approche où la technologie s'efface pour laisser place à l'expérience.
          </p>
        </div>
        
        <div className="ab-hero-visual">
          {/* Image : Robot Hand / AI Connection */}
          <div className="ab-img-container-tech">
            <img 
              src="https://i.ibb.co/VY6wYZCk/638e0d51-4814-4df7-9743-56d4c2e8fc9b.jpg" 
              alt="AI Vision" 
              className="ab-hero-img"
            />
            {/* Éléments flottants décoratifs */}
            <div className="ab-tech-card float-1">
                <span style={{fontWeight:"700"}}>REMET - AI</span>
               
            </div>
            <div className="ab-tech-dots"></div>
          </div>
        </div>
      </section>

   

      {/* Team Section */}
      <section className="ab-team-section">
        <div className="ab-header-center">
            <h2 className="ab-section-title">Les Architectes du Futur</h2>
            <p className="ab-section-subtitle">Une expertise pluridisciplinaire pour des défis complexes.</p>
        </div>
        
        <div className="ab-team-grid">
          {teamMembers.map(member => (
            <div key={member.id} className="ab-team-card">
              <div className="ab-img-ring-container">
                <div className="ab-img-ring"></div>
                <img src={member.image} alt={member.name} className="ab-member-img" />
              </div>
              <h3 className="ab-member-name">{member.name}</h3>
              <p className="ab-member-role">{member.role}</p>
              
              <div className="ab-social-dots">
                  <span></span><span></span><span></span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default About;