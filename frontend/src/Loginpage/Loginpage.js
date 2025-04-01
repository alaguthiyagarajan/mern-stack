import React, { useState, useEffect } from "react";
import "./Loginpage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [userData, setUserData] = useState(null);
    const [marks, setMarks] = useState([
        { subject: "Tamil", score: "" },
        { subject: "English", score: "" },
        { subject: "Maths", score: "" },
        { subject: "Science", score: "" },
        { subject: "Social", score: "" }
    ]);
    const [percentage, setPercentage] = useState(0);
    const navigate = useNavigate();
    
    axios.defaults.withCredentials = true;

    useEffect(() => {
        // Check if user is already logged in
        const storedUser = localStorage.getItem("userData");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserData(parsedUser);
            if (Array.isArray(parsedUser.marks)) {
                setMarks(parsedUser.marks);
                calculatePercentage(parsedUser.marks);
            } else {
                setMarks([
                    { subject: "Tamil", score: "" },
                    { subject: "English", score: "" },
                    { subject: "Maths", score: "" },
                    { subject: "Science", score: "" },
                    { subject: "Social", score: "" }
                ]); // Reset marks if not valid
            }
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!name || !password) {
            alert("Please enter both User ID and Password");
            return;
        }

        try {
            const response = await axios.post("https://mern-stack-cmd5.onrender.com/login", { name, password }, { withCredentials: true });

            if (!response.data || !response.data.name) {
                alert("Login successful, but user data is missing!");
                return;
            }

            setUserData(response.data);
            localStorage.setItem("userData", JSON.stringify(response.data));

            if (Array.isArray(response.data.marks)) {
                setMarks(response.data.marks);
                calculatePercentage(response.data.marks);
            }

            alert("Login successful!");
        } catch (error) {
            alert("Login failed: " + (error.response?.data?.error || "Unknown error"));
        }
    };

    const calculatePercentage = (marksData) => {
        if (!Array.isArray(marksData)) {
            console.error("Marks data is not an array:", marksData);
            return;
        }

        const totalMarks = marksData.reduce((acc, mark) => acc + (Number(mark.score) || 0), 0);
        const percentageValue = (totalMarks / (marksData.length * 100)) * 100;
        setPercentage(percentageValue.toFixed(2));
    };

    const handleChange = (index, value) => {
        const updatedMarks = [...marks];
        updatedMarks[index].score = value;
        setMarks(updatedMarks);
        calculatePercentage(updatedMarks);
    };

    const handleUpdateMarks = async (e) => {
        e.preventDefault();
        if (!userData || !userData.name || !userData.fatherName) {
            alert("User details are missing. Please log in again.");
            return;
        }

        const marksToSend = marks.map(mark => ({
            subject: mark.subject,
            score: Number(mark.score) || 0
        }));

        try {
            await axios.post("https://mern-stack-cmd5.onrender.com/update-marks", {
                name: userData.name,
                fatherName: userData.fatherName,
                marks: marksToSend,
            });
            alert("Marks updated successfully!");
        } catch (error) {
            alert("Error updating marks: " + (error.response?.data?.error || error.message));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("userData");
        setUserData(null);
        setName("");
        setPassword("");
        setMarks([
            { subject: "Tamil", score: "" },
            { subject: "English", score: "" },
            { subject: "Maths", score: "" },
            { subject: "Science", score: "" },
            { subject: "Social", score: "" }
        ]);
        setPercentage(0);
        navigate("/");
    };

    return (
        <div className="body">
            <div className="login-container">
                <h2 className="h2">Login</h2>
                {!userData ? (
                    <form onSubmit={handleLogin}>
                        <input 
                            type="text" 
                            className="input" 
                            placeholder="User ID" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                        <input 
                            type="password" 
                            className="input" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        <button type="submit" className="button1">Login</button>
                        <button type="button" className="button2" onClick={() => navigate('/Register')}>Register</button>
                    </form>
                ) : (
                    <div className="profile-container">
                        <h3 className="title">Welcome, {userData.name}!</h3>

                        <div className="profile">
                            <img 
                                src={`https://mern-stack-cmd5.onrender.com/${userData.photo}`} 
                                className="profile-img" 
                                alt="User Photo" 
                            />
                        </div>

                        <div className="details">
                            <p><span className="label">Age:</span> {userData.age}</p>
                            <p><span className="label">Class:</span> {userData.className}</p>
                            <p><span className="label">Father's Name:</span> {userData.fatherName}</p>
                            <p><span className="label">Standard:</span> {userData.std}</p>
                        </div>

                        <h3 className="subtitle">Marks</h3>
                        <form onSubmit={handleUpdateMarks} className="marks-form">
                            <table className="marks-table">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Marks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {marks.map((mark, index) => (
                                        <tr key={index}>
                                            <td>{mark.subject}</td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    className="marks-input" 
                                                    value={mark.score} 
                                                    onChange={(e) => handleChange(index, e.target.value)} 
                                                    placeholder="Enter marks" 
                                                    required 
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <h3 className="percentage">Total Percentage: {percentage}%</h3>
                            <button type="submit" className="update-btn">Update Marks</button>
                        </form>

                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
