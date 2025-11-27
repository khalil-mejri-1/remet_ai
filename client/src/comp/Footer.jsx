import React from 'react';

// بيانات الروابط المجمعة
const footerLinks = [
  {
    title: "Événement",
    links: [
      { name: "Agenda", url: "#programme" },
      { name: "Conférenciers", url: "#speakers" },
      { name: "Partenaires", url: "#partners" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "FAQ", url: "#faq" },
      { name: "Contactez-nous", url: "#contact" },
      { name: "Politique de confidentialité", url: "#privacy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="ai-footer">
      <div className="footer-container">
        
        {/* 1. قسم العلامة التجارية والمعلومات الأساسية */}
        <div className="footer-brand">
          <h3 className="brand-title">REMET AI <span className="year">2025</span></h3>
          <p className="brand-slogan">
            Façonner l'avenir de l'intelligence artificielle.
          </p>
          {/* أيقونات وسائل التواصل الاجتماعي Placeholder */}
          <div className="social-icons">
            <a href="#facebook" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#twitter" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="#linkedin" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>

        {/* 2. قسم الروابط الملاحية */}
        {footerLinks.map((section, index) => (
          <div key={index} className="footer-links-section">
            <h4>{section.title}</h4>
            <ul>
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <a href={link.url}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* 3. قسم الاشتراك أو الاتصال المباشر */}
        <div className="footer-contact">
          <h4>Restez Informés</h4>
          <p>Abonnez-vous à notre newsletter pour les dernières mises à jour.</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Votre email" aria-label="Adresse email" required />
            <button type="submit">S'abonner</button>
          </form>
        </div>
      </div>

      {/* 4. قسم حقوق النشر السفلي */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AI Summit 2025. Tous droits réservés.</p>
        <p>Conçu avec 🤖 et 💡.</p>
      </div>
    </footer>
  );
}