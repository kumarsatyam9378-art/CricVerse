/* =========================================
   CRICVERSE DATABASE (Production V1.0)
   Contains: Players, Roles, Attributes, Pricing
   ========================================= */

// 1. GAME CONFIGURATION
export const config = {
    currency: "INR",
    baseFee: 10,
    maxMultipler: 5.0,
    version: "1.2.4-beta"
};

// 2. PLAYER ROSTER (RPG Stats Included)
export const players = [
    {
        id: "virat_k",
        name: "Virat Kohli",
        role: "Batter",
        price: 50,
        avatar: "👑",
        stats: {
            power: 95,
            timing: 98,
            aggression: 85,
            speciality: "Chase Master"
        },
        description: "The King. specialized in high-pressure chases and cover drives."
    },
    {
        id: "rohit_s",
        name: "Rohit Sharma",
        role: "Batter",
        price: 45,
        avatar: "🧢",
        stats: {
            power: 92,
            timing: 95,
            aggression: 90,
            speciality: "Pull Shot God"
        },
        description: "The Hitman. effortless six-hitting capability against pace."
    },
    {
        id: "bumrah_j",
        name: "Jasprit Bumrah",
        role: "Bowler",
        price: 40,
        avatar: "⚡",
        stats: {
            speed: 90,
            accuracy: 99,
            swing: 85,
            speciality: "Toe Crusher"
        },
        description: "Boom Boom. The most lethal yorker specialist in the world."
    },
    {
        id: "jadeja_r",
        name: "Ravindra Jadeja",
        role: "All-Rounder",
        price: 35,
        avatar: "⚔️",
        stats: {
            power: 80,
            accuracy: 85,
            fielding: 100,
            speciality: "Rocket Arm"
        },
        description: "Sir Jadeja. 3D player who contributes in every department."
    },
    {
        id: "maxwell_g",
        name: "Glenn Maxwell",
        role: "Batter",
        price: 30,
        avatar: "🤡",
        stats: {
            power: 95,
            timing: 70,
            aggression: 100,
            speciality: "Reverse Sweep"
        },
        description: "The Big Show. High risk, high reward gameplay."
    },
    {
        id: "rashid_k",
        name: "Rashid Khan",
        role: "Bowler",
        price: 38,
        avatar: "🪄",
        stats: {
            speed: 75,
            accuracy: 95,
            spin: 100,
            speciality: "Unreadable Googly"
        },
        description: "The Magician. Batsmen struggle to pick his hand."
    }
];

// 3. ROLE-BASED CONTROLS (The RPG Moves)
export const controls = {
    "Batter": [
        { id: "defend", label: "Solid Defense", style: "green", risk: 5, reward: 0 },
        { id: "drive", label: "Cover Drive", style: "blue", risk: 30, reward: 40 },
        { id: "loft", label: "Lofted Shot", style: "red", risk: 60, reward: 80 },
        { id: "scoop", label: "Dil-Scoop", style: "red", risk: 80, reward: 95 }
    ],
    "Bowler": [
        { id: "good_len", label: "Good Length", style: "green", risk: 10, reward: 20 },
        { id: "yorker", label: "Deadly Yorker", style: "blue", risk: 40, reward: 80 },
        { id: "bouncer", label: "Fast Bouncer", style: "red", risk: 50, reward: 60 },
        { id: "slower", label: "Knuckle Ball", style: "blue", risk: 30, reward: 50 }
    ],
    "All-Rounder": [
        { id: "strike", label: "Rotate Strike", style: "green", risk: 10, reward: 10 },
        { id: "slog", label: "Slog Sweep", style: "red", risk: 70, reward: 90 },
        { id: "arm_ball", label: "Arm Ball", style: "blue", risk: 30, reward: 50 }
    ]
};

// 4. GAME STATES & MESSAGES
export const gameMessages = {
    loading: "Initializing Stadium Feed...",
    ai_thinking: "AI Engine Generating Scenario...",
    error: "Signal Lost. Re-calibrating Satellite...",
    success: "Data Stream Active."
};
