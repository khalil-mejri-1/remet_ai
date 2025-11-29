// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');
const HeroSection = require('./models/HeroSection');
const TeamMember = require('./models/TeamMember');
const Speaker = require("./models/Speaker");
const KeySessionModel = require('./models/KeySession'); // تأكد من المسار الصحيح
const User = require('./models/User');
const Session = require('./models/Session');
const Registration = require('./models/Registration');
const Attendance = require('./models/Attendance');
const Program = require('./models/Program');

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


app.get('/', (req, res) => {
  res.send('final update 11/29/2025')
})


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
        res.json({ registered: !!existing
          
         });
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
        const { secretCode, userId, fullName, email } = req.body;

        if (!secretCode || !userId || !fullName || !email) 
            return res.status(400).json({ message: 'Tous les champs sont requis' });

        // Find session by secret code (optional, can be null)
        const session = await Session.findOne({ secretCode });

        const attendanceObj = {
            userId,
            sessionId: session ? session._id : null, // Send null if session not found
            fullName,
            email,
            class: null, // or "0000" if you prefer
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









app.get('/api/hero', async (req, res) => {
    try {
        let hero = await HeroSection.findOne({ sectionName: 'main_hero' });
        // إذا لم توجد صورة، قم بإنشاء واحدة افتراضية
        if (!hero) {
            hero = await HeroSection.create({
                sectionName: 'main_hero',
                // صورة افتراضية تعمل وتدعم التحميل المباشر
                imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop'
            });
        }
        res.json(hero);
    } catch (err) {
        console.error("Hero Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/hero', async (req, res) => {
    try {
        const { imageUrl, title, description } = req.body;
        const updatedHero = await HeroSection.findOneAndUpdate(
            { sectionName: 'main_hero' },
            { $set: { imageUrl, title, description } },
            { new: true, upsert: true } // upsert ينشئ المستند إذا لم يكن موجوداً
        );
        res.json(updatedHero);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// B. TEAM ROUTES
app.get('/api/team', async (req, res) => {
    try {
        const members = await TeamMember.find();
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/team', async (req, res) => {
    try {
        console.log("Receiving Data:", req.body); // للتأكد من وصول البيانات
        const { name, role, image } = req.body;
        
        if (!name || !role) {
            return res.status(400).json({ error: "Name and Role are required" });
        }

        const newMember = new TeamMember({ name, role, image });
        const savedMember = await newMember.save();
        res.status(201).json(savedMember);
    } catch (err) {
        console.error("Add Member Error:", err);
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/team/:id', async (req, res) => {
    try {
        const { name, role, image } = req.body;
        const updatedMember = await TeamMember.findByIdAndUpdate(
            req.params.id,
            { name, role, image },
            { new: true }
        );
        res.json(updatedMember);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/team/:id', async (req, res) => {
    try {
        await TeamMember.findByIdAndDelete(req.params.id);
        res.json({ message: 'Member deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});






// Create Speaker
app.post('/api/speakers', async (req, res) => {
  try {
    const speaker = await Speaker.create(req.body);
    res.status(201).json(speaker);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all Speakers
app.get('/api/speakers', async (req, res) => {
  try {
    const speakers = await Speaker.find();
    res.json(speakers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Speaker by ID
app.get('/api/speakers/:id', async (req, res) => {
  try {
    const speaker = await Speaker.findById(req.params.id);
    if (!speaker) return res.status(404).json({ message: 'Speaker not found' });
    res.json(speaker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Speaker
app.put('/api/speakers/:id', async (req, res) => {
  try {
    const speaker = await Speaker.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!speaker) return res.status(404).json({ message: 'Speaker not found' });
    res.json(speaker);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Speaker
app.delete('/api/speakers/:id', async (req, res) => {
  try {
    const speaker = await Speaker.findByIdAndDelete(req.params.id);
    if (!speaker) return res.status(404).json({ message: 'Speaker not found' });
    res.json({ message: 'Speaker deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});








app.get('/api/KeySession', async (req, res) => {
  try {
    const sessions = await KeySessionModel.find();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one session by id
app.get('/api/KeySession/:id', async (req, res) => {
  try {
    const session = await KeySessionModel.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a session
app.post('/api/KeySession', async (req, res) => {
  try {
    const newSession = new KeySessionModel(req.body);
    const savedSession = await newSession.save();
    res.json(savedSession);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a session
app.put('/api/KeySession/:id', async (req, res) => {
  try {
    const updatedSession = await KeySessionModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSession) return res.status(404).json({ message: 'Session not found' });
    res.json(updatedSession);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a session
app.delete('/api/KeySession/:id', async (req, res) => {
  try {
    const deletedSession = await KeySessionModel.findByIdAndDelete(req.params.id);
    if (!deletedSession) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




app.get('/api/program', async (req, res) => {
    try {
        const programs = await Program.find({});
        res.json(programs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single day by day name
app.get('/api/program/:day', async (req, res) => {
    try {
        const program = await Program.findOne({ day: req.params.day });
        if (!program) return res.status(404).json({ message: 'Day not found' });
        res.json(program);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new day
app.post('/api/program', async (req, res) => {
    try {
        const { day } = req.body;
        if (!day) return res.status(400).json({ message: 'Day is required' });

        const existing = await Program.findOne({ day });
        if (existing) return res.status(400).json({ message: 'Day already exists' });

        const newProgram = new Program({ day, sessions: [] });
        await newProgram.save();
        res.status(201).json(newProgram);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update sessions for a day
app.put('/api/program/:day', async (req, res) => {
    try {
        const { sessions } = req.body;
        const updated = await Program.findOneAndUpdate(
            { day: req.params.day },
            { sessions },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Day not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a day
app.delete('/api/program/:day', async (req, res) => {
    try {
        const deleted = await Program.findOneAndDelete({ day: req.params.day });
        if (!deleted) return res.status(404).json({ message: 'Day not found' });
        res.json({ message: 'Day deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});








app.get('/admin/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/api/user/role/:email', async (req, res) => {
    try {
        const userEmail = req.params.email;
        // Recherche de l'utilisateur par email
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            // Si l'utilisateur n'est pas trouvé, on suppose qu'il n'est pas admin
            return res.json({ role: 'student' }); 
        }

        // Répondre avec le rôle de l'utilisateur
        res.json({ role: user.role }); 

    } catch (error) {
        console.error("Erreur de récupération de rôle:", error);
        // En cas d'erreur serveur, on renvoie un rôle par défaut non-admin
        res.status(500).json({ role: 'student' }); 
    }
});


app.put('/admin/users/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin','student'].includes(role)) return res.status(400).json({ message: 'Role invalide' });

    try {
        const user = await User.findByIdAndUpdate(id, { role }, { new: true });
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.json({ message: `Rôle changé avec succès à ${role}` });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});


// --- DELETE user ---
app.delete('/admin/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression de l’utilisateur' });
    }
});







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
