import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';
import logoImg from '../assets/logo.png';

const LoadingScreen = ({ onLoadingComplete, isInitializing }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isInitializing) {
      setFadeOut(true);
      const timer = setTimeout(() => {
        if (onLoadingComplete) onLoadingComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isInitializing, onLoadingComplete]);

  return (
    <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
      {/* Full-screen black shadow sweep — NOT inside logo wrapper */}
      <div className="shadow-sweep"></div>
      <div className="loading-content">
        <div className="logo-wrapper">
          <img src={logoImg} alt="Vortex-Gen" className="loading-logo" />
        </div>
        <div className="loading-text">INITIALIZING VORTEX-GEN...</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
