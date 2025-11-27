import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect } from "firebase/auth"; // 1. استيراد Redirect

const firebaseConfig = {
  // ... (نفس إعداداتك السابقة لا تغيرها)
  apiKey: "AIzaSyAH1Gvv0AsTryFM9J2S0WNjgDG_2frczLU",
  authDomain: "remet-acc50.firebaseapp.com",
  projectId: "remet-acc50",
  storageBucket: "remet-acc50.firebasestorage.app",
  messagingSenderId: "114981685764",
  appId: "1:114981685764:web:6a7d68c597ba91a84ec351",
  measurementId: "G-KYS3XCGVKM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// 2. تعديل دالة الدخول لتستخدم Redirect
export const loginWithGoogle = async () => {
  // هذه الدالة ستقوم بتحويل الصفحة فوراً إلى جوجل
  return signInWithRedirect(auth, googleProvider);
};

// نحتاج تصدير auth لنستخدمه في Navbar لاستقبال النتيجة
export { auth };