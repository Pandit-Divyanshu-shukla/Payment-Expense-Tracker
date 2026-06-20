const express = require("express");
const router = express.Router();
const {  isLoggedIn, saveRedirect } = require("../middlewares")
const transactionsController = require("../controllers/transactions");
const wrapAsync = require("../utils/wrapAsync");
const { calculateChartTotals, sendChartUpdate } = require("../middlewares");
const receiptUpload = require("../middleware/receiptUpload");



router
    .route("/new")
    .get(isLoggedIn,saveRedirect,transactionsController.renderNewForm)

router
    .route("/receipt")
    .post(isLoggedIn, receiptUpload.single("receipt"), wrapAsync(transactionsController.scanReceipt))

router
    .route("/")
    .get(isLoggedIn,saveRedirect,transactionsController.showAllTransactions)
    .post(isLoggedIn,wrapAsync(transactionsController.createTransaction))

router
    .route("/:id")
    .get(isLoggedIn,saveRedirect,wrapAsync(transactionsController.showTransactions))
    .put(isLoggedIn,wrapAsync(transactionsController.updateTransaction),calculateChartTotals,sendChartUpdate)
    .delete(isLoggedIn,wrapAsync(transactionsController.deleteTransaction),calculateChartTotals,sendChartUpdate)


router
    .route("/:id/edit")
    .get(isLoggedIn,wrapAsync(transactionsController.editTransaction))
    

module.exports = router;
