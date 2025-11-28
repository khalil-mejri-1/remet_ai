// src/comp/EntryExitModal.jsx
import React from 'react';

const EntryExitModal = ({ isOpen, onClose, onSelectScan, EnterIcon, ExitIcon, XIcon }) => {
    if (!isOpen) return null;

    return (
        // Le clic sur l'overlay ferme le modal
        <div className="prog-modal-overlay" onClick={onClose}>
            <div 
                className="prog-modal-content entry-exit-modal" 
                // Empêche la fermeture du modal au clic interne
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="prog-modal-header">
                    <h3>Select Scan Type</h3>
                    <button onClick={onClose} className="prog-close-btn"><XIcon /></button>
                </div>
                
                <p>Please choose your action for attendance.</p>

                <div className="entry-exit-actions" style={{display:"flex",gap:"5px",border:"red solid 0px",width:"300px",margin:"auto"}}>
                    <button 
                        className="ks-add-btn"
                        // Au clic, il ouvre le scanner avec le type 'entry'
                        onClick={() => onSelectScan('entry')} 
                    >
                        <EnterIcon />
                       Check In
                    </button>
                    
                    <button 
                        className="ks-add-btn"
                        // Au clic, il ouvre le scanner avec le type 'exit'
                        onClick={() => onSelectScan('exit')} 
                    >
                        <ExitIcon />
                        Check Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EntryExitModal;