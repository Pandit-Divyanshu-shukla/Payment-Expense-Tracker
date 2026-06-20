require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const dashboardRoutes = require("./routes/dashboard");
const transactionsRoutes = require("./routes/transactions")
const ejsMate = require("ejs-mate");
const Chartkick = require("chartkick");
const methodOverride = require("method-override");


const User = require("./models/user");
const userRoutes = require("./routes/user");

const app = express();
const port = 5000;

app.locals.Chartkick = Chartkick;

// MongoDB
mongoose.connect(process.env.DB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log(err));

// Body parser (for login/register)
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));

//  SESSION FIRST
app.use(
  session({
    name: "expense-tracker-session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,          // MUST be false on localhost
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);


//  THEN PASSPORT
app.use(passport.initialize());
app.use(passport.session());

//  THEN FLASH
app.use(flash());

// Passport config
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});


// Routes
app.use("/", userRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/transactions",transactionsRoutes);




app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
