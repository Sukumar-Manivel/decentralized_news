import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Video, Image, Eye, Clock, Award } from 'lucide-react';
import './EvidenceCard.css';

const EvidenceCard = ({ evidence }) => {
  const navigate = useNavigate();

  const getTrustBadgeClass = (score) => {
    if (score >= 80) return 'trust-high';
    if (score >= 50) return 'trust-medium';
    return 'trust-low';
  };

  const getFreshnessBadge = (tag) => {
    switch (tag) {
      case 'breaking':
        return <span className="freshness-badge breaking">🔴 BREAKING</span>;
      case 'recent':
        return <span className="freshness-badge recent">🟡 RECENT</span>;
      default:
        return <span className="freshness-badge archival">🔵 ARCHIVAL</span>;
    }
  };

  // Base URL for uploads
  const thumbnailSrc = `http://localhost:5000/uploads/thumbnails/${evidence.thumbnailFile || evidence.originalFile}`;

  return (
    <div 
      className="evidence-card"
      onClick={() => navigate(`/evidence/${evidence._id}`)}
    >
      {/* Thumbnail Area */}
      <div className="card-media-wrapper">
        {evidence.mediaType === 'video' ? (
          <div className="video-thumb-container">
            <img 
              src={thumbnailSrc} 
              alt={evidence.title} 
              className="card-thumb"
              onError={(e) => {
                // Fallback icon placeholder if thumbnail isn't generated yet
                e.target.style.display = 'none';
              }} 
            />
            <div className="media-type-overlay">
              <Video size={16} />
              <span>Video</span>
            </div>
          </div>
        ) : (
          <div className="photo-thumb-container">
            <img 
              src={thumbnailSrc} 
              alt={evidence.title} 
              className="card-thumb" 
            />
            <div className="media-type-overlay">
              <Image size={16} />
              <span>Photo</span>
            </div>
          </div>
        )}

        {/* Freshness Badge */}
        <div className="top-badges">
          {getFreshnessBadge(evidence.freshnessTag)}
          <span className={`trust-pill ${getTrustBadgeClass(evidence.trustScore)}`}>
            <ShieldCheck size={14} />
            <span>{evidence.trustScore}% Trust</span>
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-content">
        <h3 className="card-title">{evidence.title}</h3>
        <p className="card-desc">{evidence.description || 'No additional context provided.'}</p>

        {/* Uploader Reputation */}
        <div className="uploader-info">
          <Award size={14} className="rep-icon" />
          <span>{evidence.uploaderId?.displayName || 'Citizen Reporter'}</span>
          {evidence.uploaderId?.creditPoints ? (
            <span className="rep-points">⭐ {evidence.uploaderId.creditPoints} pts</span>
          ) : null}
        </div>

        {/* Card Footer */}
        <div className="card-footer">
          <div className="card-price">
            <span className="price-label">License Price</span>
            <span className="price-val">₹{evidence.price?.toLocaleString('en-IN')}</span>
          </div>

          <div className="card-stats">
            <span className="stat-item">
              <Eye size={13} />
              <span>{evidence.totalViews || 0}</span>
            </span>
            <span className="stat-item">
              <Clock size={13} />
              <span>{new Date(evidence.createdAt).toLocaleDateString()}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceCard;
