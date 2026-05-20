const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirect } = require("../middlewares")
const userController = require("../controllers/user");

// Register
router
  .route("/register")
  .get(userController.renderRegisterForm)
  .post(userController.registerUser);

// Login
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(userController.authenticate,
    userController.loginSuccess);


// Logout
router.get("/logout", userController.logoutUser);

module.exports = router;
