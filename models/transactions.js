const mongoose = require("mongoose");
const categories = require("../utils/categories");

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: categories
    },
    date: {
        type: Date,
        default: Date.now
    },
    receipt: {
        url: String,
        filename: String,
        mimetype: String
    }

});

module.exports = mongoose.model("Transaction", transactionSchema);
