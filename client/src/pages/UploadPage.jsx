import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  UploadCloud, FileVideo, FileImage, ShieldCheck, 
  CheckCircle, AlertCircle, Sparkles, ArrowRight, RefreshCw, Smartphone, Camera, Car, Bell
} from 'lucide-react';
import './UploadPage.css';

const UploadPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [mediaType, setMediaType] = useState('photo');
  const [sourceType, setSourceType] = useState('phone');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(15000);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  // File selection handler
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    processFile(selected);
  };

  const processFile = (selected) => {
    setError('');
    const isVideo = selected.type.startsWith('video/');
    const isPhoto = selected.type.startsWith('image/');

    if (!isVideo && !isPhoto) {
      setError('Please upload an image (JPG, PNG) or video (MP4, WebM) file.');
      return;
    }

    setFile(selected);
    setMediaType(isVideo ? 'video' : 'photo');
    setPreviewUrl(URL.createObjectURL(selected));
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a media file to upload.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a descriptive title for this evidence.');
      return;
    }

    setUploading(true);
    setUploadProgress(15);
    setError('');

    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('sourceType', sourceType);

      setUploadProgress(45);

      const response = await api.post('/evidence', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 70) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      setUploadProgress(100);
      setVerificationResult(response.data.evidence);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload evidence. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl('');
    setTitle('');
    setDescription('');
    setPrice(15000);
    setVerificationResult(null);
    setError('');
  };

  return (
    <div className="upload-container">
      <div className="upload-wrapper">
        <div className="upload-header">
          <h1>📤 Upload Incident Evidence</h1>
          <p>Your footage will be analyzed by our automated AI Forensics pipeline. Verified evidence is listed on the marketplace for licensed newsroom acquisition.</p>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!verificationResult ? (
          <form className="upload-form" onSubmit={handleSubmit}>
            {/* File Drag & Drop Box */}
            <div 
              className={`dropzone ${file ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*,video/*" 
                style={{ display: 'none' }} 
              />

              {!previewUrl ? (
                <div className="dropzone-empty">
                  <div className="icon-circle">
                    <UploadCloud size={36} />
                  </div>
                  <h3>Drag & Drop photo or video here</h3>
                  <p>Supports MP4, MOV, JPG, PNG up to 100MB</p>
                  <button type="button" className="browse-btn">Browse Files</button>
                </div>
              ) : (
                <div className="dropzone-preview">
                  {mediaType === 'video' ? (
                    <video src={previewUrl} controls className="preview-media" />
                  ) : (
                    <img src={previewUrl} alt="Preview" className="preview-media" />
                  )}
                  <div className="file-info-bar">
                    <span>{file?.name} ({(file?.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    <button 
                      type="button" 
                      className="change-btn" 
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      Change Media
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Evidence Source Type Selector */}
            <div className="form-group">
              <label>Evidence Source Device</label>
              <div className="source-grid">
                {[
                  { id: 'phone', label: 'Smartphone', icon: Smartphone },
                  { id: 'cctv', label: 'CCTV Camera', icon: Camera },
                  { id: 'dashcam', label: 'Dashcam', icon: Car },
                  { id: 'doorbell', label: 'Doorbell', icon: Bell },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`source-chip ${sourceType === s.id ? 'active' : ''}`}
                      onClick={() => setSourceType(s.id)}
                    >
                      <Icon size={16} />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Description */}
            <div className="form-group">
              <label>Title *</label>
              <input 
                type="text" 
                placeholder="e.g. Explosion near Metro Station junction"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Incident Details / Context</label>
              <textarea 
                rows="3"
                placeholder="Describe what happened, approximate time, notable markers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Price Setter */}
            <div className="form-group">
              <label>License Asking Price (₹ INR) *</label>
              <div className="price-input-wrapper">
                <span className="currency-symbol">₹</span>
                <input 
                  type="number" 
                  min="100" 
                  step="500" 
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                />
              </div>
              <div className="quick-prices">
                {[5000, 15000, 30000, 50000].map((p) => (
                  <button 
                    key={p} 
                    type="button" 
                    className={`price-tag ${price === p ? 'selected' : ''}`}
                    onClick={() => setPrice(p)}
                  >
                    ₹{p.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              <span className="helper-text">You receive 80% upon newsroom license purchase. Platform fee is 20%.</span>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="upload-submit-btn" 
              disabled={uploading || !file}
            >
              {uploading ? (
                <>
                  <RefreshCw className="spin" size={20} />
                  <span>Processing Forensics & Uploading ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  <span>Submit for Forensic Verification</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Automated Verification Agent Result Screen */
          <div className="verification-card">
            <div className="verification-badge-header">
              <div className="score-circle">
                <span className="score-number">{verificationResult.trustScore}</span>
                <span className="score-max">/100</span>
              </div>
              <div>
                <h2>{verificationResult.verificationStatus === 'verified' ? '✅ Verified Authentic' : '⚠️ Flagged for Review'}</h2>
                <p className="status-sub">Processed by CitizenLens Automated Forensics Agent</p>
              </div>
            </div>

            <div className="forensic-details-grid">
              <div className="metric-box">
                <span className="metric-label">SHA-256 Digital Fingerprint</span>
                <span className="metric-value font-mono">
                  {verificationResult.verificationDetails?.hashSHA256?.substring(0, 24)}...
                </span>
              </div>

              <div className="metric-box">
                <span className="metric-label">Error Level Analysis (ELA)</span>
                <span className="metric-value">
                  {verificationResult.verificationDetails?.isEdited ? '❌ Anomalies Detected' : '✅ Clean Uniform Compression'}
                </span>
              </div>

              <div className="metric-box">
                <span className="metric-label">AI Generation Check</span>
                <span className="metric-value">
                  {verificationResult.verificationDetails?.isAiGenerated ? '❌ Synthetic Generated' : '✅ Genuine Camera Sensor Noise'}
                </span>
              </div>

              <div className="metric-box">
                <span className="metric-label">EXIF Device Metadata</span>
                <span className="metric-value">
                  {verificationResult.verificationDetails?.exifPresent ? (
                    `📱 ${verificationResult.verificationDetails.exifData?.make || 'Device'} ${verificationResult.verificationDetails.exifData?.model || ''}`
                  ) : (
                    'ℹ️ Clean/Stripped (Typical CCTV/Web)'
                  )}
                </span>
              </div>
            </div>

            <div className="reward-banner">
              <Sparkles size={22} className="sparkle-icon" />
              <div>
                <strong>+10 Reputation Credits Earned!</strong>
                <p>Your content has been added to the Live Marketplace feed for newsroom purchase.</p>
              </div>
            </div>

            <div className="action-buttons">
              <button className="primary-btn" onClick={() => navigate('/marketplace')}>
                <span>View in Marketplace</span>
                <ArrowRight size={18} />
              </button>
              <button className="secondary-btn" onClick={resetForm}>
                Upload Another Evidence
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
