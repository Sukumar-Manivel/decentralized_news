import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ShieldCheck, Lock, CheckCircle, RefreshCw, X, FileText, ArrowRight } from 'lucide-react';
import './PaymentModal.css';

const PaymentModal = ({ evidence, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [completedPurchase, setCompletedPurchase] = useState(null);
  const [error, setError] = useState('');

  const amount = evidence.price || 0;
  const platformFee = Math.round(amount * 0.20);
  const citizenPayout = amount - platformFee;

  const handleCheckout = async () => {
    setProcessing(true);
    setError('');

    try {
      // Simulate Razorpay payment confirmation
      const paymentId = `PAY-RZP-${Date.now()}`;
      
      const response = await api.post('/payment/checkout', {
        evidenceId: evidence._id,
        paymentId
      });

      setCompletedPurchase(response.data.purchase);
      if (onSuccess) onSuccess(response.data.purchase);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {!completedPurchase ? (
          <div>
            <div className="modal-header">
              <div className="modal-icon">
                <Lock size={26} />
              </div>
              <h2>Acquire Broadcast License</h2>
              <p>Legally binding newsroom acquisition with automated escrow protection.</p>
            </div>

            {error && <div className="modal-error">{error}</div>}

            <div className="order-summary-box">
              <div className="summary-item">
                <span className="s-label">Evidence Title</span>
                <span className="s-val font-semibold">{evidence.title}</span>
              </div>
              <div className="summary-item">
                <span className="s-label">Trust Score</span>
                <span className="s-val text-green">{evidence.trustScore}% Verified</span>
              </div>
              <div className="summary-item border-top">
                <span className="s-label">Citizen Payout (80%)</span>
                <span className="s-val">₹{citizenPayout.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-item">
                <span className="s-label">Platform & Forensics Fee (20%)</span>
                <span className="s-val">₹{platformFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-item total-row">
                <span className="s-label">Total Amount</span>
                <span className="s-total">₹{amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="security-notice">
              <ShieldCheck size={18} className="text-green" />
              <span>
                <strong>Steganographic Protection:</strong> The delivered master file will be embedded with an invisible watermark encoding your buyer identity to trace unauthorized leaks.
              </span>
            </div>

            <button 
              className="confirm-pay-btn" 
              onClick={handleCheckout}
              disabled={processing}
            >
              {processing ? (
                <>
                  <RefreshCw className="spin" size={18} />
                  <span>Processing Escrow & Embedding Watermark...</span>
                </>
              ) : (
                <span>Confirm & Pay ₹{amount.toLocaleString('en-IN')} (Razorpay)</span>
              )}
            </button>
          </div>
        ) : (
          /* Payment Completed Success Screen */
          <div className="success-content">
            <div className="success-icon-wrap">
              <CheckCircle size={56} className="text-green" />
            </div>
            <h2>Broadcast License Issued!</h2>
            <p>Payment cleared through Escrow. 80% credited to citizen uploader.</p>

            <div className="license-info-card">
              <div className="l-row">
                <span>License Key</span>
                <code>{completedPurchase.watermarkId}</code>
              </div>
              <div className="l-row">
                <span>Invisible Watermark</span>
                <span className="text-green">Embedded & Sealed</span>
              </div>
              <div className="l-row">
                <span>Transaction ID</span>
                <code>{completedPurchase.razorpayPaymentId}</code>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="view-purchases-btn"
                onClick={() => {
                  onClose();
                  navigate('/purchases');
                }}
              >
                <span>Go to My Purchases & Download</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
