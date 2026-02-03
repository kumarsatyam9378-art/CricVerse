/* =========================================
   DATABASE ENGINE (Firebase Firestore)
   Features: Save Score, Fetch Leaderboard
   ========================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    limit, 
    getDocs,
    setDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Same Config as Auth.js
const firebaseConfig = {
    apiKey: "AIzaSyDXpmQTDZgn_JvtgrEH3tVLzb-XyggLs_M",
    authDomain: "midnight-library-satyam-media.firebaseapp.com",
    projectId: "midnight-library-satyam-media",
    storageBucket: "midnight-library-satyam-media.firebasestorage.app",
    messagingSenderId: "842047619495",
    appId: "1:842047619495:web:7483bc7e4a9029d6dc7682"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const DB = {
    /**
     * Save High Score to Cloud
     */
    async saveScore(user, score) {
        if (!user || score <= 0) return;

        try {
            // We use setDoc to overwrite if user already exists (keeps latest high score)
            // Or addDoc for history. Let's use a "Leaderboard" collection.
            const userRef = doc(db, "leaderboard", user.uid);
            
            await setDoc(userRef, {
                name: user.name,
                avatar: user.photo,
                score: score,
                timestamp: new Date()
            }, { merge: true }); // Merge updates only changed fields

            console.log("✅ Score Saved to Cloud!");
        } catch (e) {
            console.error("❌ Save Failed:", e);
        }
    },

    /**
     * Get Top 10 Players
     */
    async getLeaderboard() {
        try {
            const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(10));
            const snapshot = await getDocs(q);
            
            let data = [];
            snapshot.forEach((doc) => {
                data.push(doc.data());
            });
            return data;
        } catch (e) {
            console.error("❌ Fetch Failed:", e);
            return null; // Return null to trigger fallback
        }
    }
};
