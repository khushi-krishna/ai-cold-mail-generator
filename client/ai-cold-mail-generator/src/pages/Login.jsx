import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/authContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data);
            toast.success('Logged in successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-root">
            <div className="auth-glow auth-glow--a" />
            <div className="auth-glow auth-glow--b" />

            {/* Logo */}
            <Link to="/" className="auth-logo">
                Outreach<span>.ai</span>
            </Link>

            <div className="auth-card">
                <div className="auth-card-head">
                    <span className="auth-eyebrow">Welcome back</span>
                    <h1 className="auth-title">Sign in to your account</h1>
                    <p className="auth-subtitle">Pick up right where you left off.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label className="auth-label">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input"
                            placeholder="alex@company.com"
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                            placeholder="Your password"
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="auth-spinner" />
                                Signing in...
                            </>
                        ) : 'Sign in'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Don't have an account?{' '}
                    <Link to="/signup" className="auth-link">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;