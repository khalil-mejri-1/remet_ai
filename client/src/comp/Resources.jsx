import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import { FiDownload, FiExternalLink, FiFile, FiLink, FiTrash2, FiUploadCloud, FiArrowLeft } from "react-icons/fi";

const Resources = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

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
            // Reset form
            setTitle('');
            setDescription('');
            setUrl('');
            setFile(null);
            setUploading(false);
            fetchResources(); // Refresh list
            alert('Resource added successfully!');
        } catch (err) {
            console.error("Upload error", err);
            setUploading(false);
            alert('Failed to add resource.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this resource?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/resources/${id}`);
            fetchResources();
        } catch (err) {
            console.error("Delete error", err);
            alert("Failed to delete resource");
        }
    };

    const getIcon = (resType) => {
        return resType === 'link' ? <FiLink size={24} color="#3b82f6" /> : <FiFile size={24} color="#ef4444" />;
    };

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/')}>
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ color: '#007bff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Resources</h1>
                        <p>Access sessions' materials, guides, and useful links.</p>
                    </div>
                </div>
            </header>

            <main className="dashboard-content">

                {/* Admin Upload Section */}
                {isAdmin && (
                    <div className="admin-upload-section">
                        <div className="upload-title">
                            <FiUploadCloud size={24} color="#007bff" />
                            <span>Publish New Resource</span>
                        </div>
                        <form onSubmit={handleSubmit} className="upload-form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Resource Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <textarea
                                    placeholder="Description (Optional)"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#334155', fontWeight: '500' }}>
                                    <input
                                        type="radio"
                                        value="link"
                                        checked={type === 'link'}
                                        onChange={() => setType('link')}
                                    /> Link
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#334155', fontWeight: '500' }}>
                                    <input
                                        type="radio"
                                        value="file"
                                        checked={type === 'file'}
                                        onChange={() => setType('file')}
                                    /> File (PDF, Doc, etc.)
                                </label>
                            </div>

                            <div className="form-group">
                                {type === 'link' ? (
                                    <input
                                        type="url"
                                        placeholder="https://example.com/resource"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        required
                                    />
                                ) : (
                                    <label className="file-label">
                                        <input
                                            type="file"
                                            className="file-input"
                                            onChange={handleFileChange}
                                            required
                                        />
                                        <FiUploadCloud size={30} style={{ marginBottom: '10px' }} />
                                        <div>{file ? file.name : "Click to select a file"}</div>
                                    </label>
                                )}
                            </div>

                            <button type="submit" className="upload-btn" disabled={uploading}>
                                {uploading ? 'Publishing...' : 'Publish Resource'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Resources List */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p style={{ color: '#64748b' }}>Loading resources...</p>
                    </div>
                ) : (
                    <div>
                        {resources.length === 0 ? (
                            <div className="empty-state">
                                <FiLink size={40} color="#cbd5e1" style={{ marginBottom: '15px' }} />
                                <p style={{ color: '#64748b' }}>No resources shared yet.</p>
                            </div>
                        ) : (
                            <div className="resources-grid">
                                {resources.map(res => (
                                    <div key={res._id} className="resource-card">
                                        <div>
                                            <div className="resource-icon-wrapper">
                                                {getIcon(res.type)}
                                            </div>
                                            <div className="resource-content">
                                                <h4>{res.title}</h4>
                                                {res.description && <p className="resource-description">{res.description}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="resource-meta">
                                                <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                                                <span className="badge badge-success" style={{ background: '#f1f5f9', color: '#64748b' }}>
                                                    {res.type.toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="resource-actions">
                                                <a
                                                    href={`${res.type === 'file' ? `${API_BASE_URL}/api/resources/file/${res._id}` : res.url}`}
                                                    target={res.type === 'link' ? "_blank" : "_self"}
                                                    rel="noopener noreferrer"
                                                    className={res.type === 'link' ? 'action-btn btn-open' : 'action-btn btn-download'}
                                                >
                                                    {res.type === 'link' ? <FiExternalLink /> : <FiDownload />}
                                                    {res.type === 'link' ? 'Open' : 'Download'}
                                                </a>

                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDelete(res._id)}
                                                        className="action-btn btn-delete"
                                                        title="Delete Resource"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Resources;
