import React, { useState } from 'react';
import { useZxing } from 'react-zxing';

// --- Définition des couleurs pour un design cohérent ---
const COLORS = {
  primary: "#2563eb",    // Bleu professionnel
  success: "#16a34a",    // Vert pour le succès
  error: "#dc2626",      // Rouge pour l'erreur
  background: "#ffffff", // Fond blanc
  text: "#1f2937",       // Texte sombre
  overlay: "rgba(0, 0, 0, 0.75)" // Fond sombre transparent
};

export default function QRScannerModal({ isOpen, onClose, correctQR, onSuccess }) {
  const [status, setStatus] = useState("idle"); // idle, success, error
  const [tempScannedValue, setTempScannedValue] = useState(null); // Stocker la valeur avant confirmation

  const { ref } = useZxing({
    onDecodeResult(decoded) {
      // Si nous avons déjà scanné un code correct et attendons la confirmation
      if (status === "success" && tempScannedValue) return;

      const value = decoded.getText();

      if (value === correctQR) {
        // 1. Code correct : Changer l'état et stocker la valeur (pas d'envoi direct)
        setStatus("success");
        setTempScannedValue(value);
      } else {
        // 2. Code incorrect : Afficher une erreur brièvement puis revenir en attente
        setStatus("error");
        setTimeout(() => {
            if (status !== "success") setStatus("idle");
        }, 2000);
      }
    },
    onError(error) {
      // Ignorer les erreurs mineures de la caméra
      // console.warn("Erreur caméra ignorée :", error);
    },
     // Options pour améliorer la performance
     hints: new Map([['TRY_HARDER', true]]),
     timeBetweenDecodingAttempts: 300,
  });

  // Gestion du clic sur le bouton de confirmation
  const handleConfirmClick = () => {
    if (tempScannedValue) {
      onSuccess(tempScannedValue);
      // Réinitialiser l'état après l'envoi (Optionnel)
      // setStatus("idle"); 
      // setTempScannedValue(null);
    }
  };

  // Fermeture du modal et réinitialisation
  const handleCloseInternal = () => {
      setStatus("idle");
      setTempScannedValue(null);
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="scanner-overlay" onClick={handleCloseInternal} style={styles.overlay}>
      <div className="scanner-modal" onClick={(e) => e.stopPropagation()} style={styles.modalContainer}>
        
        {/* Bouton de fermeture */}
        <button onClick={handleCloseInternal} style={styles.closeButton}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 style={styles.heading}>Enregistrement de présence</h3>
        <p style={styles.subText}>Veuillez pointer la caméra vers le code QR de l'atelier.</p>

        {/* Conteneur vidéo avec bordure d'état */}
        <div style={{
            ...styles.videoWrapper,
            borderColor: status === "success" ? COLORS.success : status === "error" ? COLORS.error : "#e5e7eb"
        }}>
           {/* Repères visuels (Viewfinder) */}
          <div style={styles.viewfinderLayer}>
              <div style={{...styles.cornerMarker, top: 10, left: 10, borderTop: '4px solid '+COLORS.primary, borderLeft: '4px solid '+COLORS.primary}}></div>
              <div style={{...styles.cornerMarker, top: 10, right: 10, borderTop: '4px solid '+COLORS.primary, borderRight: '4px solid '+COLORS.primary}}></div>
              <div style={{...styles.cornerMarker, bottom: 10, left: 10, borderBottom: '4px solid '+COLORS.primary, borderLeft: '4px solid '+COLORS.primary}}></div>
              <div style={{...styles.cornerMarker, bottom: 10, right: 10, borderBottom: '4px solid '+COLORS.primary, borderRight: '4px solid '+COLORS.primary}}></div>
          </div>

          <video ref={ref} autoPlay playsInline muted style={styles.videoElement} />
        </div>

        {/* Zone de statut et boutons */}
        <div style={styles.statusArea}>
            {status === "idle" && (
                 <div style={{color: COLORS.text, display: 'flex', alignItems: 'center', gap: 8}}>
                    <span style={{fontSize: 20}}>📷</span> Recherche du code...
                 </div>
            )}
            {status === "error" && (
                 <div style={{color: COLORS.error, display: 'flex', alignItems: 'center', gap: 8, fontWeight: '600'}}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={COLORS.error}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                   Code incorrect, réessayez.
                 </div>
            )}
            {status === "success" && (
                <div style={styles.successContainer}>
                     <div style={{color: COLORS.success, display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 'bold', marginBottom: 15}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill={COLORS.success}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                         Code reconnu avec succès !
                     </div>
                     {/* --- Bouton de confirmation --- */}
                     <button onClick={handleConfirmClick} style={styles.confirmButton}>
                        Confirmer la présence
                     </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}

// --- Styles CSS en JS ---
const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, width: "100vw", height: "100vh",
    backgroundColor: COLORS.overlay,
    backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999,
    transition: "opacity 0.3s ease"
  },
  modalContainer: {
    position: "relative",
    width: "90%", maxWidth: 420,
    background: COLORS.background,
    padding: "30px 20px",
    borderRadius: 20,
    textAlign: "center",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    display: 'flex', flexDirection: 'column', alignItems: 'center'
  },
  closeButton: {
    position: "absolute", top: 15, right: 15,
    background: "#f3f4f6", border: "none", borderRadius: "50%",
    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: COLORS.text, cursor: "pointer", transition: "background 0.2s"
  },
  heading: {
    margin: "0 0 10px 0",
    color: COLORS.text,
    fontSize: "1.5rem", fontWeight: "700"
  },
  subText: {
      margin: "0 0 20px 0", color: "#6b7280", fontSize: "0.95rem"
  },
  videoWrapper: {
    width: "100%", height: 280,
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: "3px", borderStyle: "solid",
    boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    transition: "border-color 0.3s ease"
  },
  videoElement: {
      width: "100%", height: "100%", objectFit: "cover"
  },
  viewfinderLayer: {
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2
  },
  cornerMarker: {
      position: 'absolute', width: 30, height: 30, opacity: 0.7
  },
  statusArea: {
      marginTop: 25, minHeight: 60, display: 'flex', justifyContent: 'center', width: '100%'
  },
  successContainer: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', animation: "fadeIn 0.3s ease-in-out"
  },
  confirmButton: {
      backgroundColor: COLORS.success,
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      fontSize: '1rem',
      fontWeight: '600',
      borderRadius: 10,
      cursor: 'pointer',
      width: '100%',
      maxWidth: '280px',
      boxShadow: "0 4px 6px -1px rgba(22, 163, 74, 0.2), 0 2px 4px -1px rgba(22, 163, 74, 0.1)",
      transition: "transform 0.1s ease, background-color 0.2s",
  }
};

// Injection de styles globaux pour l'animation
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.scanner-modal button:active { transform: scale(0.98) !important; }
.scanner-modal .close-btn:hover { background-color: #e5e7eb !important; }
`;
document.head.appendChild(styleSheet);