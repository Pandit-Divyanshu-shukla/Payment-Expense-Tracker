const Transaction = require("./models/transactions");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  next();
};


module.exports.calculateChartTotals = async (req, res, next) => {
  try {
    const categoryTotals = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      },
      { $sort: { total: -1 } }
    ]);

    req.categoryTotals = categoryTotals;
    req.chartData = categoryTotals.map(cat => cat.total);

    next();
  } catch (err) {
    next(err);
  }
};

module.exports.sendChartUpdate = (req, res) => {
  const redirectUrl = "/dashboard";
  res.redirect(redirectUrl);
};

module.exports.saveRedirect = (req, res, next) => {

  // store original URL (GET only, avoid form submissions)
  if (req.method === "GET") {
    req.session.redirectUrl = req.originalUrl;
  }

  // expose to views/controllers
  res.locals.redirectUrl = req.session.redirectUrl;

  next();
};




