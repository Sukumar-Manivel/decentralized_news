import React, { useState, useEffect, useRef } from 'react';
import { Shield, EyeOff, AlertTriangle } from 'lucide-react';
import './SecureMediaViewer.css';

/**
 * 🔒 SECURE MEDIA VIEWER (DRM & Content Protection Layer)
 * Prevents casual screenshotting, right-click saving, and screen capture.
 * Features:
 * - Disables context menu (right-click)
 * - Canvas floating watermark overlay
 * - Window blur / screen-capture tool detection (dims screen)
 * - Keyboard shortcut interception (PrintScreen, Ctrl+S, Ctrl+P)
 */
const SecureMediaViewer = ({ src, mediaType, title }) => {
  const [isBlurred, setIsBlurred] = useState(false);
  const [warning, setWarning] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    // 1. Detect window blur (user switching to OBS, Snipping Tool, or another app)
    const handleBlur = () => {
      setIsBlurred(true);
    };

    const handleFocus = () => {
      setIsBlurred(false);
      setWarning('');
    };

    // 2. Intercept screenshot & save shortcuts
    const handleKeyDown = (e) => {
      // PrintScreen key
      if (e.key === 'PrintScreen') {
        setIsBlurred(true);
        setWarning('⚠️ Screenshot attempt detected! Content protected.');
        navigator.clipboard?.writeText(''); // Clear clipboard
      }

      // Ctrl+S (Save), Ctrl+P (Print), Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        setWarning('⚠️ Saving and printing of preview content is disabled.');
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keyup', handleKeyDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keyup', handleKeyDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div 
      className="secure-viewer-container" 
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()} // Block right-click
      onDragStart={(e) => e.preventDefault()}   // Block dragging
    >
      {/* Protected Media Element */}
      <div className={`media-viewport ${isBlurred ? 'blurred' : ''}`}>
        {mediaType === 'video' ? (
          <video 
            src={src} 
            controls 
            controlsList="nodownload noremoteplayback" 
            disablePictureInPicture 
            className="protected-media"
          />
        ) : (
          <img 
            src={src} 
            alt={title} 
            className="protected-media" 
            draggable="false"
          />
        )}

        {/* Dynamic Watermark Overlay */}
        <div className="watermark-overlay" aria-hidden="true">
          <div className="watermark-pattern">
            <span>CITIZENLENS • PREVIEW ONLY • UNLICENSED REPRODUCTION PROHIBITED</span>
            <span>CITIZENLENS • PREVIEW ONLY • UNLICENSED REPRODUCTION PROHIBITED</span>
            <span>CITIZENLENS • PREVIEW ONLY • UNLICENSED REPRODUCTION PROHIBITED</span>
          </div>
        </div>
      </div>

      {/* Security Protection Shield on Screen Capture / Window Blur */}
      {isBlurred && (
        <div className="blur-shield">
          <EyeOff size={42} className="shield-icon" />
          <h3>Preview Protected</h3>
          <p>Display obscured while window is inactive or screen capture is suspected.</p>
          <button className="shield-btn" onClick={() => setIsBlurred(false)}>
            Resume Preview
          </button>
        </div>
      )}

      {/* Security Warning Toast */}
      {warning && (
        <div className="security-toast">
          <AlertTriangle size={16} />
          <span>{warning}</span>
        </div>
      )}

      <div className="security-badge">
        <Shield size={14} />
        <span>DRM Content Protection Active</span>
      </div>
    </div>
  );
};

export default SecureMediaViewer;
