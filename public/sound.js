/* =========================================
   AUDIO ENGINE (Production V1.0)
   Features: SFX, Ambience, Text-to-Speech (Commentary)
   ========================================= */

class AudioController {
    constructor() {
        this.bgm = null;
        this.enabled = true;
        this.synth = window.speechSynthesis;
        
        // Base Sound Assets (Using lightweight CDNs or synthesized sounds)
        this.sounds = {
            click: new Audio("https://cdn.freesound.org/previews/256/256116_3263906-lq.mp3"), // Soft Click
            cheer: new Audio("https://cdn.freesound.org/previews/337/337000_5937666-lq.mp3"), // Crowd Cheer
            batHit: new Audio("https://cdn.freesound.org/previews/536/536108_11678704-lq.mp3"), // Bat Sound
            wickets: new Audio("https://cdn.freesound.org/previews/173/173958_3203837-lq.mp3") // Stumps Hit
        };

        // Pre-load settings
        Object.values(this.sounds).forEach(s => {
            s.volume = 0.5;
            s.preload = 'auto';
        });
    }

    /**
     * Play a short sound effect
     * @param {string} type - 'click', 'cheer', 'batHit', 'wickets'
     */
    playSFX(type) {
        if (!this.enabled || !this.sounds[type]) return;
        
        // Clone node allows overlapping sounds (fast clicks)
        const sfx = this.sounds[type].cloneNode();
        sfx.volume = 0.4;
        sfx.play().catch(e => console.log("Audio Play Blocked:", e));
    }

    /**
     * Speak the Commentary using AI Voice
     * @param {string} text - The text to speak
     */
    speakCommentary(text) {
        if (!this.enabled || !this.synth) return;

        // Cancel previous speech to keep up with game
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1; // Slightly faster for excitement
        utterance.pitch = 1.0;
        
        // Try to find a Hindi or Indian English voice
        const voices = this.synth.getVoices();
        const indianVoice = voices.find(v => v.lang.includes('IN') || v.name.includes('India'));
        if (indianVoice) utterance.voice = indianVoice;

        this.synth.speak(utterance);
    }

    /**
     * Toggle Mute/Unmute
     */
    toggleAudio() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Export Singleton Instance
export const SoundEngine = new AudioController();
