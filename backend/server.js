require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const multer = require('multer');
const app = express();
app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost:3000" })); // Adjust frontend URL
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log("Connected to MongoDB");
   
}).catch(err => console.error("MongoDB Connection Error:", err));
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Save files in the "uploads" folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);  // Unique file name
    }
});

const upload = multer({ storage });

// Register Route
app.post('/register', upload.single('photo'), async (req, res) => {
    try {
        const { name, age, std, className, fatherName, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const existingUser = await User.findOne({ name, fatherName }); // Check for duplicate names instead
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const photoPath = req.file ? req.file.path : '';

        const newUser = new User({ name, age, std, className, fatherName, password: hashedPassword, photo: photoPath });
        await newUser.save();

        res.json({ message: 'User Registered Successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/"(req,res)=>{
    res.json("hello");
});

app.post("/add-marks", async (req, res) => {
    try {
        console.log("Received request:", req.body); // Debugging

        const { userId, marks } = req.body;

        // Ensure userId and marks are present
        if (!userId || !marks) {
            return res.status(400).json({ error: "User ID and marks are required" });
        }

        // Validate if userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid User ID format" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.marks = marks;
        await user.save();

        res.json({ message: "Marks added successfully" });
    } catch (error) {
        console.error("Error in /add-marks:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/update-marks", async (req, res) => {
    try {
        const { name, fatherName, marks } = req.body;

        if (!name || !fatherName) {
            return res.status(400).json({ error: "Name and Father's Name are required" });
        }

        const user = await User.findOne({ name, fatherName });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.marks = marks;
        await user.save();
        res.json({ message: "Marks updated successfully", marks: user.marks });
    } catch (error) {
        console.error("🔴 Marks Update Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




app.post("/login", async (req, res) => {
    try {
        const { name, password } = req.body;
        const user = await User.findOne({ name });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        res.json({
            name: user.name,
            age: user.age,
            className: user.className,
            fatherName: user.fatherName,
            std: user.std,
            marks: user.marks || {}, // Ensure marks are always returned
            photo: user.photo
        });
    } catch (error) {
        console.error("Login API Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});









// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
