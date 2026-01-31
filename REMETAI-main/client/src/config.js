// src/config.js
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://remet-ai-nate.vercel.app';

export default API_BASE_URL;
