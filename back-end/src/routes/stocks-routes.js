const express = require("express");
const router = express.Router();
const { getStocks, getStockAnalysis } = require("../controllers/stocks-controller.js");

router.get("/stocks", getStocks);
router.post("/stocks/:symbol/analyze", getStockAnalysis);

module.exports = router;
