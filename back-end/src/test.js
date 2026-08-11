require("dotenv").config();

const { analyzeStock } = require("./services/gemini.service");

async function test() {

    console.log(
        "API key loaded:",
        process.env.GEMINI_API_KEY ? "YES" : "NO"
    );

    try {

        const prompt = `
You are a stock market analysis assistant.

Analyze the following stock:

Stock: RELIANCE
Current Price: 1420
Today's Change: +1.24%
Volume: 12400000

Give a simple analysis of the current situation.
`;

        const result = await analyzeStock(prompt);

        console.log("\n========== GEMINI RESPONSE ==========\n");
        console.log(result);
        console.log("\n=====================================\n");

    } catch (error) {

        console.error("Test failed:");
        console.error(error.message);

    }
}

test();