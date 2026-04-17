import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/authContext';
import './Auth.css';

const VerifyOtp = () => {
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(60); // 60s cooldown
    const [canResend, setCanResend] = useState(false);

    const inputRefs = useRef([]);
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const email = location.state?.email;

    // Timer Logic for Resend Button
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        if (!email) {
            toast.error('Session expired. Please sign up again.');
            navigate('/signup');
        } else {
            inputRefs.current[0]?.focus();
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[index] = digit;
        setDigits(next);
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const next = [...digits];
        pasted.split('').forEach((char, i) => { next[i] = char; });
        setDigits(next);
        const focusIndex = Math.min(pasted.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    // VerifyOtp.jsx
const handleResend = async () => {
    try {
        // Double check that 'email' has a value here!
         const { data } = await api.post('/api/auth/resend-otp', { email, otp });
        toast.success('New OTP sent!');
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to resend');
    }
};

    const otp = digits.join('');
    const isComplete = otp.length === 6;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isComplete) return;
        setLoading(true);
        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp });
            login(data);
            toast.success('Email verified successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid code. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-root">
            <div className="auth-glow auth-glow--a" />
            <div className="auth-glow auth-glow--b" />

            <Link to="/" className="auth-logo">
                Outreach<span>.ai</span>
            </Link>

            <div className="auth-card">
                <div className="auth-card-head">
                    <span className="auth-eyebrow">One last step</span>
                    <h1 className="auth-title">Verify your email</h1>
                    <p className="auth-subtitle">
                        We sent a 6-digit code to{' '}
                        <strong style={{ color: '#b8b4ac', fontWeight: 500 }}>{email}</strong>
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-otp-inputs" onPaste={handlePaste}>
                        {digits.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => inputRefs.current[i] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className="auth-otp-digit"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                        disabled={loading || !isComplete}
                    >
                        {loading ? <><span className="auth-spinner" /> Verifying...</> : 'Verify Email'}
                    </button>
                </form>

                <div className="auth-footer-text" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    {canResend ? (
                        <button 
                            onClick={handleResend} 
                            disabled={resending}
                            className="auth-link" 
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            {resending ? 'Sending...' : "Didn't get a code? Resend"}
                        </button>
                    ) : (
                        <p style={{ color: '#6b7280' }}>
                            Resend code in <span style={{ fontWeight: 600 }}>{timer}s</span>
                        </p>
                    )}
                </div>

                <p className="auth-footer-text" style={{ marginTop: '1rem' }}>
                    Wrong email?{' '}
                    <Link to="/signup" className="auth-link">Go back</Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyOtp;