import React, { useState } from "react";
import "./Loginpage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [userData, setUserData] = useState(null);
    const [marks, setMarks] = useState({
        tamil: "",
        english: "",
        maths: "",
        science: "",
        socialScience: "",
    });
    const [percentage, setPercentage] = useState(0);
    const navigate = useNavigate();
    axios.default.widthCredantials=true;
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("https://mern-stack-api-beta.vercel.app//login", { name, password });
            if (!response.data || !response.data.name) {
                alert("Login successful, but user data is missing!");
                return;
            }
            setUserData(response.data);
            if (response.data.marks) {
                setMarks(response.data.marks);
                calculatePercentage(response.data.marks);
            }
        } catch (error) {
            alert("Login failed: " + (error.response?.data?.error || "Unknown error"));
        }
    };

    const calculatePercentage = (marks) => {
        const totalMarks = Object.values(marks).reduce((acc, val) => acc + Number(val), 0);
        const percentageValue = (totalMarks / (5 * 100)) * 100;
        setPercentage(percentageValue.toFixed(2));
    };

    const handleChange = (e) => {
        const updatedMarks = { ...marks, [e.target.name]: e.target.value };
        setMarks(updatedMarks);
        calculatePercentage(updatedMarks);
    };

    const handleUpdateMarks = async (e) => {
        e.preventDefault();
        if (!userData || !userData.name || !userData.fatherName) {
            alert("User details are missing. Please log in again.");
            return;
        }
        try {
            await axios.post("http://localhost:5000/update-marks", { 
                name: userData.name, 
                fatherName: userData.fatherName, 
                marks 
            });
            alert("Marks updated successfully!");
        } catch (error) {
            alert("Error updating marks: " + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="body">
            <div className="login-container">
                <h2 className="h2">Login</h2>
                {!userData ? (
                    <form onSubmit={handleLogin}>
                        <input type="text" className="input" placeholder="User ID" value={name} onChange={(e) => setName(e.target.value)} required />
                        <input type="password" className="input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type="submit" className="button1">Login</button>
                        <button type="button" className="button2" onClick={() => navigate('/Register')}>Register</button>
                    </form>
                ) : (
                    <div className="profile-container">
    <h3 className="title">Welcome, {userData.name}!</h3>

    <div className="profile">
        <img 
            src={`http://localhost:5000/${userData.photo}`} 
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
                {Object.keys(marks).map((subject) => (
                    <tr key={subject}>
                        <td>{subject.replace(/([A-Z])/g, " $1")}</td>
                        <td>
                            <input 
                                type="number" 
                                className="marks-input" 
                                name={subject} 
                                value={marks[subject]} 
                                onChange={handleChange} 
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
</div>

                )}
            </div>
        </div>
    );
};

export default Login;
