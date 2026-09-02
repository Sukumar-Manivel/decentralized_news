import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EvidenceCard from '../components/EvidenceCard';
import { Search, Filter, ShieldCheck, Flame, SlidersHorizontal, RefreshCw } from 'lucide-react';
import './MarketplacePage.css';

const MarketplacePage = () => {
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [minTrustScore, setMinTrustScore] = useState(0);
  const [sortBy, setSortBy] = useState('newest');

  const fetchEvidence = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (mediaType) params.mediaType = mediaType;
      if (minTrustScore > 0) params.minTrustScore = minTrustScore;
      if (sortBy === 'trust') params.sort = 'trust';
      if (sortBy === 'price_asc') params.sort = 'price_asc';
      if (sortBy === 'price_desc') params.sort = 'price_desc';

      const response = await api.get('/evidence', { params });
      setEvidenceList(response.data.evidence || []);
    } catch (err) {
      console.error('Failed to load marketplace evidence:', err);
      setError('Could not load evidence listings. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [mediaType, minTrustScore, sortBy]);

  // Client-side text search filter
  const filteredList = evidenceList.filter((item) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="marketplace-container">
      {/* Hero / Header Bar */}
      <div className="marketplace-header">
        <div className="header-text">
          <h1>📡 Live Evidence Marketplace</h1>
          <p>Browse AI-verified, legally licensable breaking news footage directly from citizens and on-ground cameras.</p>
        </div>

        {/* Search Input */}
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search breaking incidents (e.g. fire, highway accident, collapse)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>
      </div>

      {/* Control Bar: Filters & Sorting */}
      <div className="control-bar">
        <div className="filter-group">
          <span className="filter-label">Media:</span>
          {['', 'photo', 'video'].map((type) => (
            <button
              key={type}
              className={`filter-pill ${mediaType === type ? 'active' : ''}`}
              onClick={() => setMediaType(type)}
            >
              {type === '' ? 'All Media' : type === 'photo' ? '📷 Photos' : '🎥 Videos'}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <span className="filter-label">Trust Score:</span>
          {[
            { val: 0, label: 'All Scores' },
            { val: 70, label: '🟢 70%+' },
            { val: 85, label: '🛡️ 85%+ Verified' }
          ].map((t) => (
            <button
              key={t.val}
              className={`filter-pill ${minTrustScore === t.val ? 'active' : ''}`}
              onClick={() => setMinTrustScore(t.val)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="sort-wrapper">
          <SlidersHorizontal size={14} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Sort: Newest First</option>
            <option value="trust">Sort: Highest Trust Score</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Results Count / Refresh */}
      <div className="results-summary">
        <span>Showing <strong>{filteredList.length}</strong> verified evidence listings</span>
        <button className="refresh-icon-btn" onClick={fetchEvidence} title="Refresh listings">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="loading-state">
          <RefreshCw className="spin" size={32} />
          <p>Loading verified evidence from decentralized sources...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchEvidence}>Try Again</button>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="empty-state">
          <ShieldCheck size={48} className="empty-icon" />
          <h3>No matching evidence found</h3>
          <p>Try adjusting your search query or relaxing your trust score filters.</p>
        </div>
      ) : (
        <div className="evidence-grid">
          {filteredList.map((item) => (
            <EvidenceCard key={item._id} evidence={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
