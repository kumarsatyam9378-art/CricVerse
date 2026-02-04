import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
            // Pehle Popup try karega
            const result = await signInWithPopup(auth, provider);
            return result.user;
        } catch (error) {
            console.error("Popup Failed, trying redirect...", error.code);
            // Agar popup block hai toh redirect karega
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
                await signInWithRedirect(auth, provider);
            } else {
                throw error; // Baaki errors niche catch honge
            }
        }
    },
    checkRedirect: async () => {
        try {
            const result = await getRedirectResult(auth);
            return result ? result.user : null;
        } catch (error) {
            console.error("Redirect Check Error", error);
            return null;
        }
    }
};
