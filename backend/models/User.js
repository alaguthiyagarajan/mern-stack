const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    std: { type: String, required: true },
    className: { type: String, required: true },
    fatherName: { type: String, required: true },
    password: { type: String, required: true },
    photo: { type: String, default: " " }, // Default placeholder image
    marks: {
        type: Map,
        of: Number,
        default: {}
    }
}, { timestamps: true });

// Index for faster search (ensure you need this unique constraint)
userSchema.index({ name: 1, fatherName: 1 }, { unique: true });

// Hash password before saving (prevent double hashing)
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    if (!this.password.startsWith("$2a$")) { // Ensures password isn't already hashed
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
