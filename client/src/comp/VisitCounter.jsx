import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiEye, FiActivity } from 'react-icons/fi';
import API_BASE_URL from '../config';

export default function VisitCounter() {
    const [stats, setStats] = useState({ totalVisits: 250, onlineUsers: 0 });
    const [displayStats, setDisplayStats] = useState({ totalVisits: 0, onlineUsers: 0 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let visitorId = localStorage.getItem('visitorId');
        if (!visitorId) {
            visitorId = 'vis-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitorId', visitorId);
        }

        const fetchStats = async () => {
            try {
                const isNewSession = !sessionStorage.getItem('visited');
                if (isNewSession) sessionStorage.setItem('visited', 'true');

                const response = await axios.get(`${API_BASE_URL}/api/stats/visit`, {
                    params: { isNewSession, userId: localStorage.getItem('userId') || visitorId }
                });
                setStats({
                    ...response.data,
                    onlineUsers: (response.data.onlineUsers || 0) + 15
                });
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 15000);
        return () => clearInterval(interval);
    }, []);

    // Animation de comptage
    useEffect(() => {
        if (isVisible) {
            const duration = 1500; // 1.5 secondes
            const steps = 60;
            const intervalTime = duration / steps;

            let currentStep = 0;
            const timer = setInterval(() => {
                currentStep++;
                const progress = currentStep / steps;

                setDisplayStats({
                    totalVisits: Math.floor(stats.totalVisits * progress),
                    onlineUsers: Math.max(1, Math.floor(stats.onlineUsers * progress))
                });

                if (currentStep >= steps) {
                    setDisplayStats(stats);
                    clearInterval(timer);
                }
            }, intervalTime);

            return () => clearInterval(timer);
        }
    }, [isVisible, stats.totalVisits, stats.onlineUsers]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.1 }
        );
        const element = document.getElementById('visit-counter-section');
        if (element) observer.observe(element);
        return () => { if (element) observer.unobserve(element); };
    }, []);

    return (
        <div id="visit-counter-section" className={`visit-counter-container ${isVisible ? 'animate-in' : ''}`}>
            <div className="stats-glass-card compact wide">
                <div className="stats-grid">
                    {/* Online Visitors */}
                    <div className="stat-item mini">
                        <div className="stat-icon-wrapper online mini">
                            <FiActivity className="pulse-icon" />
                        </div>
                        <div className="stat-info">
                            <div className="stat-row">
                                <span className="stat-value small">{displayStats.onlineUsers}</span>
                                <div className="online-indicator mini">
                                    <span className="dot"></span>
                                    Live
                                </div>
                            </div>
                            <span className="stat-label xsmall">Online Now</span>
                        </div>
                    </div>

                    <div className="stat-divider mini"></div>

                    {/* Total Visits */}
                    <div className="stat-item mini">
                        <div className="stat-icon-wrapper total mini">
                            <FiEye />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value small">{displayStats.totalVisits.toLocaleString()}</span>
                            <span className="stat-label xsmall">Total Visits</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
