/* =========================================
   AUTHENTICATION MODULE (Production V1.0)
   Service: Firebase Auth (Google Sign-In)
   Config: Satyam Media Project
   ========================================= */

// 1. IMPORT FIREBASE SDKs (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. YOUR CONFIGURATION (Direct Integration)
const firebaseConfig = {
    apiKey: "AIzaSyDXpmQTDZgn_JvtgrEH3tVLzb-XyggLs_M",
    authDomain: "midnight-library-satyam-media.firebaseapp.com",
    projectId: "midnight-library-satyam-media",
    appId: "1:842047619495:web:7483bc7e4a9029d6dc7682",
    measurementId: "G-CGDLDBT4HH" // Analytics optional
};

// 3. INITIALIZE APP
let app;
let auth;
let provider;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
    console.log("🔥 Firebase Initialized Successfully");
} catch (error) {
    console.error("🔥 Firebase Init Error:", error);
}

// 4. AUTH FUNCTIONS EXPORT
export const Auth = {
    /**
     * Trigger Google Popup Login
     * @returns {Promise<Object>} User Data
     */
    async login() {
        if (!auth) return null;
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            // Return simplified user object
            return {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
                token: result._tokenResponse.idToken
            };
        } catch (error) {
            console.error("Login Failed:", error.message);
            throw error;
        }
    },

    /**
     * Logout User
     */
    async logout() {
        if (!auth) return;
        try {
            await signOut(auth);
            console.log("User Signed Out");
            window.location.reload(); // Refresh to reset state
        } catch (error) {
            console.error("Logout Error:", error);
        }
    },

    /**
     * Listen to Auth State Changes (Auto-Login check)
     * @param {Function} callback - Function to run on state change
     */
    onStateChange(callback) {
        if (!auth) return;
        onAuthStateChanged(auth, (user) => {
            if (user) {
                callback({
                    uid: user.uid,
                    name: user.displayName,
                    photo: user.photoURL,
                    isLogged: true
                });
            } else {
                callback({ isLogged: false });
            }
        });
    }
};
