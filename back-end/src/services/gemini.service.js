require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function analyzeStock(prompt) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt
        });

        return response.text;

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}

module.exports = {
    analyzeStock
};