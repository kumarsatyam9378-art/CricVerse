import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
    // 1. Sirf Redirect start karega
    login: async () => {
        try {
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error("Auth Error:", error.code);
            alert("Error: " + error.code);
        }
    },
    // 2. Page wapis aane par user check karega
    checkUser: async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result && result.user) {
                return {
                    uid: result.user.uid,
                    name: result.user.displayName,
                    photo: result.user.photoURL,
                    token: result.user.accessToken
                };
            }
            return null;
        } catch (error) {
            console.error("Redirect Result Error:", error);
            return null;
        }
    }
};
