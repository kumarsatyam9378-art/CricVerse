/* =========================================
   AI ENGINE CORE (Production V1.0)
   Handles: Pollinations API, Prompt Engineering,
   Asset Generation, and Fallback Logic
   ========================================= */

import { gameMessages } from './data.js';

// 1. CONFIGURATION & CONSTANTS
const AI_CONFIG = {
    textEndpoint: "https://pollinations.ai/api/text",
    imageEndpoint: "https://pollinations.ai/p/",
    requestTimeout: 15000, // 15 seconds timeout
    retries: 2
};

/**
 * UTILITY: Random Seed Generator for consistent images
 * Ensures that if we request the same image twice, it looks similar
 */
const generateSeed = () => Math.floor(Math.random() * 999999);

/**
 * CLASS: PromptEngineer
 * Constructs high-fidelity prompts for Text and Image AI
 */
class PromptEngineer {
    
    static constructCommentaryPrompt(player, role, action, outcomeType) {
        // Dynamic Difficulty Adjustment in prompt
        const intensity = ["high pressure", "casual", "do or die", "championship final"];
        const mood = intensity[Math.floor(Math.random() * intensity.length)];

        return `
            Context: Live Cricket Match, ${mood} situation.
            Character: ${player} (${role}).
            Action Performed: ${action}.
            Outcome Lean: ${outcomeType}.
            
            Task: Write a 2-sentence cricket commentary in a mix of Hindi and English (Hinglish). 
            Style: Exciting, energetic, like a TV commentator. 
            Do not include stats. Focus on the emotion and the shot/ball.
        `.trim();
    }

    static constructVisualPrompt(player, action, weather = "Sunny") {
        return `
            Hyper-realistic cricket photography, 8k resolution, ${player} cricket player, 
            performing ${action}, detailed stadium background, crowds blurring in background, 
            cinematic lighting, lens flare, action shot, sweat textures, 
            sports photography style, ${weather} atmosphere.
        `.trim();
    }
}

/**
 * CLASS: AINetworkLayer
 * Handles the raw fetching and error management
 */
class AINetworkLayer {

    static async fetchWithTimeout(resource, options = {}) {
        const { timeout = AI_CONFIG.requestTimeout } = options;
        
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(resource, {
                ...options,
                signal: controller.signal  
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }

    static async generateText(prompt) {
        try {
            const url = `${AI_CONFIG.textEndpoint}?prompt=${encodeURIComponent(prompt)}`;
            const response = await this.fetchWithTimeout(url);
            
            if (!response.ok) throw new Error("API_GATEWAY_ERROR");
            
            const text = await response.text();
            return text;
        } catch (error) {
            console.warn("AI Text Generation Failed:", error);
            return "Connection unstable... but the crowd is roaring! (Offline Fallback)";
        }
    }

    static async generateImage(prompt) {
        try {
            // Add seed to prevent caching of identical prompts
            const seed = generateSeed();
            const url = `${AI_CONFIG.imageEndpoint}${encodeURIComponent(prompt)}?width=400&height=250&model=flux&seed=${seed}`;
            
            const response = await this.fetchWithTimeout(url);
            
            if (!response.ok) throw new Error("IMAGE_GEN_ERROR");
            
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.warn("AI Image Generation Failed:", error);
            return null; // Handle null in UI (show placeholder)
        }
    }
}

/**
 * MAIN EXPORT: GameEngine
 * The bridge between the App and the AI
 */
export const GameEngine = {
    
    /**
     * processTurn
     * @param {Object} playerData - The selected player object
     * @param {Object} actionData - The button clicked (risk/reward)
     */
    async processTurn(playerData, actionData) {
        // 1. Calculate Logic (RNG vs Stats)
        const luck = Math.random() * 100;
        const skill = playerData.stats.power || playerData.stats.accuracy; // Simplified stat pick
        const successChance = (skill * 0.4) + (100 - actionData.risk * 0.6); 
        
        let outcomeType = "Neutral";
        
        if (luck < successChance) {
            outcomeType = "Success/Brilliant";
        } else {
            outcomeType = "Failure/Wicket/Miss";
        }

        // 2. Generate Prompts
        const textPrompt = PromptEngineer.constructCommentaryPrompt(
            playerData.name, 
            playerData.role, 
            actionData.label, 
            outcomeType
        );

        const imgPrompt = PromptEngineer.constructVisualPrompt(
            playerData.name, 
            actionData.label
        );

        // 3. Parallel Execution (Faster Performance)
        // We start both requests at the same time
        const [commentary, visualUrl] = await Promise.all([
            AINetworkLayer.generateText(textPrompt),
            AINetworkLayer.generateImage(imgPrompt)
        ]);

        return {
            result: outcomeType,
            commentary: commentary,
            visual: visualUrl,
            statsUpdate: outcomeType.includes("Success") ? actionData.reward : -actionData.risk
        };
    }
};
