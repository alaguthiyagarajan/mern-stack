require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://mern-stack-frontend-beryl.vercel.app");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
});


// Multer for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Register Route
app.post('/register', upload.single('photo'), async (req, res) => {
    try {
        const { name, age, std, className, fatherName, password, confirmPassword } = req.body;
        if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });

        const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max file size
});


        const existingUser = await User.findOne({ name, fatherName });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const photoPath = req.file ? req.file.path : '';

        const newUser = new User({ name, age, std, className, fatherName, password: hashedPassword, photo: photoPath });
        await newUser.save();
        res.json({ message: 'User Registered Successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET "/" Route
app.get("/", (req, res) => {
    res.json("hello");
});

// Add Marks Route
app.post("/add-marks", async (req, res) => {
    try {
        const { userId, marks } = req.body;
        if (!userId || !marks) return res.status(400).json({ error: "User ID and marks are required" });

        if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ error: "Invalid User ID format" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.marks = marks;
        await user.save();

        res.json({ message: "Marks added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Marks Route
app.post("/update-marks", async (req, res) => {
    try {
        const { name, fatherName, marks } = req.body;
        if (!name || !fatherName) return res.status(400).json({ error: "Name and Father's Name are required" });

        const user = await User.findOne({ name, fatherName });
        if (!user) return res.status(404).json({ error: "User not found" });

        user.marks = marks;
        await user.save();
        res.json({ message: "Marks updated successfully", marks: user.marks });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    try {
        const { name, password } = req.body;
        const user = await User.findOne({ name });
        if (!user) return res.status(401).json({ error: "User not found" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

        res.json({
            name: user.name,
            age: user.age,
            className: user.className,
            fatherName: user.fatherName,
            std: user.std,
            marks: user.marks || {}, 
            photo: user.photo
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
