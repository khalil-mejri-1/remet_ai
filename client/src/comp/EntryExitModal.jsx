import React from 'react';

const EntryExitModal = ({ isOpen, onClose, onSelectScan, EnterIcon, ExitIcon, XIcon }) => {
    if (!isOpen) return null;

    return (
        <div className="prog-overlay" onClick={onClose}>
            <div className="prog-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Session Attendance</h3>
                    <button onClick={onClose}><XIcon /></button>
                </div>
                <p style={{ textAlign: 'center', marginBottom: '20px', color: '#64748b', fontSize: '0.95rem' }}>
                    Please select your scan type
                </p>
                <div className="modal-grid">
                    <button
                        className="modal-choice-btn"
                        onClick={() => onSelectScan('entry')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '1.5rem' }}>📥</span>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>Check-in</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Scan entry QR code</div>
                            </div>
                        </div>
                    </button>
                    <button
                        className="modal-choice-btn"
                        onClick={() => onSelectScan('exit')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '1.5rem' }}>📤</span>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>Check-out</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Scan exit QR code</div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EntryExitModal;