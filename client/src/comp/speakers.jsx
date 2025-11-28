import React, { useState, useEffect } from "react";
import axios from "axios";

// --- ICONS SVG ---
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// ===== URL BASE API =====
const API_URL = "http://localhost:3000/api/speakers";
// نقطة نهاية للتحقق من دور المستخدم (مسار أساسي)
const USER_ROLE_CHECK_URL = "http://localhost:3000/api/user/role";


// ===== Speaker Card Component =====
const SpeakerCard = ({ speaker, onUpdate, onDelete, isAdmin }) => {
  const titleClass = speaker.expertType === "expert" ? "expert-title" : "ia-title";

  return (
    <div className="speaker-card">
      <div className="speaker-photo-placeholder">
        {speaker.image ? <img src={speaker.image} alt={speaker.name} className="speaker-real-img" /> : <span className="photo-text">Photo</span>}
      </div>

      <div className="speaker-details">
        <h3 className="speaker-name">{speaker.name}</h3>
        <p className={`speaker-title ${titleClass}`}>{speaker.title}</p>
        <p className="speaker-description">{speaker.description}</p>
      </div>

      {/* عرض الأزرار فقط إذا كان isAdmin صحيحًا */}
      {isAdmin && (
        <div className="sp-card-actions">
          <button className="sp-action-btn update" onClick={() => onUpdate(speaker)}>
            <EditIcon /> Update
          </button>
          <button className="sp-action-btn delete" onClick={() => onDelete(speaker._id)}>
            <TrashIcon /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ===== Main Component (Speakers) =====
export default function Speakers() {
  const [speakers, setSpeakers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  // حالة جديدة لتخزين ما إذا كان المستخدم مسؤولاً (admin)
  const [isAdmin, setIsAdmin] = useState(false);

  // --- GET ALL SPEAKERS ---
  const fetchSpeakers = async () => {
    try {
      const res = await axios.get(API_URL);
      setSpeakers(res.data);
    } catch (err) {
      console.error("Error fetching speakers:", err);
    }
  };

  // --- CHECK USER ROLE ---
  const checkUserRole = async () => {
    // 1. قراءة البريد الإلكتروني من localStorage
    const userEmail = localStorage.getItem("userEmail");

    if (userEmail) {
      try {
        // 2. التعديل الضروري: إرسال البريد الإلكتروني كـ Path Parameter
        const res = await axios.get(`${USER_ROLE_CHECK_URL}/${userEmail}`);

        // 3. التحقق من الدور
        if (res.data && res.data.role === "admin") {
          setIsAdmin(true); // تعيين isAdmin إلى true إذا كان الدور admin
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error checking user role:", err);
        setIsAdmin(false); // الافتراض هو عدم الإدارة في حالة وجود خطأ
      }
    } else {
      setIsAdmin(false);
    }
  };


  useEffect(() => {
    fetchSpeakers();
    checkUserRole(); // استدعاء دالة التحقق من دور المستخدم عند تحميل المكون
  }, []); // تشغيل مرة واحدة عند التحميل

  // --- DELETE SPEAKER ---
  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert("Vous n'êtes pas autorisé à effectuer cette action."); // حماية إضافية في الواجهة
      return;
    }

    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce speaker ?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setSpeakers(speakers.filter((s) => s._id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  // --- ADD / UPDATE SPEAKER MODAL ---
  const handleAddClick = () => {
    if (!isAdmin) return; // منع الفتح إذا لم يكن مسؤولاً
    setCurrentSpeaker({ name: "", title: "", description: "", expertType: "ia", image: "" });
    setIsModalOpen(true);
  };

  const handleUpdateClick = (speaker) => {
    if (!isAdmin) return; // منع الفتح إذا لم يكن مسؤولاً
    setCurrentSpeaker({ ...speaker });
    setIsModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setCurrentSpeaker((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; // منع الحفظ إذا لم يكن مسؤولاً

    try {
      if (currentSpeaker._id) {
        // Update
        const res = await axios.put(`${API_URL}/${currentSpeaker._id}`, currentSpeaker);
        setSpeakers(speakers.map((s) => (s._id === currentSpeaker._id ? res.data : s)));
      } else {
        // Create
        const res = await axios.post(API_URL, currentSpeaker);
        setSpeakers([...speakers, res.data]);
      }
      setIsModalOpen(false);
      setCurrentSpeaker(null);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  return (
    <section className="speakers-section">
      <div className="speakers-header-wrapper">
        <h2 className="section-title">Speakers</h2>

        {/* عرض زر Add Speaker فقط إذا كان isAdmin صحيحًا */}
        {isAdmin && (
          <button className="sp-add-btn" onClick={handleAddClick}>
            <PlusIcon /> Add Speaker
          </button>
        )}
      </div>

      <div className="speakers-grid">
        {speakers.map((speaker) => (
          <SpeakerCard
            key={speaker._id}
            speaker={speaker}
            onUpdate={handleUpdateClick}
            onDelete={handleDelete}
            isAdmin={isAdmin} // تمرير حالة isAdmin إلى المكون الفرعي
          />
        ))}

      </div>

      {isModalOpen && currentSpeaker && isAdmin && ( // فتح المودال فقط إذا كان isAdmin صحيحًا
        <div className="sp-modal-overlay">
          <div className="sp-modal-content">
            <div className="sp-modal-header">
              <h3>{currentSpeaker._id ? "Edit Speaker" : "Add Speaker"}</h3>
              <button className="sp-close-btn" onClick={() => setIsModalOpen(false)}>
                <XIcon />
              </button>
            </div>

            <form onSubmit={handleSave} className="sp-modal-form">
              <div className="sp-form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={currentSpeaker.name} onChange={handleModalChange} required />
              </div>

              <div className="sp-form-group">
                <label>Title</label>
                <input type="text" name="title" value={currentSpeaker.title} onChange={handleModalChange} required />
              </div>

              <div className="sp-form-group">
                <label>Expert Type</label>
                <select name="expertType" value={currentSpeaker.expertType} onChange={handleModalChange}>
                  <option value="ia">IA (Bleu)</option>
                  <option value="expert">Expert (Vert)</option>
                </select>
              </div>

              <div className="sp-form-group">
                <label>Image URL (Optional)</label>
                <input type="text" name="image" value={currentSpeaker.image || ""} onChange={handleModalChange} placeholder="https://..." />
              </div>

              <div className="sp-form-group">
                <label>Description</label>
                <textarea name="description" value={currentSpeaker.description} onChange={handleModalChange} rows="3" />
              </div>

              <div className="sp-modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- STYLES ADDITIONNELS --- */}
      <style>{`
        /* 1. Assurer أن جميع البطاقات لها نفس الارتفاع والمحاذاة */
        .speaker-card {
            display: flex;
            flex-direction: column;
            height: 100%; /* تأخذ كامل ارتفاع الشبكة */
        }

        /* 2. إدارة الصورة الحقيقية في الحاوية المؤقتة */
        .speaker-real-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: inherit; /* تحافظ على حواف الوالد المستديرة */
            display: block;
        }

        /* 3. توسيط الرأس */
        .speakers-header-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 40px;
            text-align: center;
        }

        /* 4. زر Add Stylisé */
        .sp-add-btn {
            margin-top: 15px;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 25px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
            transition: transform 0.2s;
        }
        .sp-add-btn:hover { transform: scale(1.05); }

        /* 5. أزرار الإجراءات (Update/Delete) دائمًا في الأسفل */
        .sp-card-actions {
            margin-top: auto; /* هذا السطر يدفع الأزرار إلى الأسفل */
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.1);
            display: flex;
            gap: 10px;
        }
        .sp-action-btn {
            flex: 1;
            padding: 6px;
            border-radius: 6px;
            border: 1px solid transparent;
            cursor: pointer;
            font-size: 0.8rem;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 5px;
            background: rgba(255,255,255,0.05);
            color: #000000ff;
            transition: all 0.2s;
        }
        .sp-action-btn.update:hover { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; }
        .sp-action-btn.delete:hover { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }

        /* 6. Modal Styles */
        .sp-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(4px);
            z-index: 9999; display: flex; justify-content: center; align-items: center;
        }
        .sp-modal-content {
            background: #252530; border: 1px solid rgba(255,255,255,0.1);
            width: 90%; max-width: 400px; padding: 25px; border-radius: 12px;
            color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        .sp-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .sp-close-btn { background: none; border: none; color: #aaa; cursor: pointer; }
        .sp-close-btn:hover { color: white; }
        .sp-form-group { margin-bottom: 12px; text-align: left; }
        .sp-form-group label { display: block; margin-bottom: 5px; color: #ffffffff; font-size: 0.9rem; }
        .sp-form-group input, .sp-form-group textarea, .sp-select {
            width: 100%; padding: 8px; background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
            color: white; outline: none; font-family: inherit;
        }
        .sp-modal-actions { display: flex; gap: 10px; margin-top: 20px; color:white}
        .sp-modal-actions button[type="submit"] { flex: 1; background: #6366f1; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
        .sp-modal-actions button[type="submit"]:hover { background: #4f46e5; }
        .sp-modal-actions button[type="button"] { flex: 1; background: transparent; border: 1px solid #555; color: #ffffffff; padding: 10px; border-radius: 6px; cursor: pointer; transition: border-color 0.2s; }
        .sp-modal-actions button[type="button"]:hover { border-color: #999; color: white; }
      `}</style>
    </section>
  );
}