const db = require("../configs/database.js");
const { analyzeStock } = require("../services/gemini.service.js");

// Get stocks with optional search filter
async function getStocks(req, res) {
    try {
        const search = req.query.search || "";
        const limit = Math.min(parseInt(req.query.limit, 10) || 24, 200);

        let sql, params;

        if (search) {
            sql = `SELECT id, symbol, name, exchange, is_active FROM stocks WHERE symbol LIKE ? OR name LIKE ? LIMIT ${limit}`;
            params = [`%${search}%`, `%${search}%`];
        } else {
            sql = `SELECT id, symbol, name, exchange, is_active FROM stocks LIMIT ${limit}`;
            params = [];
        }

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching stocks:", error);
        res.status(500).json({ error: "Failed to fetch stocks" });
    }
}


// Analyze stock details with Gemini
async function getStockAnalysis(req, res) {
    try {
        const { symbol } = req.params;
        const { currentPrice, change, volume, name } = req.body;

        // Fallback/mock values if not provided
        const finalPrice = currentPrice || (Math.random() * 1000 + 100).toFixed(2);
        const finalChange = change || `${(Math.random() * 6 - 3).toFixed(2)}%`;
        const finalVolume = volume || Math.floor(Math.random() * 10000000 + 500000);
        const finalName = name || symbol;

        const prompt = `
You are a professional financial analyst and stock market assistant.

Analyze the following stock:
Stock Symbol: ${symbol}
Stock Name: ${finalName}
Current Price: ₹${finalPrice}
Today's Change: ${finalChange}
Volume: ${finalVolume.toLocaleString()}

Please provide:
1. An executive summary of the current market state for this stock.
2. Technical sentiment analysis (Bullish, Bearish, or Neutral) and why.
3. Price prediction outline for the next short-term period (e.g., next 5-10 trading days).
4. Risk factors to watch out for.

Keep the tone professional, insightful, and formatted using clean Markdown.
`;

        const analysis = await analyzeStock(prompt);
        res.json({
            symbol,
            name: finalName,
            price: finalPrice,
            change: finalChange,
            volume: finalVolume,
            analysis
        });
    } catch (error) {
        console.error(`Error analyzing stock ${req.params.symbol}:`, error);
        res.status(500).json({ error: "Failed to generate AI analysis" });
    }
}

module.exports = {
    getStocks,
    getStockAnalysis
};
