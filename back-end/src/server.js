require("dotenv").config();

const express = require("express");
const { syncStocks } = require("./services/stocks-service.js");
const ServiceConfig = require("./configs/config.js");
const stocksRouter = require("./routes/stocks-routes.js");

const app = express();
let needToSync = ServiceConfig.needToSync;

// JSON parser
app.use(express.json());

// Simple CORS middleware
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Register routes
app.use("/api", stocksRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Service started on port ${PORT}`);
    if (needToSync) {
        try {
            await syncStocks();
        } catch (e) {
            console.error(e);
        }
    }
});

