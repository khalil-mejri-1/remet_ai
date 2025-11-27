// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');

const User = require('./models/User');
const Session = require('./models/Session');
const Registration = require('./models/Registration');
const Attendance = require('./models/Attendance');


const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // رابط الـ frontend
  credentials: true,
}));
/* -----------------------
   Config
----------------------- */
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
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
const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};
const formatDateTime = (date) => dayjs(date).format('YYYY-MM-DD HH:mm');

/* -----------------------
   Auth Middleware
----------------------- */
const authMiddleware = (roles = []) => async (req, res, next) => {
  try {
    const header = req.headers['authorization'];
    if (!header) return res.status(401).json({ message: 'Token manquant' });
    const token = header.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token invalide' });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    const userDoc = await User.findById(decoded.id).select('-password');
    if (!userDoc) return res.status(401).json({ message: 'Utilisateur introuvable' });
    req.userDoc = userDoc;

    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Authentification échouée', error: err.message });
  }
};

app.use(express.json());


app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        // تحقق من وجود المستخدم
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User exists" });

        const newUser = new User({ fullName, email, password });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. مسار تسجيل الدخول (Login)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
             return res.status(400).json({ message: "Invalid credentials" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. مسار جوجل (Google Login)
app.post('/api/google-login', async (req, res) => {
    try {
        const { fullName, email } = req.body;
        let user = await User.findOne({ email });
        
        if (!user) {
            // إنشاء مستخدم جديد إذا لم يكن موجوداً
            user = new User({ fullName, email, password: null }); // كلمة المرور null لجوجل
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
        const { id } = req.params; // userId من الرابط
        const { fullName, email, institution, class: clazz, phone } = req.body;

        // Validation
        if (!fullName || !email) {
            return res.status(400).json({ message: 'Nom et Email sont requis' });
        }

        // تحقق من وجود مستخدم
        if (!id) {
            return res.status(400).json({ message: 'User ID manquant' });
        }

        // البحث عن تسجيل موجود لنفس المستخدم
        const existing = await Registration.findOne({ userId: id });

        if (existing) {
            // تحديث التسجيل الحالي
            existing.fullName = fullName;
            existing.email = email;
            existing.institution = institution;
            existing.class = clazz;
            existing.phone = phone;

            await existing.save();
            return res.json({ message: 'Inscription mise à jour', registration: existing });
        }

        // إنشاء تسجيل جديد
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


app.get('/api/registrations', authMiddleware(['admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Registration.countDocuments();
    const regs = await Registration.find()
      .populate('userId', 'fullName email')
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
        // البحث عن الإيميل في كوليكشن التسجيلات
        const existingUser = await Registration.findOne({ email: email });
        
        if (existingUser) {
            return res.json({ registered: true });
        } else {
            return res.json({ registered: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});
/* -----------------------
   Sessions & QR Code
----------------------- */
app.post('/api/sessions', authMiddleware(['admin']), async (req, res) => {
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

app.get('/api/sessions', authMiddleware(), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Session.countDocuments();
    const sessions = await Session.find().sort({ date: 1 }).skip(skip).limit(limit);

    res.json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: sessions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});



app.get('/api/sessions/:id/qrcode', authMiddleware(), async (req, res) => {
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
app.post('/api/attendance/scan', authMiddleware(['student', 'admin']), async (req, res) => {
  try {
    // 1. Receive the QR code (secretCode) from frontend
    const { secretCode } = req.body;
    if (!secretCode) return res.status(400).json({ message: 'Code QR requis' });

    // 2. Validate the Session based on the QR Code
    const session = await Session.findOne({ secretCode });
    if (!session) return res.status(404).json({ message: 'Session introuvable (QR Code invalide)' });

    // 3. Get User Info from the Token (req.user) and Database
    const userId = req.user.id;
    
    // Check if user is registered (to get class/fullname details)
    const registration = await Registration.findOne({ userId });
    const user = req.userDoc; // Assuming authMiddleware attaches the full user doc

    // 4. Prepare the Attendance Object
    const attendanceObj = {
      userId,
      sessionId: session._id,
      // Fallbacks to ensure data is not null
      fullName: registration?.fullName || user?.fullName || 'Inconnu',
      email: registration?.email || user?.email || 'N/A',
      class: registration?.class || 'N/A'
    };

    // 5. Save to MongoDB
    const attendance = await Attendance.create(attendanceObj);

    // 6. Send Success Response
    res.json({ 
        success: true, 
        message: 'Présence validée avec succès !', 
        data: attendance 
    });

  } catch (err) {
    console.error("Scan Error:", err);
    // Handle duplicate entry (MongoDB Error 11000)
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Vous avez déjà scanné votre présence pour cette session.' });
    }
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
// -----------------------
// List attendance avec pagination
// -----------------------
app.get('/api/attendance/session/:sessionId', authMiddleware(['admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Attendance.countDocuments({ sessionId: req.params.sessionId });

    let list = await Attendance.find({ sessionId: req.params.sessionId })
      .sort({ scanTime: 1 })
      .skip(skip)
      .limit(limit)
      .select('fullName email class scanTime -_id');

    list = list.map(a => ({ ...a.toObject(), scanTime: formatDateTime(a.scanTime) }));

    res.json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: list
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// -----------------------
// Filtrage par classe + pagination
// -----------------------
app.get('/api/attendance/session/:sessionId/class/:className', authMiddleware(['admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { sessionId: req.params.sessionId, class: req.params.className };
    const total = await Attendance.countDocuments(filter);

    let list = await Attendance.find(filter)
      .sort({ scanTime: 1 })
      .skip(skip)
      .limit(limit)
      .select('fullName email class scanTime -_id');

    list = list.map(a => ({ ...a.toObject(), scanTime: formatDateTime(a.scanTime) }));

    res.json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: list
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// -----------------------
// Dashboard taux de présence
// -----------------------
app.get('/api/dashboard/attendance-rate', authMiddleware(['admin']), async (req, res) => {
  try {
    const sessions = await Session.find().sort({ date: 1 });
    const result = [];

    for (let session of sessions) {
      const total = await Registration.countDocuments();
      const present = await Attendance.countDocuments({ sessionId: session._id });
      const rate = total === 0 ? 0 : ((present / total) * 100).toFixed(2);
      result.push({
        sessionId: session._id,
        title: session.title,
        date: formatDateTime(session.date),
        totalRegistered: total,
        present,
        attendanceRate: `${rate}%`
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// -----------------------
// Export PDF présences (avec filtre et pagination optionnelle)
// -----------------------
app.get('/api/attendance/session/:sessionId/export/pdf', authMiddleware(['admin']), async (req, res) => {
  try {
    const { className, page, limit } = req.query;

    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session introuvable' });

    const filter = { sessionId: session._id };
    if (className) filter.class = className;

    const total = await Attendance.countDocuments(filter);
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || total;
    const skip = (pageNum - 1) * limitNum;

    let list = await Attendance.find(filter)
      .sort({ scanTime: 1 })
      .skip(skip)
      .limit(limitNum)
      .select('fullName email class scanTime -_id');

    list = list.map(a => ({ ...a.toObject(), scanTime: formatDateTime(a.scanTime) }));

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Attendance_${session.title}.pdf`);

    doc.fontSize(18).text(`Présences - ${session.title}`, { align: 'center' });
    if (className) doc.text(`Classe: ${className}`, { align: 'center' });
    doc.moveDown();

    // Table headers
    doc.fontSize(12).text(`Nom complet`, 50, doc.y, { continued: true });
    doc.text(`Email`, 200, doc.y, { continued: true });
    doc.text(`Classe`, 380, doc.y, { continued: true });
    doc.text(`Date / Heure`, 460, doc.y);
    doc.moveDown();

    list.forEach(a => {
      doc.text(a.fullName, 50, doc.y, { continued: true });
      doc.text(a.email, 200, doc.y, { continued: true });
      doc.text(a.class, 380, doc.y, { continued: true });
      doc.text(a.scanTime, 460, doc.y);
    });

    doc.end();
    doc.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur PDF', error: err.message });
  }
});

/* -----------------------
   Health Check & Error Handling
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
