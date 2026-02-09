import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';
import { FiDownload, FiExternalLink, FiFile, FiLink, FiTrash2, FiUploadCloud, FiArrowLeft, FiBox, FiShare2, FiCheck, FiCpu, FiLayers } from "react-icons/fi";

const Resources = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    // Upload State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('link'); // 'link' or 'file'
    const [url, setUrl] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchResources();
        checkUserRole();
    }, []);

    const createSlug = (text) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // Effect to handle scrolling to shared resource
    useEffect(() => {
        if (!loading && resources.length > 0) {
            const queryParams = new URLSearchParams(location.search);
            const resourceSlug = queryParams.get('ref');
            const resourceId = queryParams.get('id');

            let targetId = resourceId;

            if (resourceSlug && !targetId) {
                const found = resources.find(r => createSlug(r.title) === resourceSlug);
                if (found) targetId = found._id;
            }

            if (targetId) {
                const element = document.getElementById(`resource-${targetId}`);
                if (element) {
                    setTimeout(() => {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.classList.add('highlight-pulse');
                        setTimeout(() => element.classList.remove('highlight-pulse'), 4000);
                    }, 500);
                }
            }
        }
    }, [loading, resources, location.search]);


    const checkUserRole = async () => {
        const email = localStorage.getItem('userEmail');
        if (email) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE_URL}/api/user/role/${email}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.data.role === 'admin') setIsAdmin(true);
            } catch (err) {
                console.error("Role check error", err);
            }
        }
    };

    const fetchResources = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/resources`);
            setResources(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching resources", err);
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('type', type);

        if (type === 'link') {
            formData.append('url', url);
        } else {
            formData.append('file', file);
        }

        try {
            await axios.post(`${API_BASE_URL}/api/resources`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setTitle('');
            setDescription('');
            setUrl('');
            setFile(null);
            setUploading(false);
            fetchResources();
            alert('Material added successfully!');
        } catch (err) {
            console.error("Upload error", err);
            setUploading(false);
            alert('Failed to add material.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this material?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/resources/${id}`);
            fetchResources();
        } catch (err) {
            console.error("Delete error", err);
            alert("Failed to delete material");
        }
    };

    const handleCopyLink = (resource) => {
        const slug = createSlug(resource.title);
        const shareUrl = `${window.location.origin}/resources?ref=${slug}`;

        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopiedId(resource._id);
            setTimeout(() => setCopiedId(null), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    return (
        <div className="materials-page">
            <header className="materials-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/')}>
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="main-title">
                            <span className="text-blue">Workshop</span> <span className="text-black">Materials</span>
                        </h1>
                        <p className="subtitle">
                            Access Workshop Content & Assets.
                        </p>
                    </div>
                </div>
            </header>

            <main className="materials-content">

                {/* Admin Upload Section */}
                {isAdmin && (
                    <div className="mat-upload-section">
                        <div className="upload-header">
                            <div className="upload-icon-box">
                                <FiUploadCloud size={24} color="#fff" />
                            </div>
                            <span>Publish New Material</span>
                        </div>
                        <form onSubmit={handleSubmit} className="upload-form">
                            <input
                                type="text"
                                placeholder="Material Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="mat-input"
                            />
                            <input
                                placeholder="Description (Optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mat-input"
                            />

                            <div className="type-toggle">
                                <label className={type === 'link' ? 'active' : ''}>
                                    <input type="radio" value="link" checked={type === 'link'} onChange={() => setType('link')} />
                                    <FiLink /> Link
                                </label>
                                <label className={type === 'file' ? 'active' : ''}>
                                    <input type="radio" value="file" checked={type === 'file'} onChange={() => setType('file')} />
                                    <FiFile /> File
                                </label>
                            </div>

                            {type === 'link' ? (
                                <input
                                    type="url"
                                    placeholder="https://example.com/resource"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                    className="mat-input"
                                />
                            ) : (
                                <label className="file-upload-box">
                                    <input type="file" onChange={handleFileChange} required style={{ display: 'none' }} />
                                    <FiUploadCloud size={20} /> {file ? file.name : "Choose a file..."}
                                </label>
                            )}

                            <button type="submit" className="mat-btn-primary" disabled={uploading}>
                                {uploading ? 'Publishing...' : 'Publish Now'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Materials Grid */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading secure materials...</p>
                    </div>
                ) : (
                    <div className="mat-grid">
                        {resources.length === 0 ? (
                            <div className="empty-state">
                                <FiBox size={48} />
                                <h3>No Materials Yet</h3>
                                <p>Check back later for new content.</p>
                            </div>
                        ) : (
                            resources.map((res, index) => (
                                <div
                                    key={res._id}
                                    id={`resource-${res._id}`}
                                    className="mat-card"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="mat-card-glow"></div>
                                    <div className="mat-content">
                                        <div className="mat-top">
                                            <div className={`mat-icon-box ${res.type}`}>
                                                {res.type === 'link' ? <FiLink size={24} /> : <FiFile size={24} />}
                                            </div>
                                            <button
                                                className="mat-share-btn"
                                                onClick={() => handleCopyLink(res)}
                                                title="Copy Link"
                                            >
                                                {copiedId === res._id ? <FiCheck color="#10b981" /> : <FiShare2 />}
                                            </button>
                                        </div>

                                        <h3 className="mat-title">{res.title}</h3>

                                        <div className="mat-divider"></div>

                                        <div className="mat-info">
                                            <p className="mat-desc">
                                                {res.description || "No description provided for this material."}
                                            </p>
                                        </div>

                                        <div className="mat-footer">
                                            <span className="mat-tag">
                                                {res.type === 'link' ? 'EXTERNAL LINK' : 'DOCUMENT FILE'}
                                            </span>

                                            <div className="mat-actions">
                                                <a
                                                    href={res.type === 'file' ? `${API_BASE_URL}/api/resources/file/${res._id}` : res.url}
                                                    target={res.type === 'link' ? "_blank" : "_self"}
                                                    rel="noopener noreferrer"
                                                    className="mat-action-link"
                                                >
                                                    {res.type === 'link' ? 'Open' : 'Download'} <FiExternalLink size={14} />
                                                </a>

                                                {isAdmin && (
                                                    <button className="mat-delete-btn" onClick={() => handleDelete(res._id)}>
                                                        <FiTrash2 />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>

            <style>{`
                /* Page Layout */
                .materials-page {
                    min-height: 100vh;
                    background: #f8fafc;
                    background-image: 
                        radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.05) 0px, transparent 50%),
                        radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.05) 0px, transparent 50%);
                    font-family: 'Inter', sans-serif;
                    padding-bottom: 60px;
                }

                .materials-header {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
                    padding: 20px 5%;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .header-left .main-title {
                    font-size: 2.2rem;
                    font-weight: 800; /* Reduced from 900 */
                    margin: 0;
                    letter-spacing: -1px;
                    line-height: 1;
                    /* Removed text-transform: uppercase */
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap; /* Allow wrapping on small screens */
                }

                .text-blue {
                    color: #2563eb;
                    text-shadow: 0 0 30px rgba(37, 99, 235, 0.15);
                }

                .text-black {
                    color: #0f172a;
                }

                .subtitle {
                    color: #334155; /* Dark gray */
                    margin: 60px 0 0; /* Drastically increased to 60px */
                    font-size: 0.85rem;
                    font-family: 'Inter', sans-serif; /* Changed back to Inter for normal look or keep Courier? User said 'typologie normal', implying standard font maybe? Use Inter. */
                    letter-spacing: 0.5px;
                    font-weight: 500;
                    text-transform: none;
                }
                }

                .header-left p {
                    color: #64748b;
                    margin: 4px 0 0;
                    font-size: 0.95rem;
                }

                .materials-content {
                    padding: 40px 5%;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                /* Admin Upload */
                .mat-upload-section {
                    background: white;
                    border-radius: 24px;
                    padding: 30px;
                    margin-bottom: 50px;
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
                    border: 1px solid #f1f5f9;
                }

                .upload-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 25px;
                    font-weight: 700;
                    color: #1e293b;
                    font-size: 1.2rem;
                }

                .upload-icon-box {
                    background: linear-gradient(135deg, #3b82f6, #6366f1);
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .upload-form {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }

                .mat-input {
                    padding: 12px 16px;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    background: #f8fafc;
                    width: 100%;
                    transition: all 0.2s;
                }
                .mat-input:focus {
                    background: white;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    outline: none;
                }

                .type-toggle {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }
                .type-toggle label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: #f1f5f9;
                    border-radius: 10px;
                    cursor: pointer;
                    color: #64748b;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .type-toggle label.active {
                    background: #eff6ff;
                    color: #3b82f6;
                    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.1);
                }
                .type-toggle input { display: none; }

                .mat-btn-primary {
                    background: linear-gradient(135deg, #0f172a, #334155);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .mat-btn-primary:hover {
                    box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.3);
                    transform: translateY(-2px);
                }

                /* FUTURISTIC CARDS */
                .mat-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 30px;
                }

                .mat-card {
                    position: relative;
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: 24px;
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.03);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    animation: fadeInUp 0.6s ease backwards;
                }

                .mat-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.15);
                    border-color: #e2e8f0;
                    background: rgba(255, 255, 255, 0.9);
                }

                /* Decorative Gradient Blob on Hover */
                .mat-card-glow {
                    position: absolute;
                    top: -50px;
                    right: -50px;
                    width: 150px;
                    height: 150px;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
                    border-radius: 50%;
                    opacity: 0;
                    transition: opacity 0.4s;
                    pointer-events: none;
                }
                .mat-card:hover .mat-card-glow {
                    opacity: 1;
                }

                .mat-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .mat-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }

                .mat-icon-box {
                    width: 56px;
                    height: 56px;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.5rem;
                    box-shadow: 0 8px 20px -5px rgba(0,0,0,0.15);
                    transition: transform 0.3s;
                }
                .mat-card:hover .mat-icon-box {
                    transform: scale(1.05) rotate(5deg);
                }

                .mat-icon-box.link {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    box-shadow: 0 8px 20px -5px rgba(37, 99, 235, 0.4);
                }
                .mat-icon-box.file {
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                    box-shadow: 0 8px 20px -5px rgba(124, 58, 237, 0.4);
                }

                .mat-share-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    transition: all 0.2s;
                }
                .mat-share-btn:hover {
                    background: #f1f5f9;
                    color: #3b82f6;
                }

                .mat-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 16px;
                    line-height: 1.3;
                    letter-spacing: -0.02em;
                }

                .mat-divider {
                    height: 1px;
                    background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
                    margin-bottom: 16px;
                }

                .mat-desc {
                    color: #64748b;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    margin-bottom: 4px;
                    flex: 1; /* Push footer down */
                }

                .mat-footer {
                    margin-top: auto;
                    padding-top: 20px;
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                }

                .mat-tag {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .link .mat-tag { color: #60a5fa; }
                .file .mat-tag { color: #a78bfa; }

                .mat-actions {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .mat-action-link {
                    padding: 8px 16px;
                    border-radius: 10px;
                    background: #f8fafc;
                    color: #1e293b;
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border: 1px solid transparent;
                }
                .mat-card:hover .mat-action-link {
                    background: #3b82f6;
                    color: white;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .mat-delete-btn {
                    padding: 8px;
                    border-radius: 8px;
                    border: 1px solid #fee2e2;
                    background: white;
                    color: #ef4444;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .mat-delete-btn:hover {
                    background: #fef2f2;
                    border-color: #fecaca;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
                .highlight-pulse {
                    animation: pulse-glow 2s infinite;
                    border-color: #3b82f6;
                    transform: scale(1.02);
                    z-index: 10;
                }

                @media (max-width: 768px) {
                    .mat-grid {
                        grid-template-columns: 1fr;
                    }
                    .header-left .main-title {
                        font-size: 1.8rem;
                        gap: 5px;
                    }
                    .materials-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }
                    .header-left {
                        width: 100%;
                    }
                }

                @media (max-width: 480px) {
                     .header-left .main-title {
                        font-size: 1.5rem;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0;
                    }
                    .materials-content {
                        padding: 30px 15px;
                    }
                    .mat-card {
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Resources;
