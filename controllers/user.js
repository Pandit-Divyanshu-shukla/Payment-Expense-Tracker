const User = require("../models/user");
const passport = require("passport");

module.exports.authenticate = (req, res, next) => {
  passport.authenticate("local", {
    failureRedirect: "/login"
  })(req, res, next);
};

module.exports.loginSuccess = (req, res) => {
  res.redirect("/dashboard");
};


// =========================
// Render Register Form
// =========================
module.exports.renderRegisterForm = (req, res) => {
    res.render("user/register");
};

// =========================
// Register New User
// =========================
module.exports.registerUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);

        // Auto-login after registration
        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome! Registration successful.");

            // ✅ USE + CLEAN redirectUrl
            const redirectUrl = req.session.redirectUrl || "/dashboard";
            delete req.session.redirectUrl;

            res.redirect(redirectUrl);
        });

    } catch (err) {
        req.flash("error", "User already registered");
        res.redirect("/register");
    }
};

// =========================
// Render Login Form
// =========================
module.exports.renderLoginForm = (req, res) => {
    res.render("user/login");
};

// =========================
// Login User (after passport authentication)
// =========================
module.exports.loginUser = (req, res) => {
    req.flash("success", "Welcome back!");

    // ✅ USE + CLEAN redirectUrl
    const redirectUrl = req.session.redirectUrl || "/dashboard";
    delete req.session.redirectUrl;

    res.redirect(redirectUrl);
};

// =========================
// Logout User
// =========================
module.exports.logoutUser = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.flash("success", "Logged out successfully");
        res.redirect("/login");
    });
};
