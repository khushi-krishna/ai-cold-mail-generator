import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { CloudArrowUpIcon, DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';
import './ResumeGenerator.css';
const OUTPUT_TYPES = [
  { key: 'coldEmail',   label: 'Cold Email',    desc: 'Tailored email to the recruiter' },
  { key: 'linkedInDM',  label: 'LinkedIn DM',   desc: 'Short message for LinkedIn outreach' },
  { key: 'resumeTips',  label: 'Resume Tips',   desc: 'ATS & recruiter improvement tips' },
];

const ResumeGenerator = () => {
  const [resume,      setResume]      = useState(null);
  const [jobDesc,     setJobDesc]     = useState('');
  const [outputType,  setOutputType]  = useState('coldEmail');
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState(null);
  const [dragging,    setDragging]    = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ['application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF or DOCX files are supported.');
      return;
    }
    setResume(file);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!resume)    return toast.error('Please upload your resume.');
    if (!jobDesc.trim()) return toast.error('Please paste the job description.');

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', resume);
      formData.append('jobDescription', jobDesc);
      formData.append('outputType', outputType);

      const { data } = await api.post('/ai/generate-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(data);
      toast.success('Generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(result.output);
    toast.success('Copied!');
  };

  return (
    <div className="rg-root">
      <div className="rg-header">
        <span className="rg-eyebrow">AI-powered</span>
        <h1 className="rg-title">Resume Outreach</h1>
      </div>

      <div className="rg-body">
        {/* Left — inputs */}
        <div className="rg-left">

          {/* Output type selector */}
          <div className="rg-section">
            <label className="rg-label">What to generate</label>
            <div className="rg-type-grid">
              {OUTPUT_TYPES.map(t => (
                <button
                  key={t.key}
                  className={`rg-type-card ${outputType === t.key ? 'active' : ''}`}
                  onClick={() => setOutputType(t.key)}>
                  <span className="rg-type-label">{t.label}</span>
                  <span className="rg-type-desc">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Resume upload */}
          <div className="rg-section">
            <label className="rg-label">Your resume</label>
            <div
              className={`rg-dropzone ${dragging ? 'dragging' : ''} ${resume ? 'has-file' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('rg-file-input').click()}>
              <input
                id="rg-file-input"
                type="file"
                accept=".pdf,.docx"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])}
              />
              {resume ? (
                <>
                  <DocumentTextIcon className="rg-drop-icon active" />
                  <span className="rg-drop-text">{resume.name}</span>
                  <span className="rg-drop-sub">Click to replace</span>
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="rg-drop-icon" />
                  <span className="rg-drop-text">Drop your resume here</span>
                  <span className="rg-drop-sub">PDF or DOCX · Click to browse</span>
                </>
              )}
            </div>
          </div>

          {/* Job description */}
          <div className="rg-section">
            <label className="rg-label">Job description</label>
            <textarea
              className="rg-textarea"
              placeholder="Paste the full job description here..."
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              rows={7}
            />
          </div>

          <button className="rg-submit" onClick={handleSubmit} disabled={loading}>
            <SparklesIcon style={{ width: 15, height: 15 }} />
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {/* Right — output */}
        <div className="rg-right">
          {loading ? (
            <div className="rg-output-empty">
              <div className="rg-spinner" />
              <p>Analyzing resume & job...</p>
            </div>
          ) : result ? (
            <div className="rg-output">
              {result.subject && (
                <div className="rg-output-subject">
                  <span className="rg-output-tag">Subject</span>
                  <p className="rg-output-subject-text">{result.subject}</p>
                </div>
              )}
              <div className="rg-output-header">
                <span className="rg-output-tag">
                  {OUTPUT_TYPES.find(t => t.key === result.outputType)?.label}
                </span>
                <button className="rg-copy-btn" onClick={copyOutput}>Copy</button>
              </div>
              <div className="rg-output-text">{result.output}</div>
            </div>
          ) : (
            <div className="rg-output-empty">
              <div className="rg-output-empty-icon">◈</div>
              <p className="rg-output-empty-title">Output will appear here</p>
              <p className="rg-output-empty-sub">Upload your resume and paste a job description to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeGenerator;