import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from '../config';
import RevealOnScroll from './RevealOnScroll';

// --- ICONS (Optimisés) ---
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const XIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const API_URL = `${API_BASE_URL}/api/speakers`;
const USER_ROLE_CHECK_URL = `${API_BASE_URL}/api/user/role`;

// ===== Speaker Card Component =====
const SpeakerCard = ({ speaker, onUpdate, onDelete, isAdmin }) => {
    const isIA = speaker.expertType === "ia";
    const typeLabel = isIA ? "Intelligent Systems Expert" : "Subject Matter Expert";

    return (
        <div className={`ai-speaker-card ${isIA ? 'type-ia' : 'type-expert'}`}>
            <div className="card-glow"></div>
            <div className="card-inner">
                <div className="tag-container">
                    <span className="ai-badge">{typeLabel}</span>
                </div>
                <h3 className="ai-name">{speaker.name}</h3>
                <h4 className="ai-title">{speaker.title}</h4>
                <p className="ai-description">{speaker.description}</p>

                {isAdmin && (
                    <div className="ai-card-actions">
                        <button className="btn-icon update" onClick={() => onUpdate(speaker)} title="Edit">
                            <EditIcon />
                        </button>
                        <button className="btn-icon delete" onClick={() => onDelete(speaker._id)} title="Delete">
                            <TrashIcon />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ===== Main Component =====
export default function Speakers() {
    const [speakers, setSpeakers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSpeaker, setCurrentSpeaker] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchSpeakers = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(API_URL);
            setSpeakers(res.data);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const checkUserRole = async () => {
        const email = localStorage.getItem("userEmail");
        if (email) {
            try {
                const res = await axios.get(`${USER_ROLE_CHECK_URL}/${email}`);
                setIsAdmin(res.data?.role === "admin");
            } catch (err) { setIsAdmin(false); }
        }
    };

    useEffect(() => {
        fetchSpeakers();
        checkUserRole();
    }, []);

    const handleDelete = async (id) => {
        if (!isAdmin || !window.confirm("Delete this speaker profile?")) return;
        setIsSubmitting(true);
        try {
            await axios.delete(`${API_URL}/${id}`);
            setSpeakers(speakers.filter(s => s._id !== id));
        } catch (err) { alert("Error deleting speaker"); }
        finally { setIsSubmitting(false); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (currentSpeaker._id) {
                const res = await axios.put(`${API_URL}/${currentSpeaker._id}`, currentSpeaker);
                setSpeakers(speakers.map(s => s._id === currentSpeaker._id ? res.data : s));
            } else {
                const res = await axios.post(API_URL, currentSpeaker);
                setSpeakers([...speakers, res.data]);
            }
            setIsModalOpen(false);
        } catch (err) { alert("Error saving speaker"); }
        finally { setIsSubmitting(false); }
    };

    return (
        <section className="ai-section">
            <div className="ai-container">
                <RevealOnScroll>
                    <div className="ai-header">
                        <div className="title-stack">
                            <span className="ai-subtitle">Visionary Minds</span>
                            <h2 className="ai-main-title">Shaping the Future of <span className="text-gradient">Intelligence</span></h2>
                        </div>

                        {isAdmin && (
                            <button className="ai-btn-primary" onClick={() => {
                                setCurrentSpeaker({ name: "", title: "", description: "", expertType: "ia" });
                                setIsModalOpen(true);
                            }}>
                                <PlusIcon /> <span>Add Expert</span>
                            </button>
                        )}
                    </div>
                </RevealOnScroll>

                <div className="ai-grid">
                    {isLoading ? (
                        [1, 2, 3].map(i => <div key={i} className="ai-speaker-card skeleton"></div>)
                    ) : speakers.length === 0 ? (
                        <p className="empty-state">No speakers found in the database.</p>
                    ) : (
                        speakers.map((s, index) => (
                            <RevealOnScroll key={s._id} delay={index * 100}>
                                <SpeakerCard
                                    key={s._id}
                                    speaker={s}
                                    isAdmin={isAdmin}
                                    onDelete={handleDelete}
                                    onUpdate={(speaker) => {
                                        setCurrentSpeaker(speaker);
                                        setIsModalOpen(true);
                                    }}
                                />
                            </RevealOnScroll>
                        ))
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="ai-modal-overlay">
                    <div className="ai-modal">
                        <div className="modal-header">
                            <h3>{currentSpeaker?._id ? "Update Profile" : "New Speaker"}</h3>
                            <button className="close-x" onClick={() => setIsModalOpen(false)}><XIcon /></button>
                        </div>
                        <form onSubmit={handleSave} className="ai-form">
                            <div className="input-group">
                                <label>Full Name</label>
                                <input required value={currentSpeaker.name} onChange={e => setCurrentSpeaker({ ...currentSpeaker, name: e.target.value })} placeholder="e.g. Dr. Sarah Chen" />
                            </div>
                            <div className="input-group">
                                <label>Expertise Title</label>
                                <input required value={currentSpeaker.title} onChange={e => setCurrentSpeaker({ ...currentSpeaker, title: e.target.value })} placeholder="e.g. Lead Research Scientist" />
                            </div>
                            <div className="input-group">
                                <label>Category</label>
                                <select value={currentSpeaker.expertType} onChange={e => setCurrentSpeaker({ ...currentSpeaker, expertType: e.target.value })}>
                                    <option value="ia">AI Architect (Purple)</option>
                                    <option value="expert">Subject Expert (Green)</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Short Biography</label>
                                <textarea rows="4" value={currentSpeaker.description} onChange={e => setCurrentSpeaker({ ...currentSpeaker, description: e.target.value })} placeholder="Describe their impact..." />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="ai-btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? "Processing..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                :root {
                    --ai-primary: #6366f1;
                    --ai-secondary: #10b981;
                    --ai-dark: #0f172a;
                    --ai-card-bg: #ffffff;
                    --ai-text-main: #1e293b;
                    --ai-text-muted: #64748b;
                }

                .ai-section {
                    padding: 40px 20px;
                    background: #f8fafc;
                    font-family: 'Inter', -apple-system, sans-serif;
                }

                .ai-container { max-width: 1200px; margin: 0 auto; }

                .ai-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    margin-bottom: 25px;
                    gap: 30px;
                }

                .ai-subtitle {
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--ai-primary);
                }

                .ai-main-title {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: var(--ai-dark);
                    margin-top: 8px;
                }

                .text-gradient {
                    background: linear-gradient(90deg, var(--ai-primary), #a855f7);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                /* GRID & CARDS */
                .ai-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 32px;
                }

                .ai-speaker-card {
                    background: var(--ai-card-bg);
                    border-radius: 24px;
                    position: relative;
                    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
                    border: 1px solid rgba(0,0,0,0.05);
                    z-index: 1;
                }

                .ai-speaker-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 30px 60px -12px rgba(0,0,0,0.1);
                }

                .card-inner { padding: 40px; position: relative; z-index: 2; }

                .ai-badge {
                    padding: 6px 14px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    border-radius: 100px;
                    text-transform: uppercase;
                    background: rgba(99, 102, 241, 0.08);
                    color: var(--ai-primary);
                }

                .type-expert .ai-badge {
                    background: rgba(16, 185, 129, 0.08);
                    color: var(--ai-secondary);
                }

                .ai-name { font-size: 1.6rem; font-weight: 800; color: var(--ai-dark); margin: 20px 0 5px; }
                .ai-title { color: var(--ai-primary); font-size: 0.95rem; font-weight: 600; margin-bottom: 20px; }
                .type-expert .ai-title { color: var(--ai-secondary); }
                .ai-description { color: var(--ai-text-muted); line-height: 1.7; font-size: 0.95rem; }

                /* ACTIONS */
                .ai-card-actions {
                    margin-top: 30px;
                    display: flex;
                    gap: 10px;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 20px;
                }

                .btn-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.2s;
                    background: #f1f5f9;
                    color: var(--ai-text-muted);
                }

                .btn-icon.update:hover { background: var(--ai-primary); color: white; }
                .btn-icon.delete:hover { background: #ef4444; color: white; }

                /* MODAL MODERN */
                .ai-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .ai-modal {
                    background: white;
                    width: 100%;
                    max-width: 550px;
                    border-radius: 28px;
                    overflow: hidden;
                    animation: modalSlide 0.4s ease-out;
                }

                @keyframes modalSlide { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

                .modal-header {
                    padding: 25px 35px;
                    background: #f8fafc;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e2e8f0;
                }

                .ai-form { padding: 35px; }
                .input-group { margin-bottom: 20px; }
                .input-group label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 8px; color: var(--ai-dark); }
                .input-group input, .input-group select, .input-group textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1rem;
                    transition: 0.2s;
                    box-sizing: border-box;
                }
                .input-group input:focus { border-color: var(--ai-primary); outline: none; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }

                .ai-btn-primary {
                    background: var(--ai-dark);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 14px;
                    border: none;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: 0.3s;
                }
                .ai-btn-primary:hover { transform: scale(1.02); background: #000; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
                
                .btn-secondary { background: none; border: none; font-weight: 600; color: var(--ai-text-muted); cursor: pointer; }

                .modal-footer { display: flex; justify-content: flex-end; gap: 20px; margin-top: 30px; align-items: center; }

                /* Skeleton Animation */
                .skeleton {
                    height: 350px;
                    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                }
                @keyframes loading { to { background-position: -200% 0; } }
            `}</style>
        </section>
    );
}