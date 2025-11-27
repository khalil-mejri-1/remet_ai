import React from 'react';
import noron from "../img/noron.png";

export default function Hero_main({ onRegisterClick }) {

    // Logic to handle the click
    const handleRegisterBtnClick = () => {
        const isLoggedIn = localStorage.getItem('login') === 'true';
        const isAlreadyRegistered = localStorage.getItem('WORKSHOP') === 'true';

        if (isAlreadyRegistered) {
             // 1. If user is ALREADY in the DB (WORKSHOP flag is true)
             // Trigger the Success/Info Alert
             window.dispatchEvent(new Event('trigger-success-alert'));
        } 
        else if (isLoggedIn) {
            // 2. If connected but NOT registered yet
            // Proceed to workshop registration form
            onRegisterClick();
        } 
        else {
            // 3. If NOT connected
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
                    <h1 className="hero-title">REMET-AI</h1>
                    <h2 className="hero-subtitle">WORKSHOP</h2>

                    {/* Description */}
                    <p className="hero-description">
                        an event where experts, researchers, and industry professionals gather to discuss the latest
                        advancements in artificial intelligence. It features keynote speeches, technical workshops,
                        live demonstrations, and networking opportunities.
                    </p>

                    {/* Action Buttons */}
                    <div className="hero-buttons">
                        {/* Updated onClick to check registration & login status */}
                        <button className="btn register-btn" onClick={handleRegisterBtnClick}>
                            REGISTER NOW
                        </button>
                        
                        <button style={{border:"none", backgroundColor:'transparent'}}>
                            <a href="#program" className="btn program-btn" style={{textDecoration:"none"}}>PROGRAM</a> 
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}