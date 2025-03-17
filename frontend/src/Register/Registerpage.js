import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Registerpage.css';

const Register = () => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [std, setStd] = useState('');
    const [className, setClassName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [photo, setPhoto] = useState(null);
    const navigate = useNavigate();
    axios.default.widthCredantials=true;
    const handleRegister = async (e) => {
        e.preventDefault();
    
        console.log("Password:", password);
        console.log("Confirm Password:", confirmPassword);
    
        if (String(password).trim() !== String(confirmPassword).trim()) {
            alert("Passwords do not match!");
            return;
        }
    
        const formData = new FormData();
        formData.append('name', name);
        formData.append('age', age);
        formData.append('std', std);
        formData.append('className', className);
        formData.append('fatherName', fatherName);
        formData.append('password', password.trim());
        formData.append("confirmPassword", confirmPassword.trim());
        formData.append('photo', photo);
    
        try {
            await axios.post('http://localhost:5000/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Registration Successful');
            navigate('/login'); 
        } catch (error) {
            alert(error.response?.data?.error || 'Error during registration');
        }
    };
    
    return (
        <div className='body1'>
        <div className="register-container">
            <h2 className="register-heading">Registration Form</h2>
            <form onSubmit={handleRegister}>
                <table className="register-table">
                    <tbody>
                        <tr>
                            <td className="form-label">Name:</td>
                            <td><input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required /></td>
                        </tr>
                        <tr>
                            <td className="form-label">Age:</td>
                            <td><input type="number" className="form-input" value={age} onChange={(e) => setAge(e.target.value)} required /></td>
                        </tr>
                        <tr>
                            <td className="form-label">Std:</td>
                            <td><input type="text" className="form-input" value={std} onChange={(e) => setStd(e.target.value)} required /></td>
                        </tr>
                        <tr>
                            <td className="form-label">Class:</td>
                            <td><input type="text" className="form-input" value={className} onChange={(e) => setClassName(e.target.value)} required /></td>
                        </tr>
                        <tr>
                            <td className="form-label">Father's Name:</td>
                            <td><input type="text" className="form-input" value={fatherName} onChange={(e) => setFatherName(e.target.value)} required /></td>
                        </tr>
                        <tr>
                            <td className="form-label">Password:</td>
                            <td><input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required /></td>
                        </tr>
                        <tr>
                            <td className="form-label">Confirm Password:</td>
                            <td><input type="password" className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></td>
                        </tr>
                        <tr>
                            <td className="form-label">Photo:</td>
                            <td><input type="file" className="form-input file-input" onChange={(e) => setPhoto(e.target.files[0])} /></td>
                        </tr>
                    </tbody>
                </table>
    
                <button type="submit" className="register-btn">Register</button>
                <button type="button" className="login-btn" onClick={() => navigate('/login')}>Login</button>
            </form>
        </div>
    </div>
    
    );
};

export default Register;
