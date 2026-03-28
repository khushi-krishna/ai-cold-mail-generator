import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import './Dashboard.css';

const Dashboard = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // This is our source of truth
    const [copied, setCopied] = useState('');
    const [activeTab, setActiveTab] = useState('subject');

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        try {
            const response = await api.post('/ai/generate-email', { prompt });
            
            // Backend returns: { message: "...", data: { subject, emailBody... } }
            // We need to save 'response.data.data' specifically.
            if (response.data && response.data.data) {
                setResult(response.data.data);
                setActiveTab('subject');
                toast.success('Campaign Generated!');
            }
        } catch (error) {
            console.error("Generation Error:", error);
            toast.error(error.response?.data?.message || 'Failed to generate.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, type) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(type);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(''), 2000);
    };

    // Tabs only exist if we have a result object
    const tabs = result ? [
        { key: 'subject',  label: 'Subject Line', emoji: '✦', content: result.subject },
        { key: 'email',    label: 'Cold Email',   emoji: '✉', content: result.emailBody },
        { key: 'linkedin', label: 'LinkedIn DM',  emoji: '◈', content: result.linkedInDM },
        { key: 'followup', label: 'Follow-up',    emoji: '↺', content: result.followUpEmail },
    ] : [];

    const activeContent = tabs.find(t => t.key === activeTab)?.content || '';

    return (
        <div className="dash-root">
            <div className="dash-grid">
                {/* Header */}
                <div className="dash-header">
                    <span className="dash-logo">Outreach.ai</span>
                    <span className="dash-badge">Campaign Studio</span>
                </div>

                {/* Left Panel: Input */}
                <div className="panel-left">
                    <h2 className="panel-title">
                        Craft your<br /><span>perfect pitch.</span>
                    </h2>
                    <div className="divider" />

                    <form onSubmit={handleGenerate} className="flex flex-col gap-3 flex-1">
                        <div className="flex-1 flex flex-col">
                            <span className="prompt-label">Your Prompt</span>
                            <textarea
                                className="prompt-textarea"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g. Cold email to a Recruiter at Google for an SDE-2 role..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="generate-btn"
                            disabled={loading || !prompt.trim()}
                        >
                            {loading ? (
                                <><div className="spinner" /> Generating...</>
                            ) : (
                                <>✦ Generate Campaign</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Right Panel: Output */}
                <div className="panel-right">
                    {/* FIX: Used 'result' instead of 'res' */}
                    {result ? (
                        <>
                            <div className="tabs-bar">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.key}
                                        className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab.key)}
                                    >
                                        <span className="tab-emoji">{tab.emoji}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="content-area">
                                <div className="result-header">
                                    <span className="result-tag">
                                        {tabs.find(t => t.key === activeTab)?.label}
                                    </span>
                                    <button
                                        className={`copy-btn ${copied === activeTab ? 'copied' : ''}`}
                                        onClick={() => copyToClipboard(activeContent, activeTab)}
                                    >
                                        {copied === activeTab ? (
                                            <><CheckIcon className="w-3 h-3" /> Copied</>
                                        ) : (
                                            <><ClipboardDocumentIcon className="w-3 h-3" /> Copy</>
                                        )}
                                    </button>
                                </div>

                                <div className="meta-row">
                                    <span className="meta-chip">{activeContent.split(/\s+/).filter(Boolean).length} words</span>
                                    <span className="meta-chip">{activeContent.length} chars</span>
                                </div>

                                <div className="result-text">{activeContent}</div>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">✦</div>
                            <p className="empty-title">Nothing here yet</p>
                            <p className="empty-sub">
                                Describe your campaign and hit Generate — your AI-crafted messages will appear here.
                            </p>
                            <div className="empty-grid">
                                {['✉ Cold Email', '◈ LinkedIn DM', '✦ Subject Line', '↺ Follow-up'].map(item => (
                                    <div key={item} className="empty-chip">{item}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;