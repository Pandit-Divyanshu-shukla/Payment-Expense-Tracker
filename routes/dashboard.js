const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares");
const dashboardController = require("../controllers/dashboard");
const wrapAsync = require("../utils/wrapAsync");

// DASHBOARD
router.get("/", isLoggedIn, wrapAsync(dashboardController.renderDashboard));
router.post("/budget", isLoggedIn, wrapAsync(dashboardController.upsertMonthlyBudget));

module.exports = router;
