/* =========================================
   FIREBASE AUTHENTICATION ENGINE
   ========================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. Aapka Config (Wahi rahega jo aapne diya tha)
const firebaseConfig = {
  apiKey: "AIzaSyBm5ShiliLe6yW_yg_t-rrIebtKyz0GAa8",
  authDomain: "cricverse-fullstack.firebaseapp.com",
  projectId: "cricverse-fullstack",
  storageBucket: "cricverse-fullstack.firebasestorage.app",
  messagingSenderId: "207572842183",
  appId: "1:207572842183:web:e499e4259c7aff4b22f0e2",
  measurementId: "G-WVV39756BF"
};

// 2. Powers (Initialization)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app); // Database access
const provider = new GoogleAuthProvider();

// 3. Login Function (Jo index.html se call hoga)
export const Auth = {
    login: async () => {
        try {
            // Google Popup khulega
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            console.log("Login Success:", user.displayName);

            return {
                uid: user.uid,
                name: user.displayName,
                photo: user.photoURL,
                email: user.email,
                token: user.accessToken
            };
        } catch (error) {
            console.error("Auth Error Code:", error.code);
            
            if (error.code === 'auth/unauthorized-domain') {
                alert("Domain Error: Firebase Console > Authentication > Settings > Authorized Domains mein jaakar apna link add karo!");
            } else if (error.code === 'auth/popup-closed-by-user') {
                alert("Aapne login window band kar di!");
            } else {
                alert("Login Failed: " + error.message);
            }
            return null;
        }
    }
};
