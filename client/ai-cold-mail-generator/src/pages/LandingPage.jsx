import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { ArrowRightIcon, BoltIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import './LandingPage.css';

const LandingPage = () => {
    const { user } = useAuth();

    const features = [
        {
            name: 'Lightning Fast Generation',
            description: 'Generate highly personalised cold emails in seconds using state-of-the-art AI.',
            icon: BoltIcon,
            tag: '01',
        },
        {
            name: 'Omnichannel Outreach',
            description: 'Email, follow-up, and LinkedIn DM — perfectly synced for your prospect in one shot.',
            icon: DocumentTextIcon,
            tag: '02',
        },
        {
            name: 'Higher Conversion Rates',
            description: 'Personalised copy ensures higher open rates and better reply outcomes every time.',
            icon: ChartBarIcon,
            tag: '03',
        },
    ];

    return (
        <div className="lp-root">

            {/* ── Nav ── */}
            <nav className="lp-nav">
                <span className="lp-nav-logo">Outreach<span>.ai</span></span>
                <div className="lp-nav-links">
                    {user ? (
                        <Link to="/dashboard" className="lp-btn-primary">
                            Dashboard <ArrowRightIcon className="lp-btn-icon" />
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="lp-nav-login">Log in</Link>
                            <Link to="/signup" className="lp-btn-primary">
                                Get Started <ArrowRightIcon className="lp-btn-icon" />
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="lp-hero">
                <div className="lp-hero-glow lp-hero-glow--a" />
                <div className="lp-hero-glow lp-hero-glow--b" />

                <div className="lp-hero-inner">
                    <span className="lp-eyebrow">AI-Powered Cold Outreach</span>

                    <h1 className="lp-hero-title">
                        Write cold emails<br />
                        that actually get<br />
                        <span className="lp-hero-title-accent">replies.</span>
                    </h1>

                    <p className="lp-hero-sub">
                        Stop wasting hours drafting outreach. Enter your prospect's context and let
                        our AI generate the perfect sequence — email, follow-up, and LinkedIn DM all at once.
                    </p>

                    <div className="lp-hero-actions">
                        <Link to={user ? '/dashboard' : '/signup'} className="lp-btn-primary lp-btn-primary--lg">
                            Start for free <ArrowRightIcon className="lp-btn-icon" />
                        </Link>
                        <span className="lp-hero-note">No credit card required</span>
                    </div>

                    {/* mock terminal card */}
                    <div className="lp-terminal">
                        <div className="lp-terminal-bar">
                            <span /><span /><span />
                            <p>outreach.ai · generating sequence</p>
                        </div>
                        <div className="lp-terminal-body">
                            <p><em className="lp-t-label">prompt →</em> Cold email to VP Sales at a SaaS startup, our tool cuts churn by 20%</p>
                            <p><em className="lp-t-label">subject →</em> Cut churn 20% — 3-min read for [Company]</p>
                            <p><em className="lp-t-label">email&nbsp;&nbsp;→</em> Hi [Name], noticed [Company] scaled to 500+ customers…</p>
                            <p><em className="lp-t-label">linkedin→</em> Hey [Name] — saw your post about retention. Worth a quick chat?</p>
                            <p className="lp-t-cursor">▋</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="lp-features">
                <div className="lp-features-inner">
                    <div className="lp-section-head">
                        <span className="lp-eyebrow">Why Outreach.ai</span>
                        <h2 className="lp-section-title">Everything you need<br />to close more deals.</h2>
                    </div>

                    <div className="lp-cards">
                        {features.map(({ name, description, icon: Icon, tag }) => (
                            <div key={name} className="lp-card">
                                <div className="lp-card-top">
                                    <div className="lp-card-icon">
                                        <Icon className="lp-card-icon-svg" />
                                    </div>
                                    <span className="lp-card-tag">{tag}</span>
                                </div>
                                <h3 className="lp-card-title">{name}</h3>
                                <p className="lp-card-desc">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="lp-cta">
                <div className="lp-cta-glow" />
                <div className="lp-cta-inner">
                    <span className="lp-eyebrow lp-eyebrow--light">Get started today</span>
                    <h2 className="lp-cta-title">Ready to scale<br />your outreach?</h2>
                    <p className="lp-cta-sub">
                        Join hundreds of sales professionals using Outreach.ai to accelerate their pipeline.
                    </p>
                    <Link to="/signup" className="lp-btn-primary lp-btn-primary--lg">
                        Create free account <ArrowRightIcon className="lp-btn-icon" />
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="lp-footer">
                <span className="lp-footer-logo">Outreach<span>.ai</span></span>
                <p className="lp-footer-copy">© {new Date().getFullYear()} Outreach.ai · All rights reserved.</p>
            </footer>

        </div>
    );
};

export default LandingPage;