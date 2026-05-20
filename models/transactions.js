const mongoose = require("mongoose");

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
        enum: ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Education", "Other"]
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
