import React from 'react';
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
                            {/* Updated onClick to check registration & login status */}
                            <button className="btn register-btn" onClick={handleRegisterBtnClick}>
                                REGISTER NOW
                            </button>

                            <button style={{ border: "none", backgroundColor: 'transparent' }}>
                                <a href="#program" className="btn program-btn" style={{ textDecoration: "none" }}>PROGRAM</a>
                            </button>
                        </div>
                    </RevealOnScroll>
                </div>
            </div>
        </div>
    );
}