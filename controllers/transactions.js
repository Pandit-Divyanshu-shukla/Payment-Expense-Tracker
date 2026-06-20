const Transaction = require("../models/transactions");
const categories = require("../utils/categories");
const { extractReceiptWithGemini } = require("../utils/geminiReceiptExtractor");

function renderTransactionForm(res, data = {}) {
    res.render("transactions/new", {
        categoryOptions: categories,
        extractedData: data.extractedData || {},
        receipt: data.receipt || null,
        ocrText: data.ocrText || ""
    });
}

/* ===================== NEW ===================== */

module.exports.renderNewForm = (req, res) => {
    renderTransactionForm(res);
};

module.exports.scanReceipt = async (req, res) => {
    if (!req.file) {
        req.flash("error", "Please upload a receipt image");
        return res.redirect("/transactions/new");
    }

    let parsedReceipt;

    try {
        parsedReceipt = await extractReceiptWithGemini(req.file.path, req.file.mimetype);
    } catch (err) {
        req.flash("error", `Receipt AI extraction failed: ${err.message}`);
        return renderTransactionForm(res, {
            receipt: {
                url: `/uploads/receipts/${req.file.filename}`,
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimetype: req.file.mimetype
            }
        });
    }

    req.flash("success", "Receipt analyzed by AI. Please review the detected details before saving.");

    renderTransactionForm(res, {
        extractedData: parsedReceipt,
        receipt: {
            url: `/uploads/receipts/${req.file.filename}`,
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype
        },
        ocrText: JSON.stringify(parsedReceipt.rawAiResponse, null, 2)
    });
};

module.exports.createTransaction = async (req, res) => {
    const { amount, description, category, date, receiptUrl, receiptFilename, receiptMimetype } = req.body;

    const transaction = new Transaction({
        amount,
        description,
        category,
        date,
        user: req.user._id
    });

    if (receiptUrl && receiptFilename) {
        transaction.receipt = {
            url: receiptUrl,
            filename: receiptFilename,
            mimetype: receiptMimetype
        };
    }

    await transaction.save();

    req.flash("success", "Expense Added Successfully");
    res.redirect("/dashboard");
};

/* ===================== DELETE ===================== */

module.exports.deleteTransaction = async (req, res, next) => {
    const { id } = req.params;

    const deleted = await Transaction.findOneAndDelete({
        _id: id,
        user: req.user._id
    });

    if (!deleted) {
        req.flash("error", "Delete failed or unauthorized");
        return res.redirect("/dashboard"); //  return
    }

    req.flash("success", "Transaction deleted successfully");

    //  pass redirect forward
    res.locals.redirectUrl = req.session.redirectUrl || "/dashboard";

    next(); // chart update middleware
};

/* ===================== EDIT (FORM) ===================== */

module.exports.editTransaction = async (req, res) => {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
        _id: id,
        user: req.user._id
    });

    if (!transaction) {
        req.flash("error", "Transaction not found");
        return res.redirect(res.locals.redirectUrl || "/dashboard");
    }

    res.render("transactions/edit", { transaction, categoryOptions: categories });
};

/* ===================== UPDATE ===================== */

module.exports.updateTransaction = async (req, res) => {
    const { amount, description, category, date } = req.body;
    const { id } = req.params;

    const updated = await Transaction.findOneAndUpdate(
        { _id: id, user: req.user._id },
        { amount, description, category, date },
        { new: true, runValidators: true }
    );

    if (!updated) {
        req.flash("error", "Transaction not found");
        return res.redirect("/dashboard");
    }

    req.flash("success", "Expense Updated Successfully");
    res.redirect("/dashboard");
};

/* ===================== READ ALL ===================== */

module.exports.showAllTransactions = async (req, res) => {
    let { category, from, to, q } = req.query;


    if (from && !to) {
        to = new Date().toISOString().split("T")[0];
    }


    // Base filter: user ownership
    let filter = { user: req.user._id };

    // Category filter
    if (category) {
        filter.category = category;
    }

    // Date range filter
    if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(to);
    }

    // Search by description (case-insensitive)
    if (q) {
        filter.description = {
            $regex: q,
            $options: "i"
        };
    }

    const transactions = await Transaction
        .find(filter)
        .sort({ date: -1 });

    res.render("transactions/show", {
        transactions,
        filters: { category, from, to, q }
    });
};


/* ===================== READ ONE ===================== */

module.exports.showTransactions = async (req, res) => {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
        _id: id,
        user: req.user._id
    });

    if (!transaction) {
        req.flash("error", "Transaction not found");
        return res.redirect(res.locals.redirectUrl || "/dashboard");
    }

    res.render("transactions/showOne", { transaction });
};
