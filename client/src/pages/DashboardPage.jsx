import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Wallet, TrendingUp, Award, Zap, ArrowUpRight, 
  Clock, ShieldCheck, CheckCircle, RefreshCw, Trophy, 
  FileText, ArrowRight, UserCheck
} from 'lucide-react';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wallet, setWallet] = useState({ balance: 0, totalEarnings: 0, totalUploads: 0 });
  const [credits, setCredits] = useState({ points: 0, level: 1, title: 'Rookie Reporter', visibilityBoostMinutes: 0 });
  const [myUploads, setMyUploads] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' | 'leaderboard'

  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [walletRes, creditsRes, uploadsRes, leaderRes] = await Promise.all([
        api.get('/user/wallet'),
        api.get('/user/credits'),
        api.get('/evidence/my'),
        api.get('/user/leaderboard')
      ]);

      setWallet(walletRes.data.wallet);
      setCredits(creditsRes.data.credits);
      setMyUploads(uploadsRes.data.evidence || []);
      setLeaderboard(leaderRes.data.leaderboard || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleWithdraw = async () => {
    if (wallet.balance <= 0) {
      alert('You have no balance available to withdraw.');
      return;
    }

    setWithdrawing(true);
    setWithdrawMsg('');

    try {
      const res = await api.post('/user/withdraw');
      setWithdrawMsg(res.data.message);
      setWallet((prev) => ({ ...prev, balance: 0 }));
      setTimeout(() => setWithdrawMsg(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Withdrawal failed.');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header Profile Summary */}
      <div className="dashboard-header">
        <div>
          <div className="user-badge-row">
            <h1>{user?.displayName || 'Citizen'}</h1>
            <span className="level-chip">
              <Award size={14} />
              <span>Level {credits.level} • {credits.title}</span>
            </span>
          </div>
          <p>Real-time earnings, reputation ledger, and marketplace queue prioritization.</p>
        </div>

        <button className="new-upload-btn" onClick={() => navigate('/upload')}>
          <span>+ Upload Evidence</span>
        </button>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="metrics-grid">
        {/* Wallet Balance Card */}
        <div className="metric-card wallet-card">
          <div className="card-top">
            <span className="card-title">Available Wallet Balance</span>
            <div className="icon-wrap wallet-icon">
              <Wallet size={20} />
            </div>
          </div>
          <div className="card-value">₹{wallet.balance.toLocaleString('en-IN')}</div>
          <p className="card-sub">80% direct escrow cut from licensed media sales</p>
          
          <button 
            className="withdraw-btn" 
            onClick={handleWithdraw}
            disabled={withdrawing || wallet.balance <= 0}
          >
            {withdrawing ? 'Processing IMPS...' : 'Withdraw to Bank Account'}
            <ArrowUpRight size={15} />
          </button>
          
          {withdrawMsg && <div className="payout-toast">{withdrawMsg}</div>}
        </div>

        {/* Lifetime Earnings Card */}
        <div className="metric-card">
          <div className="card-top">
            <span className="card-title">Lifetime Earnings</span>
            <div className="icon-wrap earn-icon">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="card-value">₹{wallet.totalEarnings.toLocaleString('en-IN')}</div>
          <p className="card-sub">{wallet.totalUploads} verified incident footage uploads</p>
        </div>

        {/* Reputation Credits & Boost Card */}
        <div className="metric-card boost-card">
          <div className="card-top">
            <span className="card-title">Reputation Credits</span>
            <div className="icon-wrap boost-icon">
              <Zap size={20} />
            </div>
          </div>
          <div className="card-value">⭐ {credits.points} pts</div>
          <div className="boost-meter">
            <div className="boost-fill" style={{ width: `${Math.min(100, (credits.points / 100) * 100)}%` }}></div>
          </div>
          <p className="card-sub">
            ⚡ <strong>+{credits.visibilityBoostMinutes} mins</strong> Marketplace Queue Priority Boost
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="tab-control-bar">
        <button 
          className={`tab-btn ${activeTab === 'uploads' ? 'active' : ''}`}
          onClick={() => setActiveTab('uploads')}
        >
          <FileText size={16} />
          <span>My Uploaded Evidence ({myUploads.length})</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <Trophy size={16} />
          <span>Top Reporters Leaderboard</span>
        </button>
      </div>

      {/* Tab 1: My Uploads */}
      {activeTab === 'uploads' && (
        <div className="uploads-section">
          {loading ? (
            <div className="loading-box">
              <RefreshCw className="spin" size={28} />
              <p>Loading your upload ledger...</p>
            </div>
          ) : myUploads.length === 0 ? (
            <div className="empty-box">
              <FileText size={44} className="empty-icon" />
              <h3>No Evidence Uploaded Yet</h3>
              <p>Upload incident photos or videos to earn money when news channels acquire licenses.</p>
              <button className="cta-btn" onClick={() => navigate('/upload')}>
                Upload Your First Evidence
              </button>
            </div>
          ) : (
            <div className="uploads-table-wrapper">
              <table className="uploads-table">
                <thead>
                  <tr>
                    <th>Evidence Title</th>
                    <th>Type</th>
                    <th>Trust Score</th>
                    <th>Price</th>
                    <th>Purchases</th>
                    <th>Freshness</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myUploads.map((item) => (
                    <tr key={item._id}>
                      <td className="font-semibold">{item.title}</td>
                      <td className="capitalize">{item.mediaType}</td>
                      <td>
                        <span className={`mini-trust ${item.trustScore >= 80 ? 'green' : 'yellow'}`}>
                          <ShieldCheck size={12} />
                          {item.trustScore}%
                        </span>
                      </td>
                      <td className="font-bold">₹{item.price?.toLocaleString('en-IN')}</td>
                      <td>{item.totalPurchases || 0} newsrooms</td>
                      <td>
                        <span className={`mini-fresh ${item.freshnessTag}`}>
                          {item.freshnessTag?.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-muted">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="view-link-btn"
                          onClick={() => navigate(`/evidence/${item._id}`)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Top Reporters Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="leaderboard-section">
          <div className="leaderboard-intro">
            <h3>🏆 CitizenLens High-Reputation Reporters</h3>
            <p>Reporters with high trust scores receive priority visibility in the newsroom broadcast feed.</p>
          </div>

          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Reporter</th>
                  <th>Rank Level</th>
                  <th>Credit Points</th>
                  <th>Verified Uploads</th>
                  <th>Total Earned</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((rep) => (
                  <tr key={rep.id} className={rep.id === user?.id ? 'my-rank-row' : ''}>
                    <td className="rank-cell">
                      {rep.rank === 1 ? '🥇 #1' : rep.rank === 2 ? '🥈 #2' : rep.rank === 3 ? '🥉 #3' : `#${rep.rank}`}
                    </td>
                    <td className="rep-name-cell">
                      <span>{rep.displayName}</span>
                      {rep.id === user?.id && <span className="you-pill">You</span>}
                    </td>
                    <td>
                      <span className="level-pill">Level {rep.level} • {rep.levelTitle}</span>
                    </td>
                    <td className="credits-cell">⭐ {rep.creditPoints} pts</td>
                    <td>{rep.totalUploads} uploads</td>
                    <td className="font-bold text-green">₹{rep.totalEarnings.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
