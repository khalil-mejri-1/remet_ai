import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

export default function LiveStreamManagement({ onClose }) {
    const [facebookLiveUrl, setFacebookLiveUrl] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchCurrentSettings();
    }, []);

    const fetchCurrentSettings = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/live/current`);
            if (response.data) {
                setFacebookLiveUrl(response.data.facebookLiveUrl || '');
                setIsActive(response.data.isActive || false);
            }
        } catch (error) {
            console.error("Error fetching live settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        // 🌟 Helper: Extract clean URL if user pastes iframe code or plugin URL 🌟
        let cleanUrl = facebookLiveUrl;
        try {
            // Case 1: Pasted full <iframe> tag
            if (facebookLiveUrl.includes('<iframe') && facebookLiveUrl.includes('href=')) {
                // Extract the 'href' parameter from the src attribute
                const match = facebookLiveUrl.match(/href=([^"&]+)/);
                if (match && match[1]) {
                    cleanUrl = decodeURIComponent(match[1]);
                }
            }
            // Case 2: Pasted the plugin URL directly (https://www.facebook.com/plugins/video.php?href=...)
            else if (facebookLiveUrl.includes('plugins/video.php') && facebookLiveUrl.includes('href=')) {
                const urlParams = new URLSearchParams(new URL(facebookLiveUrl).search);
                const href = urlParams.get('href');
                if (href) cleanUrl = href;
            }
        } catch (err) {
            console.warn("Error parsing URL, using original key:", err);
        }

        try {
            await axios.post(`${API_BASE_URL}/api/live/update`, {
                facebookLiveUrl: cleanUrl, // Send cleaned URL
                isActive,
                title: 'Live Workshop'
            });

            // Update local state to show the cleaned version
            setFacebookLiveUrl(cleanUrl);

            setMessage('Settings updated successfully!');
            setTimeout(() => {
                if (onClose) onClose();
            }, 1000);
        } catch (error) {
            console.error("Error updating live settings:", error);
            setMessage('Error updating settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rm-overlay" onClick={onClose}>
            <div className="rm-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <button className="rm-close-btn" onClick={onClose}>×</button>

                <div className="rm-modal-header">
                    <h2>Live Stream Management</h2>
                    <p>Configure the live broadcast for the public page.</p>
                </div>

                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <form className="rm-form" onSubmit={handleSave}>

                        {/* Status Toggle */}
                        <div className="rm-input-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <span style={{ color: isActive ? '#ef4444' : '#64748b', fontWeight: 'bold' }}>
                                    {isActive ? '🔴 BROADCAST ACTIVE' : '⚫ STREAM OFFLINE'}
                                </span>
                            </label>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '5px' }}>
                                When active, the video will be visible to everyone on the Live Stream page.
                            </p>
                        </div>

                        {/* URL Input */}
                        <div className="rm-input-group">
                            <label>Facebook Live Video URL</label>
                            <input
                                type="text"
                                placeholder="https://www.facebook.com/watch/live/?v=..."
                                value={facebookLiveUrl}
                                onChange={(e) => setFacebookLiveUrl(e.target.value)}
                                required={isActive}
                            />
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '5px' }}>
                                Paste the full URL of the Facebook Live video here.
                            </p>
                        </div>

                        {message && (
                            <div style={{
                                padding: '10px',
                                borderRadius: '8px',
                                backgroundColor: message.includes('Error') ? '#fef2f2' : '#f0fdf4',
                                color: message.includes('Error') ? '#dc2626' : '#16a34a',
                                marginBottom: '15px',
                                textAlign: 'center'
                            }}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="rm-submit-btn"
                            disabled={saving}
                            style={{
                                background: isActive ? '#ef4444' : '#3b82f6',
                                opacity: saving ? 0.7 : 1
                            }}
                        >
                            {saving ? 'Saving...' : (isActive ? 'Update Live Stream' : 'Save Settings')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
