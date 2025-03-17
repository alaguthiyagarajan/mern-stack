import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Loginpage/Loginpage';
import Register from './Register/Registerpage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Login />} />  {/* Default page */}
            </Routes>
        </Router>
    );
}

export default App;
