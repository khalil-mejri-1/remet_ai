import React from 'react';
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import noron from "../img/noron.png";
import RevealOnScroll from './RevealOnScroll';

export default function Hero_main({ onRegisterClick, isRegistrationClosed }) {


    // Logic to handle the click
    const handleRegisterBtnClick = () => {
        const isLoggedIn = localStorage.getItem('login') === 'true';
        const isAlreadyRegistered = localStorage.getItem('WORKSHOP') === 'true';

        if (isAlreadyRegistered) {
            // 1. If user is ALREADY in the DB (WORKSHOP flag is true)
            // Trigger the Success/Info Alert
            window.dispatchEvent(new Event('trigger-success-alert'));
        }
        else if (isRegistrationClosed) {
            // 2. If Registration is CLOSED (and user not registered)
            // Trigger the Capacity Alert
            window.dispatchEvent(new Event('trigger-capacity-alert'));
        }
        else if (isLoggedIn) {
            // 3. If connected but NOT registered yet
            // Proceed to workshop registration form
            onRegisterClick();
        }
        else {
            // 4. If NOT connected
            // Trigger the Auth Alert
            window.dispatchEvent(new Event('trigger-auth-alert'));
        }
    };

    return (
        <div className='bloc_hero_noron'>
            <img src={noron} className='noron1' alt="" />
            <img src={noron} className='noron2' alt="" />
            <img src={noron} className='noron3' alt="" />
            <img src={noron} className='noron4' alt="" />

            <div className="hero-section">
                <div className="hero-content">
                    {/* Title */}
                    <RevealOnScroll>
                        <h1 className="hero-title">REMET-AI</h1>
                    </RevealOnScroll>

                    <RevealOnScroll delay={200}>
                        <h2 className="hero-subtitle">WORKSHOP</h2>
                    </RevealOnScroll>

                    {/* New Phrase Section within a stylized glass card */}
                    <RevealOnScroll delay={400}>
                        <div className="hero-phrase-card">
                            <h3 className="hero-fullname">
                                <span className="acronym-highlight">RE</span>search{" "}
                                <span className="acronym-highlight">MET</span>hodologies on{" "}
                                <span style={{ display: 'inline-block' }}><span className="acronym-highlight">A</span>rtificial</span>{" "}
                                <span style={{ display: 'inline-block' }}><span className="acronym-highlight">I</span>ntelligence</span>
                            </h3>
                        </div>

                        {/* Social Icons (Placed under the card) */}
                        <div className="hero-social-links" style={{ marginTop: '-15px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                            <a href="https://www.facebook.com/profile.php?id=61576808901014" target="_blank" rel="noopener noreferrer" className="hero-social-icon fb"><FaFacebook /></a>
                            <a href="https://www.instagram.com/remet_ai/" target="_blank" rel="noopener noreferrer" className="hero-social-icon insta"><FaInstagram /></a>
                            <a href="https://www.tiktok.com/@remet_ai" target="_blank" rel="noopener noreferrer" className="hero-social-icon tiktok"><FaTiktok /></a>
                            <a href="https://www.youtube.com/channel/UCTftGjGyHGhthNyA92PW88A" target="_blank" rel="noopener noreferrer" className="hero-social-icon yt"><FaYoutube /></a>
                        </div>

                        <style>{`
                            .hero-social-icon {
                                font-size: 1.5rem; /* Slightly larger for visibility outside card */
                                color: #94a3b8;
                                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                            }
                            .hero-social-icon:hover {
                                transform: translateY(-3px) scale(1.1);
                            }
                            .hero-social-icon.fb:hover { color: #1877F2; }
                            .hero-social-icon.insta:hover { color: #E4405F; }
                            .hero-social-icon.tiktok:hover { color: #000000; }
                            .hero-social-icon.yt:hover { color: #FF0000; }
                        `}</style>
                    </RevealOnScroll>

                    {/* Description */}
                    <RevealOnScroll delay={600}>
                        <p className="hero-description">
                            REMET-AI is an annual workshop for researchers, academics, and students working in artificial intelligence. REMET'AI'4 brings together leading experts, distinguished speakers, and professional researchers to explore cutting-edge developments in the field. The program combines theoretical presentations with hands-on workshops, giving participants the opportunity to immediately apply new concepts under expert guidance.
                        </p>
                    </RevealOnScroll>

                    {/* Action Buttons */}
                    <RevealOnScroll delay={800}>
                        <div className="hero-buttons">
                            {/* Button 1: Register -> PROGRAM */}
                            <a href="#program" style={{ textDecoration: 'none' }}>
                                <button className="btn btn-program-shine">
                                    PROGRAM
                                </button>
                            </a>

                            {/* Button 2: Program -> LIVE STREAM */}
                            <Link to="/live" style={{ textDecoration: 'none' }}>
                                <button className="btn btn-live-stream">
                                    LIVE STREAM
                                </button>
                            </Link>
                        </div>

                        <style>{`
                            .btn-program-shine {
                                position: relative;
                                background: white; /* Default White */
                                color: #2563eb;    /* Workshop Blue (Approx) */
                                border: 2px solid #2563eb;
                                font-weight: 700;
                                font-size: 0.95rem; /* Reduced Size */
                                padding: 10px 24px; /* Reduced Size */
                                overflow: hidden;
                                z-index: 1;
                                transition: all 0.3s ease;
                            }
                            
                            .btn-program-shine:hover {
                                background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); /* Workshop Gradient on Hover */
                                color: white;
                                border-color: transparent; /* Seamless gradient */
                                transform: translateY(-2px);
                                box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
                            }

                            /* The Shine Wave */
                            .btn-program-shine::after {
                                content: '';
                                position: absolute;
                                top: 0;
                                left: -150%;
                                width: 100%;
                                height: 100%;
                                background: linear-gradient(
                                    90deg, 
                                    transparent, 
                                    rgba(255, 255, 255, 0.6), 
                                    transparent
                                );
                                transform: skewX(-20deg);
                                transition: none;
                            }

                            .btn-program-shine:hover::after {
                                animation: shine 0.75s;
                            }

                            @keyframes shine {
                                100% {
                                    left: 150%;
                                }
                            }

                            .btn-live-stream {
                                position: relative; /* Needed for pseudo-element */
                                background-color: white;
                                color: #ef4444;
                                border: 2px solid #ef4444;
                                font-weight: 700;
                                font-size: 0.95rem; /* Reduced Size */
                                padding: 10px 24px; /* Reduced Size */
                                overflow: hidden; /* Needed for shine */
                                transition: all 0.3s ease;
                            }
                            .btn-live-stream:hover {
                                background-color: #ef4444;
                                color: white;
                                transform: translateY(-2px);
                                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                            }
                            
                            /* Shine for Live Stream */
                            .btn-live-stream::after {
                                content: '';
                                position: absolute;
                                top: 0;
                                left: -150%;
                                width: 100%;
                                height: 100%;
                                background: linear-gradient(
                                    90deg, 
                                    transparent, 
                                    rgba(255, 255, 255, 0.6), 
                                    transparent
                                );
                                transform: skewX(-20deg);
                                transition: none;
                            }

                            .btn-live-stream:hover::after {
                                animation: shine 0.75s;
                            }
                        `}</style>
                    </RevealOnScroll>
                </div>
            </div >
        </div >
    );
}