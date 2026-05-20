require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const User = require("../models/user");
const Transaction = require("../models/transactions");
const sampleTransactions = require("./data");

mongoose.connect(process.env.DB_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

const seedDB = async () => {

  // 1️⃣ Clean old data
  await Transaction.deleteMany({});
  await User.deleteMany({});

  // 2️⃣ Create a seed user (CORRECT WAY)
  const seedUser = new User({
    username: "demo",
    email: "demo@example.com"
  });

  const registeredUser = await User.register(seedUser, "demo");

  // 3️⃣ Create transactions for that user
  const transactions = sampleTransactions(registeredUser._id);
  console.log(transactions)
  await Transaction.insertMany(transactions);

  console.log("✅ User & transactions seeded");
};

seedDB()
  .then(() => mongoose.connection.close())
  .catch(err => console.error(err));
