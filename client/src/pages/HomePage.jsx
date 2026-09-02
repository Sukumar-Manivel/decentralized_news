import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, CreditCard, Eye, ArrowRight } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">CitizenLens</h1>
          <p className="hero-subtitle">Secure Evidence Marketplace</p>
          <p className="hero-description">
            Upload incident evidence. News channels buy verified footage. You earn money.
          </p>
          
          <div className="hero-actions">
            {!user ? (
              <>
                <button onClick={() => navigate('/register')} className="btn-primary">
                  Get Started <ArrowRight size={18} />
                </button>
                <button onClick={() => navigate('/login')} className="btn-secondary">
                  Login
                </button>
              </>
            ) : user.role === 'citizen' ? (
              <>
                <button onClick={() => navigate('/upload')} className="btn-primary">
                  Upload Evidence
                </button>
                <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                  My Dashboard
                </button>
              </>
            ) : (
              <button onClick={() => navigate('/marketplace')} className="btn-primary">
                Browse Marketplace
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Shield size={32} className="feature-icon" />
            </div>
            <h3>Secure Preview</h3>
            <p>Content is watermarked for previews, preventing unauthorized screenshots and theft.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <CreditCard size={32} className="feature-icon" />
            </div>
            <h3>Instant Payment</h3>
            <p>Powered by Razorpay escrow. Get paid instantly when a journalist buys your content.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Eye size={32} className="feature-icon" />
            </div>
            <h3>Invisible Watermark</h3>
            <p>Track leaked content with unique invisible watermarks embedded in the final download.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
