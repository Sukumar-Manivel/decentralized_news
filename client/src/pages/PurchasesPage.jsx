import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Download, ShieldCheck, FileCheck, Key, Eye, 
  ExternalLink, Calendar, RefreshCw, AlertCircle, Sparkles
} from 'lucide-react';
import './PurchasesPage.css';

const PurchasesPage = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInspection, setSelectedInspection] = useState(null);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payment/my-purchases');
      setPurchases(response.data.purchases || []);
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
      setError('Could not load your acquired licenses. Please check your login session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleDownload = async (purchase) => {
    try {
      // Trigger authenticated download stream
      const token = localStorage.getItem('token');
      const downloadUrl = `http://localhost:5000/api/download/${purchase._id}`;

      // Open in new tab or trigger browser download with auth header
      const res = await api.get(`/download/${purchase._id}`, {
        responseType: 'blob'
      });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `licensed-master-${purchase.watermarkId}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed. Please ensure you are logged in as the license holder.');
    }
  };

  return (
    <div className="purchases-container">
      <div className="purchases-header">
        <div>
          <h1>💼 My Broadcast Licenses</h1>
          <p>Verified master files with unique steganographic buyer watermarking ready for broadcast distribution.</p>
        </div>
        <button className="refresh-btn" onClick={fetchPurchases}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="purchases-loading">
          <RefreshCw className="spin" size={32} />
          <p>Loading license vault...</p>
        </div>
      ) : error ? (
        <div className="purchases-error">
          <AlertCircle size={36} color="#e94560" />
          <p>{error}</p>
        </div>
      ) : purchases.length === 0 ? (
        <div className="purchases-empty">
          <FileCheck size={48} className="empty-icon" />
          <h3>No Acquired Licenses Yet</h3>
          <p>Explore the Live Marketplace to acquire verified breaking news evidence.</p>
          <button className="explore-btn" onClick={() => navigate('/marketplace')}>
            Browse Live Marketplace
          </button>
        </div>
      ) : (
        <div className="licenses-grid">
          {purchases.map((p) => {
            const thumbSrc = `http://localhost:5000/uploads/thumbnails/${p.evidenceId?.thumbnailFile || p.evidenceId?.originalFile}`;
            return (
              <div key={p._id} className="license-card">
                <div className="license-card-head">
                  <img src={thumbSrc} alt={p.evidenceId?.title} className="license-thumb" />
                  <div className="license-title-box">
                    <h3>{p.evidenceId?.title || 'Licensed Evidence'}</h3>
                    <span className="license-date">
                      <Calendar size={13} />
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="license-details-body">
                  <div className="detail-pill">
                    <span className="dp-label">Steganographic ID</span>
                    <code className="dp-val">{p.watermarkId}</code>
                  </div>

                  <div className="detail-pill">
                    <span className="dp-label">Price Paid</span>
                    <span className="dp-val font-bold">₹{p.amountPaid?.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="detail-pill">
                    <span className="dp-label">Citizen Payout</span>
                    <span className="dp-val text-green">₹{p.sellerPayout?.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="detail-pill">
                    <span className="dp-label">Download Count</span>
                    <span className="dp-val">{p.downloadCount || 0} times</span>
                  </div>
                </div>

                <div className="license-card-actions">
                  <button 
                    className="download-master-btn"
                    onClick={() => handleDownload(p)}
                  >
                    <Download size={16} />
                    <span>Download Master</span>
                  </button>

                  <button 
                    className="inspect-wm-btn"
                    onClick={() => setSelectedInspection(p)}
                    title="Inspect embedded steganographic watermark"
                  >
                    <Key size={15} />
                    <span>Inspect Watermark</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Steganography Inspection Modal */}
      {selectedInspection && (
        <div className="modal-backdrop" onClick={() => setSelectedInspection(null)}>
          <div className="inspection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="insp-head">
              <div className="insp-icon">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h2>Steganographic Forensic Proof</h2>
                <p>Invisible digital signature embedded inside master file</p>
              </div>
            </div>

            <div className="signature-code-block">
              <pre>
                {JSON.stringify({
                  status: 'SEALED_AND_EMBEDDED',
                  watermarkId: selectedInspection.watermarkId,
                  buyer: {
                    id: selectedInspection.buyerId,
                    name: selectedInspection.watermarkPayload?.buyerName || 'Verified Buyer',
                    email: selectedInspection.watermarkPayload?.buyerEmail
                  },
                  transaction: {
                    id: selectedInspection.razorpayPaymentId,
                    escrowStatus: 'CLEARED'
                  },
                  issuedAt: selectedInspection.watermarkPayload?.issuedAt || selectedInspection.createdAt,
                  antiPiracyNotice: 'Any unauthorized broadcast will be traced to this signature via CitizenLens Forensics.'
                }, null, 2)}
              </pre>
            </div>

            <button className="close-insp-btn" onClick={() => setSelectedInspection(null)}>
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;
