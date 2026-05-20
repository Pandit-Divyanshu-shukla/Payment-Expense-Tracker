const mongoose = require("mongoose");
const categories = require("../utils/categories");

const categoryBudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100
    },
    category: {
      type: String,
      required: true,
      enum: categories
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { timestamps: true }
);

categoryBudgetSchema.index(
  { user: 1, month: 1, year: 1, category: 1 },
  { unique: true }
);

module.exports = mongoose.model("CategoryBudget", categoryBudgetSchema);
