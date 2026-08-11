const ServiceConfig = require("../configs/config.js");
const db = require("../configs/database.js");

const api = ServiceConfig["stocks-api"];

async function fetchStocks() {
    try {
        const response = await fetch(api);
        if (!response.ok) {
            throw new Error(
                `Stock API request failed: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching stocks:", error.message);
        throw error;
    }
}


function transformData(data) {
    if (!data || !Array.isArray(data.data)) {
        throw new Error("Invalid stock API response");
    }

    return data.data
        .filter(stock => stock.country === "India")
        .filter(stock => stock.type === "Common Stock")
        .map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            exchange: stock.exchange,
            is_active: true
    }));
}


async function saveToDb(stocks) {
    if (!stocks || stocks.length === 0) {
        console.log("No stocks to save.");
        return;
    }

    const query = `
        INSERT INTO stocks
        (
            symbol,
            name,
            exchange,
            is_active
        )
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            exchange = VALUES(exchange),
            is_active = VALUES(is_active)
    `;

    try {
        for (const stock of stocks) {
            await db.execute(query, [
                stock.symbol,
                stock.name,
                stock.exchange,
                stock.is_active
            ]);
        }

        console.log(`${stocks.length} stocks saved successfully.`);
    } catch (error) {
        console.error("Error saving stocks:", error.message);
        throw error;
    }
}

async function syncStocks() {
    try {
        console.log("Starting stock synchronization...");

        const data = await fetchStocks();

        const stocks = transformData(data);

        await saveToDb(stocks);

        console.log("Stock synchronization completed.");

        return stocks;
    } catch (error) {
        console.error("Stock synchronization failed:", error.message);
        throw error;
    }
}


module.exports = {
    fetchStocks,
    transformData,
    saveToDb,
    syncStocks
};