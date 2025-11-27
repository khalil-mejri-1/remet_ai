// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');

const User = require('./models/User');
const Session = require('./models/Session');
const Registration = require('./models/Registration');
const Attendance = require('./models/Attendance');

const app = express();

// تعديل CORS للعمل مع أي frontend
app.use(cors({
  origin: '*', // يسمح لأي رابط frontend
  credentials: true,
}));

app.use(express.json());

/* -----------------------
   Config
----------------------- */
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

if (!MONGO_URI) {
  console.error('ERREUR: MONGO_URI manquant dans .env');
  process.exit(1);
}

/* -----------------------
   MongoDB Connection
----------------------- */
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

/* -----------------------
   Helpers
----------------------- */
const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};
const formatDateTime = (date) => dayjs(date).format('YYYY-MM-DD HH:mm');

/* -----------------------
   Auth / User
----------------------- */
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User exists" });

        const hashedPassword = password ? await hashPassword(password) : null;

        const newUser = new User({ fullName, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        if (password && user.password) {
            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/google-login', async (req, res) => {
    try {
        const { fullName, email } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ fullName, email, password: null });
            await user.save();
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* -----------------------
   Registration Form
----------------------- */
app.post('/api/registration/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, institution, class: clazz, phone } = req.body;

        if (!fullName || !email) return res.status(400).json({ message: 'Nom et Email sont requis' });

        const existing = await Registration.findOne({ userId: id });
        if (existing) {
            existing.fullName = fullName;
            existing.email = email;
            existing.institution = institution;
            existing.class = clazz;
            existing.phone = phone;
            await existing.save();
            return res.json({ message: 'Inscription mise à jour', registration: existing });
        }

        const registration = await Registration.create({
            userId: id,
            fullName,
            email,
            institution,
            class: clazz,
            phone
        });

        res.status(201).json({ message: 'Inscription créée', registration });

    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

app.get('/api/registrations', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Registration.countDocuments();
    const regs = await Registration.find()
      .skip(skip)
      .limit(limit);

    res.json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: regs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

app.get('/api/check-registration/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const existingUser = await Registration.findOne({ email });
        res.json({ registered: !!existingUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

/* -----------------------
   Sessions & QR Code
----------------------- */
app.post('/api/sessions', async (req, res) => {
  try {
    const { title, description, date, secretCode } = req.body;
    if (!title || !date || !secretCode) return res.status(400).json({ message: 'title, date et secretCode requis' });

    const session = await Session.create({ title, description, date, secretCode });
    res.json({ message: 'Session créée', session });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(400).json({ message: 'secretCode déjà utilisé' });
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ date: 1 });
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

app.get('/api/sessions/:id/qrcode', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session introuvable' });

    const buffer = await QRCode.toBuffer(session.secretCode, { type: 'png', width: 500, margin: 2 });
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur génération QR', error: err.message });
  }
});

/* -----------------------
   Attendance / Scan QR
----------------------- */
app.post('/api/attendance/scan', async (req, res) => {
  try {
    const { secretCode, userId } = req.body;
    if (!secretCode || !userId) return res.status(400).json({ message: 'Code QR et userId requis' });

    const session = await Session.findOne({ secretCode });
    if (!session) return res.status(404).json({ message: 'Session introuvable (QR Code invalide)' });

    const registration = await Registration.findOne({ userId });

    const attendanceObj = {
      userId,
      sessionId: session._id,
      fullName: registration?.fullName || 'Inconnu',
      email: registration?.email || 'N/A',
      class: registration?.class || 'N/A'
    };

    const attendance = await Attendance.create(attendanceObj);

    res.json({ 
        success: true, 
        message: 'Présence validée avec succès !', 
        data: attendance 
    });

  } catch (err) {
    console.error("Scan Error:", err);
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Vous avez déjà scanné votre présence pour cette session.' });
    }
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

/* -----------------------
   Health Check & Errors
----------------------- */
app.get('/api/health', (req, res) => res.json({ status: 'ok', now: new Date() }));

app.use((req, res) => res.status(404).json({ message: 'Route non trouvée' }));
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ message: 'Erreur interne', error: err.message });
});

/* -----------------------
   Start Server
----------------------- */
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
