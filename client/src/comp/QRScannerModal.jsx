import React, { useState } from 'react';
import { useZxing } from 'react-zxing';

// --- Définition des couleurs pour un design cohérent ---
const COLORS = {
  primary: "#2563eb",    // Bleu professionnel
  success: "#16a34a",    // Vert pour le succès
  error: "#dc2626",      // Rouge pour l'erreur
  background: "#ffffff", // Fond blanc
  text: "#1f2937",       // Texte sombre
  overlay: "rgba(0, 0, 0, 0.75)" // Fond sombre transparent
};

// --- Nouveaux Composants d'icônes pour la rétroaction de l'API ---
const CheckCircleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.58" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const XCircleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
const LoadingIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>;

// AJOUT du prop scanType
export default function QRScannerModal({ isOpen, onClose, correctQR, onSuccess, scanType = 'entry' }) { 
  const [status, setStatus] = useState("idle"); // idle, scanned_success, error, sending, api_result
  const [tempScannedValue, setTempScannedValue] = useState(null); // Stocker la valeur avant confirmation
  // NOUVEAU: Stocker le résultat de l'API: { success: boolean, message: string }
  const [apiResult, setApiResult] = useState(null);

  // Déterminer le titre du modal basé sur le scanType
  const action = scanType === 'entry' ? 'Entrer' : 'Sortir';
  const headingText = `Scan QR Code to ${action}`;

  const { ref } = useZxing({
    onDecodeResult(decoded) {
      // Arrêter le traitement si nous attendons déjà la confirmation ou le résultat de l'API
      if (status === "scanned_success" || status === "sending" || status === "api_result") return;

      const value = decoded.getText();

      if (value === correctQR) {
        // 1. Code correct : Prêt pour l'envoi
        setStatus("scanned_success"); // Changement d'état
        setTempScannedValue(value);
      } else {
        // 2. Code incorrect : Erreur de scan locale
        setStatus("error");
        setTimeout(() => {
          if (status !== "scanned_success") setStatus("idle");
        }, 2000);
      }
    },
    onError(error) {
      // console.warn("Erreur caméra ignorée :", error);
    },
    // Options pour améliorer la performance
    hints: new Map([['TRY_HARDER', true]]),
    timeBetweenDecodingAttempts: 300,
  });

  // Gestion du clic sur le bouton de confirmation
  const handleConfirmClick = async () => {
    if (tempScannedValue) {
      setStatus("sending"); // Afficher le statut d'envoi
      setApiResult(null);

      // MODIFICATION CLÉ: Passer la valeur scannée ET le scanType au parent
      const result = await onSuccess(tempScannedValue, scanType); 

      setApiResult(result);
      setStatus("api_result"); // Afficher le résultat final
    }
  };

  // Fermeture du modal et réinitialisation complète
  const handleCloseInternal = () => {
    setStatus("idle");
    setTempScannedValue(null);
    setApiResult(null); // IMPORTANT: réinitialiser le résultat de l'API
    onClose();
  }

  // Fonction pour scanner un autre code après un résultat API
  const handleScanAgain = () => {
    setStatus("idle");
    setTempScannedValue(null);
    setApiResult(null);
  }


  if (!isOpen) return null;

  // Déterminer la couleur de la bordure et le contenu à afficher
  const borderColor = apiResult
    ? (apiResult.success ? COLORS.success : COLORS.error)
    : (status === "scanned_success" ? COLORS.success : status === "error" ? COLORS.error : "#e5e7eb");


  return (
    <div className="scanner-overlay" onClick={handleCloseInternal} style={styles.overlay}>
      <div className="scanner-modal" onClick={(e) => e.stopPropagation()} style={styles.modalContainer}>

        {/* Bouton de fermeture */}
        <button onClick={handleCloseInternal} style={styles.closeButton}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 style={styles.heading}>{headingText}</h3> {/* 👈 TITRE MIS À JOUR */}
        <p style={styles.subText}>Please point the camera at the workshop's QR code.</p>

        {/* Conteneur vidéo avec bordure d'état */}
        <div style={{ ...styles.videoWrapper, borderColor: borderColor }}>
          {/* Afficher la vidéo/lecteur uniquement si on attend le scan */}
          {(status === "idle" || status === "error") && (
            <>
              <div style={styles.viewfinderLayer}>
                <div style={{ ...styles.cornerMarker, top: 10, left: 10, borderTop: '4px solid ' + COLORS.primary, borderLeft: '4px solid ' + COLORS.primary }}></div>
                <div style={{ ...styles.cornerMarker, top: 10, right: 10, borderTop: '4px solid ' + COLORS.primary, borderRight: '4px solid ' + COLORS.primary }}></div>
                <div style={{ ...styles.cornerMarker, bottom: 10, left: 10, borderBottom: '4px solid ' + COLORS.primary, borderLeft: '4px solid ' + COLORS.primary }}></div>
                <div style={{ ...styles.cornerMarker, bottom: 10, right: 10, borderBottom: '4px solid ' + COLORS.primary, borderRight: '4px solid ' + COLORS.primary }}></div>
              </div>
              <video ref={ref} autoPlay playsInline muted style={styles.videoElement} />
            </>
          )}

          {/* Écran de chargement ou de confirmation avant envoi */}
          {(status === "scanned_success" || status === "sending" || status === "api_result") && (
            <div style={{ ...styles.videoElement, backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Afficher un aperçu ou rien */}
            </div>
          )}
        </div>

        {/* Zone de statut et boutons */}
        <div style={styles.statusArea}>
          {/* 1. État initial ou erreur locale */}
          {(status === "idle" || status === "error") && (
            <div style={{ color: status === "error" ? COLORS.error : COLORS.text, display: 'flex', alignItems: 'center', gap: 8, fontWeight: status === "error" ? '600' : '400' }}>
              {status === "error" ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={COLORS.error}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                  Code incorrect, réessayez.
                </>
              ) : (
                <>
                  <span style={{ fontSize: 20 }}>📷</span> Searching for code…
                </>
              )}
            </div>
          )}

          {/* 2. Code scanné et prêt à envoyer */}
          {status === "scanned_success" && (
            <div style={styles.successContainer}>
              <div style={{ color: COLORS.success, display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill={COLORS.success}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                Code reconnu avec succès !
              </div>
              {/* --- Bouton de confirmation --- */}
              <button onClick={handleConfirmClick} style={styles.confirmButton}>
                Confirmer {action}
              </button>
            </div>
          )}

          {/* 3. État d'envoi (Loading) */}
          {status === "sending" && (
            <div style={{ color: COLORS.primary, display: 'flex', alignItems: 'center', gap: 8, fontWeight: '600' }}>
              <LoadingIcon width="24" height="24" style={{ animation: 'spin 1s linear infinite' }} />
              Envoi de la présence au serveur...
            </div>
          )}

          {/* 4. Résultat final de l'API (Succès ou Échec) */}
          {status === "api_result" && apiResult && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
              <div style={{ color: apiResult.success ? COLORS.success : COLORS.error, marginBottom: 15 }}>
                {apiResult.success ? <CheckCircleIcon fill="currentColor" /> : <XCircleIcon fill="currentColor" />}
              </div>
              <p style={{ color: COLORS.text, fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 15 }}>
                {apiResult.message}
              </p>

              {/* Bouton pour rescanner ou fermer */}
              <button onClick={apiResult.success ? handleCloseInternal : handleScanAgain} style={{ ...styles.confirmButton, backgroundColor: apiResult.success ? COLORS.primary : '#6b7280', maxWidth: 200 }}>
                {apiResult.success ? 'Terminé' : 'Scanner à nouveau'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// --- Styles CSS en JS (AJOUT D'ANIMATION) ---
const styles = {
  // ... (Les styles précédents restent les mêmes)
  // ...
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
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.scanner-modal button:active { transform: scale(0.98) !important; }
.scanner-modal .close-btn:hover { background-color: #e5e7eb !important; }
`;
// Vérifie si le style est déjà injecté pour éviter les doublons
if (!document.head.querySelector('style[data-scanner-styles]')) {
    styleSheet.setAttribute('data-scanner-styles', 'true');
    document.head.appendChild(styleSheet);
}