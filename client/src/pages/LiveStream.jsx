import React, { useState, useEffect } from 'react';
import Navbar from '../comp/navbar.jsx';
import Footer from '../comp/Footer.jsx';
import axios from 'axios';
import API_BASE_URL from '../config';

import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function LiveStream() {
    const [liveConfig, setLiveConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch live stream status
    useEffect(() => {
        // 🌟 Scroll to top on mount 🌟
        window.scrollTo(0, 0);

        const fetchLiveStatus = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/live/current`);
                setLiveConfig(response.data);
            } catch (error) {
                console.error("Error fetching live stream:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLiveStatus();
        // Optional: Poll every 30 seconds to check if live started
        const interval = setInterval(fetchLiveStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            {/* Main Content Container - Added relative positioning for the button */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px 60px', position: 'relative' }}>

                {/* Back Button (Absolute Position) */}
                <div style={{
                    position: 'absolute', // 🌟 Taken out of flow 
                    top: '120px', // Adjusted to align near header start
                    left: '5%',   // Responsive left spacing
                    zIndex: 10
                }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#1e3a8a', // Dark Blue
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            padding: '8px 0',
                            transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#eff6ff', // Light Blue bg
                            color: '#1e3a8a'
                        }}>
                            <FiArrowLeft size={18} />
                        </div>
                        <span style={{ display: 'none', '@media (min-width: 768px)': { display: 'inline' } }}>Back to Home</span> {/* Show text only on wider screens if needed, but keeping it simple for now */}
                        <span>Back to Home</span>
                    </button>
                </div>

                {/* Header */}
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '50px',
                    width: '100%',
                    position: 'relative',
                    animation: 'fadeInUp 1s ease-out' // 🌟 Add Fade In Animation
                }}>
                    <style>
                        {`
                            @keyframes fadeInUp {
                                from { opacity: 0; transform: translateY(20px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                        `}
                    </style>

                    {/* Background Glow */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '300px',
                        height: '100px',
                        background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(255,255,255,0) 70%)',
                        filter: 'blur(40px)',
                        zIndex: 0
                    }}></div>

                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '50px',
                        marginBottom: '20px',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <span style={{
                            display: 'block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            boxShadow: '0 0 10px #ef4444',
                            animation: 'pulse 1.5s infinite'
                        }}></span>
                        <span style={{
                            color: '#ef4444',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                        }}>
                            Workshop Live
                        </span>
                    </div>

                    <h1 style={{
                        position: 'relative',
                        fontSize: 'clamp(2rem, 5vw, 3rem)', // Reduced size
                        fontWeight: '900',
                        letterSpacing: '-1px',
                        lineHeight: '1.1',
                        marginBottom: '15px',
                        color: '#0f172a' // Dark Slate (Black-ish)
                    }}>
                        <span style={{ color: '#000000' }}>REMET-AI</span> <span style={{
                            color: '#2563eb', // 🌟 Vivid Blue (Royal Blue)
                            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', // Vivid Gradient
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Live Stream</span>
                    </h1>

                    <p style={{
                        position: 'relative',
                        color: '#334155', // Darker gray/blue for better contrast
                        fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', // Reduced size
                        maxWidth: '600px',
                        margin: '0 auto',
                        padding: '0 20px',
                        lineHeight: '1.6'
                    }}>
                        Join our sessions in real-time. Experience the <span style={{ color: '#2563eb', fontWeight: '700' }}>innovation</span> from anywhere.
                    </p>
                </div>

                {/* Video Container */}
                <div style={{
                    width: '100%',
                    maxWidth: '850px', // Reduced from 1000px for better desktop visual
                    background: 'white',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    overflow: 'hidden',
                    position: 'relative',
                    // 🌟 Responsive Logic: Use 16/9 for video, but flexible height for offline card 🌟
                    aspectRatio: (liveConfig && liveConfig.isActive) ? '16/9' : 'auto',
                    minHeight: (liveConfig && liveConfig.isActive) ? 'auto' : '400px' // Ensure offline card has breathing room
                }}>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                            Loading Stream...
                        </div>
                    ) : (
                        liveConfig && liveConfig.isActive && liveConfig.facebookLiveUrl ? (
                            <div style={{ width: '100%', height: '100%' }}>
                                <iframe
                                    src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(liveConfig.facebookLiveUrl)}&show_text=false&width=1000`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 'none', overflow: 'hidden' }}
                                    scrolling="no"
                                    frameBorder="0"
                                    allowFullScreen={true}
                                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                ></iframe>
                            </div>
                        ) : (
                            // Offline State (Simple Card)
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f8fafc', // Light gray background to contrast the card
                            }}>
                                <div style={{
                                    background: 'white',
                                    padding: '40px 30px',
                                    borderRadius: '16px',
                                    marginTop: '5%',
                                    marginBottom: '5%',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    textAlign: 'center',
                                    maxWidth: '400px',
                                    width: '90%'
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📡</div>
                                    <h3 style={{
                                        color: '#0f172a',
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        marginBottom: '10px'
                                    }}>
                                        Stream currently offline
                                    </h3>
                                    <p style={{
                                        color: '#64748b',
                                        fontSize: '1rem',
                                        lineHeight: '1.5'
                                    }}>
                                        Our experts are preparing the next big session.
                                    </p>
                                </div>
                            </div>
                        )
                    )}

                </div>

                {/* Status Indicator */}
                <div style={{ marginTop: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: (liveConfig && liveConfig.isActive) ? '#ef4444' : '#94a3b8',
                        boxShadow: (liveConfig && liveConfig.isActive) ? '0 0 10px #ef4444' : 'none',
                        animation: (liveConfig && liveConfig.isActive) ? 'pulse 2s infinite' : 'none'
                    }}></div>
                    <span style={{ fontWeight: '600', color: (liveConfig && liveConfig.isActive) ? '#ef4444' : '#64748b' }}>
                        {(liveConfig && liveConfig.isActive) ? 'LIVE NOW context' : 'Offline'}
                    </span>
                </div>

            </div>

            <Footer />
        </div>
    );
}
