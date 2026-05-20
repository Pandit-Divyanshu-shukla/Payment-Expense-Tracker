const Transaction = require("../models/transactions");
const categories = require("../utils/categories");

/* ===================== NEW ===================== */

module.exports.renderNewForm = (req, res) => {
    res.render("transactions/new", { categoryOptions: categories });
};

module.exports.createTransaction = async (req, res) => {
    const { amount, description, category, date } = req.body;

    const transaction = new Transaction({
        amount,
        description,
        category,
        date,
        user: req.user._id
    });

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
        return res.redirect("/dashboard"); // ✅ return
    }

    req.flash("success", "Transaction deleted successfully");

    // ✅ pass redirect forward
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
    const { category, from, to, q } = req.query;


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
