import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import {
    ClipboardDocumentIcon, CheckIcon, ChevronDownIcon,
    ChevronUpIcon, MagnifyingGlassIcon, TrashIcon
} from '@heroicons/react/24/outline';
import './History.css';

const TABS = [
    { key: 'subject',       label: 'Subject',   emoji: '✦' },
    { key: 'emailBody',     label: 'Email',      emoji: '✉' },
    { key: 'linkedInDM',    label: 'LinkedIn',   emoji: '◈' },
    { key: 'followUpEmail', label: 'Follow-up',  emoji: '↺' },
];

// ── Confirmation Modal ──────────────────────────────────────
const ConfirmModal = ({ onConfirm, onCancel }) => (
    <div className="hi-modal-overlay">
        <div className="hi-modal">
            <div className="hi-modal-icon">
                <TrashIcon style={{ width: 18, height: 18 }} />
            </div>
            <p className="hi-modal-title">Clear all history?</p>
            <p className="hi-modal-body">
                This will permanently delete all your generation history.
                This action cannot be undone.
            </p>
            <div className="hi-modal-actions">
                <button className="hi-modal-cancel" onClick={onCancel}>Cancel</button>
                <button className="hi-modal-confirm" onClick={onConfirm}>Yes, delete all</button>
            </div>
        </div>
    </div>
);

// ── History Item ────────────────────────────────────────────
const HistoryItem = ({ item, index }) => {
    const [open,      setOpen]      = useState(false);
    const [activeTab, setActiveTab] = useState('subject');
    const [copied,    setCopied]    = useState('');

    const activeContent = item[activeTab] || '';

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        toast.success('Copied!');
        setTimeout(() => setCopied(''), 2000);
    };

    const date    = new Date(item.createdAt);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`hi-card ${open ? 'hi-card--open' : ''}`}>
            <button className="hi-row" onClick={() => setOpen(o => !o)}>
                <span className="hi-index">#{String(index + 1).padStart(2, '0')}</span>
                <div className="hi-row-main">
                    <span className="hi-subject">{item.subject}</span>
                    <span className="hi-prompt">{item.prompt}</span>
                </div>
                <div className="hi-row-meta">
                    <span className="hi-date">{dateStr}</span>
                    <span className="hi-time">{timeStr}</span>
                </div>
                <span className="hi-chevron">
                    {open ? <ChevronUpIcon className="hi-chevron-icon" /> : <ChevronDownIcon className="hi-chevron-icon" />}
                </span>
            </button>

            {open && (
                <div className="hi-detail">
                    <div className="hi-tabs">
                        {TABS.map(t => (
                            <button key={t.key}
                                className={`hi-tab ${activeTab === t.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(t.key)}>
                                <span>{t.emoji}</span> {t.label}
                            </button>
                        ))}
                    </div>
                    <div className="hi-content-wrap">
                        <div className="hi-content-header">
                            <span className="hi-content-tag">
                                {TABS.find(t => t.key === activeTab)?.label}
                            </span>
                            <div className="hi-content-meta">
                                <span className="hi-meta-chip">{activeContent.split(' ').filter(Boolean).length}w</span>
                                <button
                                    className={`hi-copy-btn ${copied === activeTab ? 'copied' : ''}`}
                                    onClick={() => copyToClipboard(activeContent, activeTab)}>
                                    {copied === activeTab
                                        ? <><CheckIcon className="hi-copy-icon" /> Copied</>
                                        : <><ClipboardDocumentIcon className="hi-copy-icon" /> Copy</>}
                                </button>
                            </div>
                        </div>
                        <div className="hi-content-text">{activeContent}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── History Page ────────────────────────────────────────────
const History = () => {
    const [history,     setHistory]     = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [search,      setSearch]      = useState('');
    const [showConfirm, setShowConfirm] = useState(false);  // ✅ modal state
    const [clearing,    setClearing]    = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get('/ai/history');
                setHistory(Array.isArray(data) ? data : data.history || []);
            } catch {
                toast.error('Failed to load history.');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // ✅ called when user clicks "Yes, delete all"
    const handleClearHistory = async () => {
        setClearing(true);
        try {
            await api.delete('/ai/history');
            setHistory([]);
            toast.success('History cleared.');
        } catch {
            toast.error('Failed to clear history.');
        } finally {
            setClearing(false);
            setShowConfirm(false);
        }
    };

    const filtered = history.filter(item =>
        item.subject?.toLowerCase().includes(search.toLowerCase()) ||
        item.prompt?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="hi-root">
            {showConfirm && (
                <ConfirmModal
                    onConfirm={handleClearHistory}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

            <div className="hi-page-header">
                <div>
                    <span className="hi-eyebrow">Your activity</span>
                    <h1 className="hi-page-title">Generation History</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* ✅ Clear history button */}
                    {history.length > 0 && (
                        <button
                            className="hi-clear-btn"
                            onClick={() => setShowConfirm(true)}
                            disabled={clearing}>
                            <TrashIcon style={{ width: 13, height: 13 }} />
                            {clearing ? 'Clearing...' : 'Clear history'}
                        </button>
                    )}
                    <div className="hi-search-wrap">
                        <MagnifyingGlassIcon className="hi-search-icon" />
                        <input
                            type="text"
                            className="hi-search"
                            placeholder="Search by subject or prompt..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Stats, list — unchanged below */}
            {!loading && history.length > 0 && (
                <div className="hi-stats">
                    <div className="hi-stat">
                        <span className="hi-stat-value">{history.length}</span>
                        <span className="hi-stat-label">Total generations</span>
                    </div>
                    <div className="hi-stat">
                        <span className="hi-stat-value">{filtered.length}</span>
                        <span className="hi-stat-label">Showing</span>
                    </div>
                    <div className="hi-stat">
                        <span className="hi-stat-value">
                            {new Date(history[history.length - 1].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="hi-stat-label">First generation</span>
                    </div>
                    <div className="hi-stat">
                        <span className="hi-stat-value">
                            {new Date(history[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="hi-stat-label">Latest</span>
                    </div>
                </div>
            )}

            <div className="hi-list">
                {loading ? (
                    <div className="hi-empty">
                        <div className="hi-spinner" />
                        <p>Loading history...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="hi-empty">
                        <div className="hi-empty-icon">◈</div>
                        <p className="hi-empty-title">{search ? 'No results found' : 'No history yet'}</p>
                        <p className="hi-empty-sub">
                            {search ? 'Try a different search term.' : 'Generate your first campaign from the Dashboard.'}
                        </p>
                    </div>
                ) : (
                    filtered.map((item, i) => (
                        <HistoryItem key={item._id} item={item} index={i} />
                    ))
                )}
            </div>
        </div>
    );
};

export default History;