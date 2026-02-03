// ai.js
export async function generateContent(player, role, action) {
    // 1. Text Prompt
    const textPrompt = `Cricket commentary in Hindi. Player: ${player}. Role: ${role}. Action taken: ${action}. Describe the result in 2 lines excitingly.`;
    
    // 2. Image Prompt
    const imgPrompt = `Cricket match, ${player} doing ${action} action, cinematic lighting, 4k realistic, stadium background`;

    try {
        const [textData, imgBlob] = await Promise.all([
            fetch(`https://pollinations.ai/api/text?prompt=${encodeURIComponent(textPrompt)}`).then(res => res.text()),
            fetch(`https://pollinations.ai/p/${encodeURIComponent(imgPrompt)}?width=400&height=250&seed=${Math.random()}`).then(res => res.blob())
        ]);
        
        return { text: textData, imageUrl: URL.createObjectURL(imgBlob) };
    } catch (error) {
        console.error("AI Error:", error);
        return { text: "Signal Lost...", imageUrl: null };
    }
}
