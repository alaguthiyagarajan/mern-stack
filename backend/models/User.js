const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    std: { type: String, required: true },
    className: { type: String, required: true },
    fatherName: { type: String, required: true },
    password: { type: String, required: true },
    photo: { type: String },
    marks: {
        tamil: { type: Number, default: 0 },
        english: { type: Number, default: 0 },
        maths: { type: Number, default: 0 },
        science: { type: Number, default: 0 },
        socialScience: { type: Number, default: 0 },
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// 🔥 Drop the unique index on userId if it exists
User.collection.dropIndex("userId_1").catch((err) => {
    if (err.code !== 27) { // Code 27 means index doesn't exist
        console.error("Error dropping userId index:", err);
    }
});

module.exports = User;
