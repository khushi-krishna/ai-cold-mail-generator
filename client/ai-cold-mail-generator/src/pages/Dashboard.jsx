import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { ClipboardDocumentIcon, CheckIcon, CloudArrowUpIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import './Dashboard.css';

const OUTPUT_TYPES = [
    // { key: 'coldEmail',      label: 'Cold Email' },
    // { key: 'linkedInDM',     label: 'LinkedIn DM' },
    { key: 'tailoredResume', label: 'Tailor Resume' },  // ✅ replaced resumeTips
];

const Dashboard = () => {
    // ── mode: 'prompt' | 'resume'
    const [mode, setMode] = useState('Resume');

    // ── prompt mode
    const [prompt, setPrompt] = useState('');

    // ── resume mode
    const [resume,     setResume]     = useState(null);
    const [jobDesc,    setJobDesc]    = useState('');
    const [outputType, setOutputType] = useState('coldEmail');
    const [dragging,   setDragging]   = useState(false);

    // ── shared
    const [loading,   setLoading]   = useState(false);
    const [result,    setResult]    = useState(null);
    const [copied,    setCopied]    = useState('');
    const [activeTab, setActiveTab] = useState('subject');

    // ── prompt generate
    const handlePromptGenerate = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const { data } = await api.post('api/ai/generate-email', { prompt });
            if (data?.data) {
                setResult({ type: 'prompt', ...data.data });
                setActiveTab('subject');
                toast.success('Generated!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate.');
        } finally {
            setLoading(false);
        }
    };

    // ── resume generate
    const handleResumeGenerate = async () => {
        if (!resume)          return toast.error('Please upload your resume.');
        if (!jobDesc.trim())  return toast.error('Please paste the job description.');
        setLoading(true);
        setResult(null);
        try {
            const formData = new FormData();
            formData.append('resume', resume);
            formData.append('jobDescription', jobDesc);
            formData.append('outputType', outputType);
            const { data } = await api.post('api/ai/generate-resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResult({ type: 'resume', outputType: data.outputType, subject: data.subject, output: data.output });
            toast.success('Generated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate.');
        } finally {
            setLoading(false);
        }
    };

    // ── file handling
    const handleFile = (file) => {
        if (!file) return;
        const allowed = ['application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowed.includes(file.type)) return toast.error('Only PDF or DOCX supported.');
        setResume(file);
        setResult(null);
    };

    // ── copy
    const copyToClipboard = (text, key) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(key);
        toast.success('Copied!');
        setTimeout(() => setCopied(''), 2000);
    };

    // ── tabs for prompt result
    const promptTabs = result?.type === 'prompt' ? [
        { key: 'subject',  label: 'Subject Line', emoji: '✦', content: result.subject },
        { key: 'email',    label: 'Cold Email',   emoji: '✉', content: result.emailBody },
        { key: 'linkedin', label: 'LinkedIn DM',  emoji: '◈', content: result.linkedInDM },
        { key: 'followup', label: 'Follow-up',    emoji: '↺', content: result.followUpEmail },
    ] : [];

    const activeContent = result?.type === 'prompt'
        ? promptTabs.find(t => t.key === activeTab)?.content || ''
        : result?.output || '';

    return (
        <div className="dash-root">
            <div className="dash-grid">
                {/* Header */}
                <div className="dash-header">
                    
    <span className="dash-logo">Outreach.ai</span>
    <a href="/" className="dash-back-btn">← Home</a>  {/* ✅ */}

                    {/* Mode switcher */}
                    <div className="dash-mode-switch">
                         <button
                            className={`dash-mode-btn ${mode === 'resume' ? 'active' : ''}`}
                            onClick={() => { setMode('resume'); setResult(null); }}>
                            ◈ Resume
                        </button>
                        <button
                            className={`dash-mode-btn ${mode === 'prompt' ? 'active' : ''}`}
                            onClick={() => { setMode('prompt'); setResult(null); }}>
                            ✦ Prompt
                        </button>
                     
                    </div>
                </div>

                {/* Left Panel */}
                <div className="panel-left">
                    {mode === 'prompt' ? (
                        <>
                            <h2 className="panel-title">Craft your<br /><span>perfect job pitch.</span></h2>
                            <div className="divider" />
                            <form onSubmit={handlePromptGenerate} className="flex flex-col gap-3 flex-1">
                                <div className="flex-1 flex flex-col">
                                    <span className="prompt-label">Your Prompt</span>
                                    <textarea
                                        className="prompt-textarea"
                                        value={prompt}
                                        onChange={e => setPrompt(e.target.value)}
                                        placeholder="e.g. Cold email to a Recruiter at Google for SDE-2..."
                                    />
                                </div>
                                <button type="submit" className="generate-btn" disabled={loading || !prompt.trim()}>
                                    {loading ? <><div className="spinner" /> Generating...</> : <>✦ Generate</>}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h2 className="panel-title">Resume<br /><span>outreach.</span></h2>
                            <div className="divider" />

                            {/* Output type */}
                            <div>
                                <span className="prompt-label">Generate</span>
                                <div className="dash-type-grid">
                                    {OUTPUT_TYPES.map(t => (
                                        <button key={t.key}
                                            className={`dash-type-btn ${outputType === t.key ? 'active' : ''}`}
                                            onClick={() => setOutputType(t.key)}>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Resume upload */}
                           {/* Resume upload */}
<div>
    <span className="prompt-label">Resume (PDF / DOCX)</span>
    <div
        className={`dash-dropzone ${dragging ? 'dragging' : ''} ${resume ? 'has-file' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => !resume && document.getElementById('dash-file').click()}>  {/* ✅ only open picker if no file */}
        <input id="dash-file" type="file" accept=".pdf,.docx"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])} />
        {resume ? (
            <>
                <DocumentTextIcon className="dash-drop-icon active" />
                <span className="dash-drop-text">{resume.name}</span>
                <button
                    className="dash-remove-file"
                    onClick={e => { e.stopPropagation(); setResume(null); setResult(null); }}>
                    ✕
                </button>
            </>
        ) : (
            <>
                <CloudArrowUpIcon className="dash-drop-icon" />
                <span className="dash-drop-text">Drop or click to upload</span>
            </>
        )}
    </div>
</div>

                            {/* Job description */}
                            <div className="flex-1 flex flex-col">
                                <span className="prompt-label">Job Description</span>
                                <textarea
                                    className="prompt-textarea"
                                    value={jobDesc}
                                    onChange={e => setJobDesc(e.target.value)}
                                    placeholder="Paste the full job description here..."
                                    style={{ minHeight: 120 }}
                                />
                            </div>

                            <button className="generate-btn" onClick={handleResumeGenerate}
                                disabled={loading || !resume || !jobDesc.trim()}>
                                {loading ? <><div className="spinner" /> Generating...</> : <>◈ Generate</>}
                            </button>
                        </>
                    )}
                </div>

                {/* Right Panel */}
                <div className="panel-right">
                    {result ? (
                        <>
                            {result.type === 'prompt' && (
                                <div className="tabs-bar">
                                    {promptTabs.map(tab => (
                                        <button key={tab.key}
                                            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                                            onClick={() => setActiveTab(tab.key)}>
                                            <span className="tab-emoji">{tab.emoji}</span>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="content-area">
                                {result.type === 'resume' && result.subject && (
                                    <div>
                                        <span className="result-tag">Subject</span>
                                        <p style={{ color: '#e8e4dc', fontWeight: 700, marginTop: '0.5rem' }}>{result.subject}</p>
                                    </div>
                                )}
                                <div className="result-header">
                                    <span className="result-tag">
                                        {result.type === 'prompt'
                                            ? promptTabs.find(t => t.key === activeTab)?.label
                                            : OUTPUT_TYPES.find(t => t.key === result.outputType)?.label}
                                    </span>
                                    <button className={`copy-btn ${copied === 'main' ? 'copied' : ''}`}
                                        onClick={() => copyToClipboard(activeContent, 'main')}>
                                        {copied === 'main'
                                            ? <><CheckIcon className="w-3 h-3" /> Copied</>
                                            : <><ClipboardDocumentIcon className="w-3 h-3" /> Copy</>}
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
                                {mode === 'prompt'
                                    ? 'Describe your prompt and hit Generate.'
                                    : 'Upload your resume and paste a job description.'}
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