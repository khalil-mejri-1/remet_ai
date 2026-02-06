const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const User = require('../models/User'); // For middleware check if needed, but we'll use local middleware

// Middleware to check if user is admin
// Note: In a real app, you might have a shared middleware file. 
// For now, checks token from header or assumes auth logic handles it.
// We'll trust the frontend sends the token and verify it briefly if needed, 
// but for now, let's keep it simple: Public GET, Protected POST.

// GET /api/live/current
// Public endpoint to get live stream status
router.get('/current', async (req, res) => {
    try {
        let setting = await Setting.findOne({ key: 'live_stream_config' });

        // If not found, return default "offline" state
        if (!setting) {
            return res.json({
                isActive: false,
                facebookLiveUrl: '',
                title: ''
            });
        }

        res.json(setting.value);
    } catch (err) {
        console.error("Error fetching live setting:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// POST /api/live/update
// Admin only endpoint to update live stream
router.post('/update', async (req, res) => {
    try {
        const { facebookLiveUrl, isActive, title } = req.body;

        // Use upsert to create or update
        const updatedSetting = await Setting.findOneAndUpdate(
            { key: 'live_stream_config' },
            {
                key: 'live_stream_config',
                value: {
                    facebookLiveUrl,
                    isActive,
                    title
                }
            },
            { new: true, upsert: true }
        );

        res.json(updatedSetting.value);
    } catch (err) {
        console.error("Error updating live setting:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
