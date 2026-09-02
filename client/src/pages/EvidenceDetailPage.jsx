import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SecureMediaViewer from '../components/SecureMediaViewer';
import PaymentModal from '../components/PaymentModal';
import { 
  ShieldCheck, ArrowLeft, Copy, Check, Lock, Award, 
  MapPin, Clock, Calendar, Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';
import './EvidenceDetailPage.css';

const EvidenceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/evidence/${id}`);
        setEvidence(response.data.evidence);
      } catch (err) {
        console.error('Failed to load evidence details:', err);
        setError('Evidence not found or has been removed.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const copyHashToClipboard = () => {
    if (evidence?.verificationDetails?.hashSHA256) {
      navigator.clipboard.writeText(evidence.verificationDetails.hashSHA256);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <RefreshCw className="spin" size={36} />
        <p>Retrieving cryptographic record & forensic ledger...</p>
      </div>
    );
  }

  if (error || !evidence) {
    return (
      <div className="detail-error">
        <AlertCircle size={44} color="#e94560" />
        <h2>{error || 'Evidence Not Found'}</h2>
        <button onClick={() => navigate('/marketplace')} className="back-btn">
          <ArrowLeft size={16} />
          <span>Back to Marketplace</span>
        </button>
      </div>
    );
  }

  // Preview source URL from server
  const previewSrc = `http://localhost:5000/uploads/previews/${evidence.previewFile || evidence.originalFile}`;

  return (
    <div className="detail-container">
      {/* Navigation Topbar */}
      <div className="detail-topbar">
        <button onClick={() => navigate('/marketplace')} className="back-btn">
          <ArrowLeft size={18} />
          <span>Back to Marketplace</span>
        </button>
        <span className="incident-id">Record ID: #{evidence._id.substring(evidence._id.length - 8).toUpperCase()}</span>
      </div>

      <div className="detail-layout">
        {/* Left Column: Protected Preview Viewer */}
        <div className="viewer-column">
          <SecureMediaViewer 
            src={previewSrc}
            mediaType={evidence.mediaType}
            title={evidence.title}
          />

          <div className="protection-banner">
            <Lock size={16} />
            <span>Anti-Theft Active: Previews are watermarked and screen-recording protected. High-resolution raw media is unlocked upon license acquisition.</span>
          </div>

          <div className="evidence-text-card">
            <h1>{evidence.title}</h1>
            <div className="meta-row">
              <span className="meta-tag">
                <Calendar size={14} />
                {new Date(evidence.createdAt).toLocaleString()}
              </span>
              <span className="meta-tag">
                <Clock size={14} />
                Status: <strong>{evidence.freshnessTag?.toUpperCase()}</strong>
              </span>
            </div>

            <p className="description-text">
              {evidence.description || 'No additional eyewitness description provided.'}
            </p>
          </div>
        </div>

        {/* Right Column: Forensic Breakdown & Purchase Actions */}
        <div className="sidebar-column">
          {/* Purchase Action Box */}
          <div className="purchase-card">
            <div className="price-header">
              <span className="label">Official Broadcast License</span>
              <div className="amount">₹{evidence.price?.toLocaleString('en-IN')}</div>
            </div>

            <button 
              className="buy-license-btn"
              onClick={() => setShowPaymentModal(true)}
            >
              <Lock size={18} />
              <span>Purchase License & Unlock Media</span>
            </button>

            <div className="guarantees-list">
              <div className="g-item">
                <Check size={14} className="g-icon" />
                <span>Immediate access to original high-res uncut master</span>
              </div>
              <div className="g-item">
                <Check size={14} className="g-icon" />
                <span>Invisible steganographic watermark embedded with your buyer identity</span>
              </div>
              <div className="g-item">
                <Check size={14} className="g-icon" />
                <span>Legally binding broadcast license certificate</span>
              </div>
            </div>
          </div>

          {/* Forensic Authenticity Card */}
          <div className="forensic-card">
            <div className="forensic-head">
              <div className="score-dial">
                <span className="score-num">{evidence.trustScore}</span>
                <span className="score-den">/100</span>
              </div>
              <div>
                <h3>Forensic Trust Score</h3>
                <span className="score-status-text">
                  {evidence.trustScore >= 80 ? '🟢 High Confidence Authentic' : '🟡 Medium Confidence'}
                </span>
              </div>
            </div>

            <div className="forensic-rows">
              {/* SHA-256 */}
              <div className="f-row">
                <span className="f-label">SHA-256 Digital Fingerprint</span>
                <div className="hash-display">
                  <code>{evidence.verificationDetails?.hashSHA256 || 'Calculated'}</code>
                  <button onClick={copyHashToClipboard} className="copy-icon-btn" title="Copy SHA-256">
                    {copiedHash ? <Check size={14} color="#00c853" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* ELA */}
              <div className="f-row">
                <span className="f-label">Error Level Analysis (ELA)</span>
                <span className="f-val">
                  {evidence.verificationDetails?.isEdited ? '⚠️ Manipulation Detected' : '✅ Clean Uniform Compression'}
                </span>
              </div>

              {/* AI Check */}
              <div className="f-row">
                <span className="f-label">AI Generation Sensor Audit</span>
                <span className="f-val">
                  {evidence.verificationDetails?.isAiGenerated ? '❌ Synthetic / AI Generated' : '✅ Authentic Optical Lens Sensor'}
                </span>
              </div>

              {/* EXIF Details */}
              <div className="f-row">
                <span className="f-label">Hardware EXIF Footprint</span>
                <span className="f-val">
                  {evidence.verificationDetails?.exifPresent ? (
                    `📱 ${evidence.verificationDetails.exifData?.make || ''} ${evidence.verificationDetails.exifData?.model || 'Camera'}`
                  ) : (
                    'ℹ️ Clean/Stripped (Dashcam/CCTV/Web)'
                  )}
                </span>
              </div>

              {evidence.verificationDetails?.exifData?.gps && (
                <div className="f-row">
                  <span className="f-label">GPS Coordinates</span>
                  <span className="f-val font-mono">
                    <MapPin size={12} />
                    {evidence.verificationDetails.exifData.gps.latitude.toFixed(4)}°, {evidence.verificationDetails.exifData.gps.longitude.toFixed(4)}°
                  </span>
                </div>
              )}
            </div>

            {/* Reporter Reputation */}
            <div className="uploader-box">
              <Award size={18} className="award-icon" />
              <div>
                <span className="uploader-name">{evidence.uploaderId?.displayName || 'Citizen Reporter'}</span>
                <span className="uploader-cred">Reputation: Level {evidence.uploaderId?.reporterLevel || 1} • {evidence.uploaderId?.creditPoints || 0} Credits</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal 
          evidence={evidence}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(purchase) => {
            console.log('Purchase successful:', purchase);
          }}
        />
      )}
    </div>
  );
};

export default EvidenceDetailPage;
