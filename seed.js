// 1. Terminal mein run kar: npm install firebase-admin
// 2. Project Settings > Service Accounts se nayi private key download kar aur 'serviceAccountKey.json' naam se save kar.

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const matches = [
  {
    team1: "IND", team2: "AUS", venue: "Wankhede Stadium, Mumbai",
    status: "live", start_time: new Date().toISOString()
  },
  {
    team1: "ENG", team2: "PAK", venue: "Lord's, London",
    status: "upcoming", start_time: new Date(Date.now() + 86400000).toISOString()
  },
  {
    team1: "IND", team2: "NZ", venue: "Eden Gardens, Kolkata",
    status: "past", start_time: new Date(Date.now() - 86400000).toISOString()
  }
];

const players = [
  { name: "Virat Kohli", role: "Batter", team: "IND", price: 50, image_url: "https://pollinations.ai/p/virat_kohli_cyberpunk_cricket" },
  { name: "Rohit Sharma", role: "Batter", team: "IND", price: 40, image_url: "https://pollinations.ai/p/rohit_sharma_neon_cricket" },
  { name: "Jasprit Bumrah", role: "Bowler", team: "IND", price: 30, image_url: "https://pollinations.ai/p/bumrah_fire_bowling" },
  { name: "Hardik Pandya", role: "All-Rounder", team: "IND", price: 45, image_url: "https://pollinations.ai/p/hardik_pandya_future_cricket" }
];

async function seed() {
  console.log("🔥 Seeding Firebase...");
  
  // Upload Matches
  for (const match of matches) {
    await db.collection('matches').add(match);
  }
  console.log("✅ Matches added (Live, Past, Upcoming)!");

  // Upload Players
  for (const player of players) {
    await db.collection('players').add(player);
  }
  console.log("✅ Players added!");
}

seed();