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
const Stats = require('./models/Stats'); // Add Stats model
const OnlineVisitor = require('./models/OnlineVisitor'); // Add OnlineVisitor model

const app = express();

// تعديل CORS للعمل مع أي frontend
app.use(cors({
  origin: '*', // يسمح لأي رابط frontend
  credentials: true,
}));

app.use(express.json());

/* -----------------------
   Stats / Presence Logic (Production Ready)
----------------------- */
// In-memory logic removed for Vercel/Serverless compatibility. 
// Uses OnlineVisitor model with TTL index instead.

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
  res.send('final update_ 11/29/2025')
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
    res.json({
      registered: !!existingUser

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
    const { sessionId, userId, fullName, email, type } = req.body;

    if (!sessionId || !userId || !fullName || !email)
      return res.status(400).json({ message: 'Tous les champs sont requis' });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }

    // 1. Find session in program
    const program = await Program.findOne({ "sessions.id": Number(sessionId) });
    if (!program) return res.status(404).json({ message: "Session introuvable" });

    const session = program.sessions.find(s => s.id === Number(sessionId));
    if (!session) return res.status(404).json({ message: "Session introuvable" });

    // 2. Get user info from registration
    const registration = await Registration.findOne({ userId });
    const userClass = registration ? registration.class : null;
    const userPhone = registration ? registration.phone : null;

    // 3. Prepare update object
    const updateData = {
      nameSession: session.title,
      timeSession: session.time,
      fullName,
      email,
      class: userClass,
      phone: userPhone,
      scanTime: new Date()
    };

    if (type === 'entry') {
      updateData.checkInTime = new Date();
    } else if (type === 'exit') {
      updateData.checkOutTime = new Date();
    }

    // 4. Update or Create Attendance record
    // Using explicit casting to ensure index match
    const attendance = await Attendance.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        sessionId: String(sessionId)
      },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    let message = 'Presence updated successfully!';
    if (type === 'entry') message = 'Check-in successful! ✅';
    if (type === 'exit') message = 'Check-out successful! ✅';

    res.json({
      success: true,
      message,
      data: attendance
    });

  } catch (err) {
    console.error("Scan Error:", err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


app.get('/api/attendance', async (req, res) => {
  try {
    // Fetch all attendance records from the database
    const attendances = await Attendance.find().sort({ scanTime: -1 }); // sorted by latest scan

    // Return the data as JSON
    res.status(200).json(attendances);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Internal server error while fetching attendance data." });
  }
});

// PDF Export for Global Attendance
app.get('/api/attendance/export-pdf', async (req, res) => {
  try {
    // 1. Get all programs with attendance-enabled sessions
    const programs = await Program.find();
    const enabledSessions = [];

    programs.forEach(program => {
      program.sessions.forEach(session => {
        if (session.attendanceEnabled) {
          enabledSessions.push({
            id: session.id,
            title: session.title,
            day: program.day
          });
        }
      });
    });

    if (enabledSessions.length === 0) {
      return res.status(400).json({ message: "No sessions with attendance enabled" });
    }

    // 2. Get all attendance records
    const attendances = await Attendance.find();

    // 3. Group by user and calculate global presence
    const userMap = new Map();

    attendances.forEach(record => {
      const key = record.email;
      if (!userMap.has(key)) {
        userMap.set(key, {
          fullName: record.fullName,
          email: record.email,
          class: record.class || 'N/A',
          sessionsCompleted: new Set()
        });
      }

      // Check if both check-in and check-out exist
      if (record.checkInTime && record.checkOutTime) {
        userMap.get(key).sessionsCompleted.add(record.sessionId);
      }
    });

    // 4. Filter users with global presence (attended ALL enabled sessions)
    const globalPresentStudents = [];
    userMap.forEach((userData, email) => {
      // Calculate how many of the ENABLED sessions this user completed
      // We check if the user's completed sessions include all the enabled session IDs
      const relevantCompletedCount = enabledSessions.reduce((count, session) => {
        return count + (userData.sessionsCompleted.has(String(session.id)) ? 1 : 0);
      }, 0);

      if (relevantCompletedCount === enabledSessions.length) {
        globalPresentStudents.push({
          fullName: userData.fullName,
          email: userData.email,
          class: userData.class,
          sessionsAttended: relevantCompletedCount,
          status: 'Present'
        });
      }
    });

    // Sort by name
    globalPresentStudents.sort((a, b) => a.fullName.localeCompare(b.fullName));

    // 5. Generate Styled PDF
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // Set response headers
    const timestamp = dayjs().format('YYYY-MM-DD-HHmm');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=REMET-AI-Attendance-Report-${timestamp}.pdf`);

    doc.pipe(res);

    // --- Colors & Styling ---
    const primaryColor = '#2563eb'; // Blue
    const darkColor = '#1e293b'; // Dark Slate
    const lightColor = '#f1f5f9'; // Stripe Color
    const textColor = '#334155';
    const mutedColor = '#64748b';

    // --- Header ---
    try {
      const logoPath = path.join(__dirname, '../client/src/img/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 40, { width: 100 });
      } else {
        doc.fontSize(20).fillColor(primaryColor).font('Helvetica-Bold').text('REMET-AI', 40, 40);
      }
    } catch (e) {
      doc.fontSize(20).fillColor(primaryColor).font('Helvetica-Bold').text('REMET-AI', 40, 40);
    }

    doc.fontSize(16).fillColor(darkColor).font('Helvetica-Bold').text('Global Attendance Report', 200, 45, { align: 'right' });
    doc.fontSize(10).fillColor(mutedColor).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, 200, 65, { align: 'right' });

    // Header Separator
    doc.moveTo(40, 90).lineTo(555, 90).strokeColor(primaryColor).lineWidth(2).stroke();
    doc.moveDown(1.5);

    // Summary Box
    const summaryY = doc.y;
    doc.rect(40, summaryY, 515, 60).fillColor(lightColor).fill();
    doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(11);
    doc.text(`Required Sessions: ${enabledSessions.length}`, 60, summaryY + 15);
    doc.text(`Identified Full Participants: ${globalPresentStudents.length}`, 60, summaryY + 35);
    doc.moveDown(5);

    // --- Table Headers ---
    const tableTop = doc.y;
    const colX = { name: 40, email: 180, class: 360, sessions: 460, status: 510 };
    const colWidths = { name: 140, email: 180, class: 100, sessions: 50, status: 45 };

    // Header Background
    doc.rect(40, tableTop, 515, 25).fillColor(darkColor).fill();
    doc.fillColor('white').font('Helvetica-Bold').fontSize(9);

    doc.text('FULL NAME', colX.name + 10, tableTop + 8);
    doc.text('EMAIL ADDRESS', colX.email, tableTop + 8);
    doc.text('CLASS/LEVEL', colX.class, tableTop + 8);
    doc.text('SESS.', colX.sessions, tableTop + 8, { width: colWidths.sessions, align: 'center' });
    doc.text('STATUS', colX.status, tableTop + 8);

    let currentY = tableTop + 25;

    // --- Table Rows ---
    doc.font('Helvetica').fontSize(8.5);

    globalPresentStudents.forEach((student, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(40, currentY, 515, 25).fillColor(lightColor).fill();
      }

      doc.fillColor(textColor);

      // Vertical clipping/alignment helper
      const rowY = currentY + 8;

      doc.text(student.fullName, colX.name + 10, rowY, { width: colWidths.name, lineBreak: false });
      doc.text(student.email, colX.email, rowY, { width: colWidths.email, lineBreak: false });
      doc.text(student.class || 'N/A', colX.class, rowY, { width: colWidths.class, lineBreak: false });

      // Count session bubble
      doc.text(student.sessionsAttended.toString(), colX.sessions, rowY, { width: colWidths.sessions, align: 'center' });

      // Status Badge (Simplified Present text)
      doc.fillColor('#16a34a').font('Helvetica-Bold').text('PRESENT', colX.status, rowY);
      doc.font('Helvetica'); // Reset font

      currentY += 25;

      // New Page Logic
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;

        // Re-draw header on new page
        doc.rect(40, currentY, 515, 25).fillColor(darkColor).fill();
        doc.fillColor('white').font('Helvetica-Bold').fontSize(9);
        doc.text('FULL NAME', colX.name + 10, currentY + 8);
        doc.text('EMAIL ADDRESS', colX.email, currentY + 8);
        doc.text('CLASS/LEVEL', colX.class, currentY + 8);
        doc.text('SESS.', colX.sessions, currentY + 8, { width: colWidths.sessions, align: 'center' });
        doc.text('STATUS', colX.status, currentY + 8);
        currentY += 25;
      }
    });

    // --- Footer ---
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.moveTo(40, 800).lineTo(555, 800).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
      doc.fontSize(8).fillColor(mutedColor).text(
        `Page ${i + 1} of ${range.count}  |  REMET-AI Attendance Tracking System  |  Lead The Change`,
        40, 810, { align: 'center' }
      );
    }

    doc.end();

  } catch (error) {
    console.error("PDF Export Error:", error);
    res.status(500).json({ message: "Error generating PDF", error: error.message });
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

    // 1. Unique داخل القائمة نفسها
    const ids = sessions.map(s => s.id);
    const hasDuplicate = ids.some((id, idx) => ids.indexOf(id) !== idx);
    if (hasDuplicate) {
      return res.status(400).json({
        message: "Session ID duplicated inside the same request."
      });
    }

    // 2. Unique عالميًا في كل الأيام
    for (let session of sessions) {
      const exists = await Program.findOne({
        "sessions.id": session.id,
        day: { $ne: req.params.day } // استثناء اليوم نفسه
      });

      if (exists) {
        return res.status(400).json({
          message: `Session ID ${session.id} is already used in another day.`
        });
      }
    }

    // 3. التحديث إذا كان كل شيء جيد
    const updated = await Program.findOneAndUpdate(
      { day: req.params.day },
      { sessions },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: 'Day not found' });

    res.json(updated);

  } catch (err) {
    console.error(err);
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
  if (!['admin', 'student'].includes(role)) return res.status(400).json({ message: 'Role invalide' });

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

app.get('/api/stats/visit', async (req, res) => {
  try {
    const visitorId = req.query.userId || 'anonymous-' + req.ip;

    // 1. Update/Insérer la présence "Online" dans MongoDB
    // Le TTL index dans le modèle s'occupera du nettoyage automatique après 5 min
    await OnlineVisitor.findOneAndUpdate(
      { visitorId },
      { lastActive: new Date() },
      { upsert: true, new: true }
    );

    // 2. Gérer les statistiques globales
    let stats = await Stats.findOne();
    if (!stats) {
      stats = new Stats({ totalVisits: 250 });
      await stats.save();
    } else if (stats.totalVisits < 250) {
      // S'assurer que ça commence à 250 même si un record à 0 existait déjà
      stats.totalVisits = 250;
      await stats.save();
    }

    // Incrémenter si c'est une nouvelle session
    if (req.query.isNewSession === 'true') {
      stats.totalVisits += 1;
      await stats.save();
    }

    // 3. Compter les visiteurs réellement en ligne dans la DB
    const onlineCount = await OnlineVisitor.countDocuments();

    // Console log for debugging (can be removed later)
    console.log(`[Stats] Visitor: ${visitorId} | Total: ${stats.totalVisits} | Online: ${onlineCount}`);

    res.json({
      totalVisits: stats.totalVisits,
      onlineUsers: Math.max(1, onlineCount) // Toujours au moins 1 si l'utilisateur actuel est là
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.use((req, res) => res.status(404).json({ message: 'Route non trouvée' }));
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ message: 'Erreur interne', error: err.message });
});



/* -----------------------
   Start Server
----------------------- */
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
