// init/data.js

const sampleTransactions = (userId) => [
  // ===== JANUARY =====
  {
    user: userId,
    amount: 250,
    description: "Zomato order",
    category: "Food",
    date: new Date("2025-01-05")
  },
  {
    user: userId,
    amount: 1200,
    description: "Electricity bill",
    category: "Bills",
    date: new Date("2025-01-10")
  },
  {
    user: userId,
    amount: 450,
    description: "Movie tickets",
    category: "Entertainment",
    date: new Date("2025-01-18")
  },

  // ===== FEBRUARY =====
  {
    user: userId,
    amount: 180,
    description: "Tea & snacks",
    category: "Food",
    date: new Date("2025-02-03")
  },
  {
    user: userId,
    amount: 320,
    description: "Uber ride",
    category: "Travel",
    date: new Date("2025-02-08")
  },
  {
    user: userId,
    amount: 900,
    description: "Online course fee",
    category: "Education",
    date: new Date("2025-02-15")
  },

  // ===== MARCH =====
  {
    user: userId,
    amount: 1500,
    description: "Shopping at mall",
    category: "Shopping",
    date: new Date("2025-03-04")
  },
  {
    user: userId,
    amount: 300,
    description: "Bus pass",
    category: "Travel",
    date: new Date("2025-03-12")
  },
  {
    user: userId,
    amount: 220,
    description: "Netflix subscription",
    category: "Entertainment",
    date: new Date("2025-03-20")
  },

  // ===== APRIL =====
  {
    user: userId,
    amount: 600,
    description: "Grocery shopping",
    category: "Food",
    date: new Date("2025-04-02")
  },
  {
    user: userId,
    amount: 1300,
    description: "Internet bill",
    category: "Bills",
    date: new Date("2025-04-10")
  },
  {
    user: userId,
    amount: 400,
    description: "Stationery items",
    category: "Education",
    date: new Date("2025-04-18")
  },

  // ===== MAY =====
  {
    user: userId,
    amount: 700,
    description: "Dinner with friends",
    category: "Food",
    date: new Date("2025-05-05")
  },
  {
    user: userId,
    amount: 2000,
    description: "New headphones",
    category: "Shopping",
    date: new Date("2025-05-14")
  },
  {
    user: userId,
    amount: 350,
    description: "Auto ride",
    category: "Travel",
    date: new Date("2025-05-21")
  },

  // ===== EDGE / OTHER =====
  {
    user: userId,
    amount: 100,
    description: "Charity donation",
    category: "Other",
    date: new Date("2025-06-01")
  }
];

module.exports = sampleTransactions;
