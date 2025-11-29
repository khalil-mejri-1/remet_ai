// src/comp/EntryExitModal.jsx
import React from 'react';

// ✅ يجب أن تستقبل isOpen من الـ props
const EntryExitModal = ({ isOpen, onClose, onSelectScan, sessionId, EnterIcon, ExitIcon, XIcon }) => {
    // يجب أن نستخدم isOpen هنا للتحقق من العرض، رغم أنه محقق في المكون الأب
    if (!isOpen) return null;

    return (
        // ✅ إضافة onClick={onClose} على الـ overlay للسماح بالإغلاق بالنقر خارجه (إذا كان الـ CSS يدعم ذلك)
        <div className="prog-modal-overlay" onClick={onClose}>
            {/* إيقاف propagation النقر داخل الـ content لتجنب إغلاق الـ Modal عند النقر داخله */}
            <div className="prog-modal-content entry-exit-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="prog-modal-header">
                    <h3>Scan QR Code to  Attendance </h3>
                    
                    <button onClick={onClose} className="prog-close-btn"><XIcon /></button>
                </div>
                <p style={{textAlign:"center",marginBottom:"30px"}}>Attendance Registration in </p>
                <div className="entry-exit-options">
                    <button
                        className="prog-bt entry-btn"
                        // ✅ تمرير sessionId مع 'entry'
                        onClick={() => { onSelectScan('entry', sessionId); onClose(); }}
                    >
                        <EnterIcon /> Entrer 
                    </button>
                    <button
                        className="prog-bt exit-btn"
                        // ✅ تمرير sessionId مع 'exit'
                        onClick={() => { onSelectScan('exit', sessionId); onClose(); }}
                    >
                        <ExitIcon /> Sortie
                    </button>
                </div>
            </div>
        </div>
    )
};

export default EntryExitModal;