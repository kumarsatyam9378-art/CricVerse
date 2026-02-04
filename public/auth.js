/* =========================================
   FIREBASE AUTH (REVISED FOR VERCEL)
   ========================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBm5ShiliLe6yW_yg_t-rrIebtKyz0GAa8",
  authDomain: "cricverse-fullstack.firebaseapp.com",
  projectId: "cricverse-fullstack",
  storageBucket: "cricverse-fullstack.firebasestorage.app",
  messagingSenderId: "207572842183",
  appId: "1:207572842183:web:e499e4259c7aff4b22f0e2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const Auth = {
    login: async () => {
        try {
            // Force Popup
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);
            return {
                uid: result.user.uid,
                name: result.user.displayName,
                photo: result.user.photoURL,
                token: result.user.accessToken
            };
        } catch (error) {
            console.error("DEBUG ERROR:", error.code);
            alert("Error: " + error.code); // Isse humein asli wajah pata chalegi
            return null;
        }
    }
};
