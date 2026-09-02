import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';
import MarketplacePage from './pages/MarketplacePage';
import EvidenceDetailPage from './pages/EvidenceDetailPage';
import PurchasesPage from './pages/PurchasesPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/evidence/:id" element={<EvidenceDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
