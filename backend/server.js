require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const User = require('./models/User');
const fs = require('fs');

const app = express();

// ✅ CORS Middleware - Fixing CORS issue
app.use(cors({
    origin: "https://mern-stack-1-xv17.onrender.com", // Allow only your frontend
    credentials: true, // Allow cookies and authentication headers
    methods: ["POST", "GET"], // Allow these methods
    allowedHeaders: ["Content-Type", "Authorization"] // Allow headers
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB Error:", err.message));

// ✅ Multer Storage Configuration for Image Uploads
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
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// ✅ Register Route
app.post('/Register', upload.single('photo'), async (req, res) => {
    try {
        const { name, age, std, className, fatherName, password, confirmPassword } = req.body;

        if (!name || !age || !std || !className || !fatherName || !password || !confirmPassword) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const existingUser = await User.findOne({ name, fatherName });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const photoPath = req.file ? req.file.path : '';

        const newUser = new User({ name, age, std, className, fatherName, password: hashedPassword, photo: photoPath });
        await newUser.save();

        res.status(201).json({ message: 'User Registered Successfully' });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Login Route (Fixed)
app.post("/login", async (req, res) => {
    try {
        console.log("Login request received:", req.body);

        const { name, password } = req.body;
        if (!name || !password) {
            console.log("Missing credentials");
            return res.status(400).json({ message: "Name and password are required" });
        }

        const user = await User.findOne({ name });
        if (!user) {
            console.log("User not found:", name);
            return res.status(401).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);

        if (!isMatch) {
            console.log("Invalid password for:", name);
            return res.status(401).json({ message: "Invalid password" });
        }

        console.log("Login successful for:", user.name);
        res.json({
            name: user.name,
            age: user.age,
            std: user.std,
            className: user.className,
            fatherName: user.fatherName,
            photo: user.photo,
            marks: user.marks || {}
        });

    } catch (err) {
        console.error("Server error:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Add Marks Route
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

// ✅ Update Marks Route
app.post("/update-marks", async (req, res) => {
    try {
        const { name, fatherName, marks } = req.body;
        if (!name || !fatherName || !marks) return res.status(400).json({ error: "Name, Father's Name, and Marks are required" });

        const user = await User.findOne({ name, fatherName });
        if (!user) return res.status(404).json({ error: "User not found" });

        user.marks = marks;
        await user.save();
        res.json({ message: "Marks updated successfully", marks: user.marks });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Home Route
app.get("/", (req, res) => {
    res.json({ message: "Hello, server is running!" });
});

// ✅ Start Server
const PORT = process.env.PORT || 1000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
