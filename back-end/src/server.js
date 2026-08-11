require("dotenv").config();

const express = require("express");
const { syncStocks } = require("./services/stocks-service.js");
const ServiceConfig = require("../configs/config.js");


const app = express();
let needToSync = ServiceConfig.needToSync;
app.use(express.json())

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
