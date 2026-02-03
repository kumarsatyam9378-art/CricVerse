// data.js
export const players = [
    {
        id: "virat",
        name: "Virat Kohli",
        role: "Batter",
        price: 50,
        avatar: "👑"
    },
    {
        id: "rohit",
        name: "Rohit Sharma",
        role: "Batter",
        price: 45,
        avatar: "🧢"
    },
    {
        id: "bumrah",
        name: "Jasprit Bumrah",
        role: "Bowler",
        price: 40,
        avatar: "⚡"
    },
    {
        id: "jadeja",
        name: "Ravindra Jadeja",
        role: "Fielder", // Special role for fielding demo
        price: 35,
        avatar: "🐆"
    }
];

export const controls = {
    "Batter": ["Defensive", "Normal", "Aggressive"],
    "Bowler": ["Yorker", "Good Length", "Bouncer"],
    "Fielder": ["Dive", "Throw", "Relay"]
};
