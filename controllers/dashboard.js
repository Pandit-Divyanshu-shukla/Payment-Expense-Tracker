const Transaction = require("../models/transactions");
const Budget = require("../models/budget");
const CategoryBudget = require("../models/categoryBudget");
const categories = require("../utils/categories");

module.exports.renderDashboard = async (req, res) => {
  const { month, year } = req.query;
  const today = new Date();

  // Base filter: always user-based
  let filter = { user: req.user._id };

  const activeMonth = month ? parseInt(month, 10) : today.getMonth() + 1;
  const activeYear = year ? parseInt(year, 10) : today.getFullYear();

  //  Apply date filter ONLY if user explicitly selected month & year
  const startDate = new Date(activeYear, activeMonth - 1, 1);
  const endDate = new Date(activeYear, activeMonth, 0, 23, 59, 59, 999);

  filter.date = {
    $gte: startDate,
    $lte: endDate
  };

  // Get all matching transactions
  const Transactions = await Transaction.find(filter).sort({ date: -1 });

  // Recent 5
  const transactions = Transactions.slice(0, 5);

  const totalCount = Transactions.length;

  // Total expense
  const totalExpense = Transactions.reduce(
    (sum, txn) => sum + txn.amount,
    0
  );

  // Category-wise totals
  const categoryTotals = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" }
      }
    },
    { $sort: { total: -1 } }
  ]);

  const categoryChartData = categoryTotals.map(cat => [
    cat._id,
    cat.total
  ]);

  const categorySpentMap = categoryTotals.reduce((totals, cat) => {
    totals[cat._id] = cat.total;
    return totals;
  }, {});

  const savedCategoryBudgets = await CategoryBudget.find({
    user: req.user._id,
    month: activeMonth,
    year: activeYear
  });

  const categoryBudgetMap = savedCategoryBudgets.reduce((budgets, item) => {
    budgets[item.category] = item.amount;
    return budgets;
  }, {});

  const categoryBudgetSummaries = categories.map(category => {
    const spent = categorySpentMap[category] || 0;
    const budgetAmount = categoryBudgetMap[category] || 0;
    const remaining = budgetAmount - spent;
    const usedPercent = budgetAmount > 0
      ? Math.round((spent / budgetAmount) * 100)
      : 0;

    return {
      category,
      spent,
      budgetAmount,
      remaining,
      usedPercent,
      progressPercent: Math.min(usedPercent, 100),
      hasBudget: budgetAmount > 0,
      status: budgetAmount === 0
        ? "unset"
        : spent > budgetAmount
          ? "over"
          : usedPercent >= 80
            ? "warning"
            : "good"
    };
  });

  const monthlyBudget = await Budget.findOne({
    user: req.user._id,
    month: activeMonth,
    year: activeYear
  });

  const budgetAmount = monthlyBudget ? monthlyBudget.amount : 0;
  const budgetRemaining = budgetAmount - totalExpense;
  const budgetUsedPercent = budgetAmount > 0
    ? Math.round((totalExpense / budgetAmount) * 100)
    : 0;
  const budgetProgressPercent = Math.min(budgetUsedPercent, 100);
  const budgetStatus = !monthlyBudget
    ? "unset"
    : totalExpense > budgetAmount
      ? "over"
      : budgetUsedPercent >= 80
        ? "warning"
        : "good";

  const chartOptions = {
    height: "400px",
    donut: true
  };

  res.render("dashboard/index", {
    user: req.user,
    transactions,
    totalCount,
    totalExpense,
    categoryTotals,
    categoryChartData,
    categoryOptions: categories,
    categoryBudgetSummaries,
    chartOptions,
    budget: {
      amount: budgetAmount,
      remaining: budgetRemaining,
      usedPercent: budgetUsedPercent,
      progressPercent: budgetProgressPercent,
      status: budgetStatus,
      hasBudget: Boolean(monthlyBudget)
    },
    filters: {
      month: activeMonth,
      year: activeYear
    }
  });
};

module.exports.upsertMonthlyBudget = async (req, res) => {
  const month = parseInt(req.body.month, 10);
  const year = parseInt(req.body.year, 10);
  const amount = Number(req.body.amount);
  const redirectUrl = `/dashboard?month=${month}&year=${year}`;

  if (!month || !year || !amount || amount <= 0) {
    req.flash("error", "Please enter a valid monthly budget");
    return res.redirect(redirectUrl);
  }

  await Budget.findOneAndUpdate(
    { user: req.user._id, month, year },
    { amount },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  req.flash("success", "Monthly budget saved successfully");
  res.redirect(redirectUrl);
};

module.exports.upsertCategoryBudgets = async (req, res) => {
  const month = parseInt(req.body.month, 10);
  const year = parseInt(req.body.year, 10);
  const submittedBudgets = req.body.budgets || {};
  const redirectUrl = `/dashboard?month=${month}&year=${year}`;

  if (!month || !year) {
    req.flash("error", "Please select a valid month and year");
    return res.redirect("/dashboard");
  }

  const updates = [];

  for (const category of categories) {
    const rawAmount = submittedBudgets[category];

    if (rawAmount === undefined || rawAmount === "") {
      updates.push(CategoryBudget.deleteOne({
        user: req.user._id,
        month,
        year,
        category
      }));
      continue;
    }

    const amount = Number(rawAmount);

    if (!Number.isFinite(amount) || amount < 0) {
      req.flash("error", "Category budgets must be valid positive numbers");
      return res.redirect(redirectUrl);
    }

    if (amount === 0) {
      updates.push(CategoryBudget.deleteOne({
        user: req.user._id,
        month,
        year,
        category
      }));
      continue;
    }

    updates.push(CategoryBudget.findOneAndUpdate(
      { user: req.user._id, month, year, category },
      { amount },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    ));
  }

  await Promise.all(updates);

  req.flash("success", "Category budgets saved successfully");
  res.redirect(redirectUrl);
};

