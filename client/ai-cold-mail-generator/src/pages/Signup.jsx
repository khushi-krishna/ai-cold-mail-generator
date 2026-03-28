import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import './Auth.css';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', { username, email, password });
            toast.success(data.message);
            navigate('/verify-otp', { state: { userId: data.userId, email } });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
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
                    <span className="auth-eyebrow">Get started</span>
                    <h1 className="auth-title">Create your account</h1>
                    <p className="auth-subtitle">Start generating winning outreach sequences in seconds.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label className="auth-label">Full Name</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="auth-input"
                            placeholder="Alex Johnson"
                        />
                    </div>

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
                            placeholder="Min. 8 characters"
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="auth-spinner" />
                                Creating account...
                            </>
                        ) : 'Create account'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;