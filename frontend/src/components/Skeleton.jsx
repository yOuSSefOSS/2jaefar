import React from 'react';
import '../styles/skeleton.css';

// ── Base shimmer block ────────────────────────────────────────────────────────
export const SkeletonBlock = ({ style = {}, className = '' }) => (
  <div className={`skeleton-block ${className}`} style={style} />
);

// ── Text line skeleton ────────────────────────────────────────────────────────
export const SkeletonText = ({ lines = 3, style = {} }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, ...style }}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="skeleton-block"
        style={{
          height: 12,
          width: i === lines - 1 ? '65%' : '100%',
          borderRadius: 6,
        }}
      />
    ))}
  </div>
);

// ── Card skeleton ─────────────────────────────────────────────────────────────
export const SkeletonCard = ({ style = {} }) => (
  <div
    className="skeleton-card"
    style={{ borderRadius: 20, padding: '28px', ...style }}
  >
    {/* Icon placeholder */}
    <div className="skeleton-block" style={{ width: 40, height: 40, borderRadius: 12, marginBottom: 16 }} />
    {/* Title */}
    <div className="skeleton-block" style={{ height: 16, width: '55%', borderRadius: 8, marginBottom: 12 }} />
    {/* Body text lines */}
    <SkeletonText lines={3} style={{ marginBottom: 20 }} />
    {/* Button */}
    <div className="skeleton-block" style={{ height: 40, width: '100%', borderRadius: 12 }} />
  </div>
);

// ── Full-page explore skeleton ────────────────────────────────────────────────
export const SkeletonExplorePage = () => (
  <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto' }}>
    {/* Breadcrumb */}
    <div className="skeleton-block" style={{ height: 10, width: 140, borderRadius: 6, marginBottom: 24 }} />

    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
      <div className="skeleton-block" style={{ width: 52, height: 52, borderRadius: 16 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton-block" style={{ height: 28, width: '40%', borderRadius: 10, marginBottom: 10 }} />
        <div className="skeleton-block" style={{ height: 12, width: '30%', borderRadius: 6 }} />
      </div>
      {/* Toggle */}
      <div className="skeleton-block" style={{ width: 140, height: 36, borderRadius: 10 }} />
    </div>

    {/* Hero diagram placeholder */}
    <div className="skeleton-block skeleton-wave" style={{ height: 220, borderRadius: 20, marginBottom: 28 }} />

    {/* Section cards */}
    {[1, 2, 3, 4].map(i => (
      <div key={i} style={{ marginBottom: 16 }}>
        <div className="skeleton-card" style={{ borderRadius: 16, padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div className="skeleton-block" style={{ width: 36, height: 36, borderRadius: 10 }} />
            <div className="skeleton-block" style={{ height: 16, width: '35%', borderRadius: 8 }} />
          </div>
          <SkeletonText lines={3} />
        </div>
      </div>
    ))}
  </div>
);

// ── 3D viewer skeleton ────────────────────────────────────────────────────────
export const SkeletonViewer = ({ style = {} }) => (
  <div
    className="skeleton-card"
    style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: 380,
      borderRadius: 20,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 14,
      ...style
    }}
  >
    <div className="skeleton-block skeleton-wave" style={{ position: 'absolute', inset: 0, borderRadius: 20 }} />
    <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* Plane silhouette shimmer */}
      <svg width="120" height="40" viewBox="0 0 120 40" fill="none" opacity={0.15}>
        <ellipse cx="60" cy="20" rx="58" ry="6" fill="white" />
        <ellipse cx="60" cy="20" rx="10" ry="18" fill="white" />
        <ellipse cx="60" cy="8" rx="4" ry="8" fill="white" />
      </svg>
      <div className="skeleton-block" style={{ width: 160, height: 11, borderRadius: 6 }} />
    </div>
  </div>
);

// ── Lab hub skeleton (grid of cards) ─────────────────────────────────────────
export const SkeletonLabHub = () => (
  <div style={{ padding: '64px 40px', maxWidth: 900, margin: '0 auto' }}>
    {/* Header */}
    <div className="skeleton-block" style={{ height: 32, width: '30%', borderRadius: 12, marginBottom: 12 }} />
    <div className="skeleton-block" style={{ height: 14, width: '50%', borderRadius: 8, marginBottom: 40 }} />
    {/* Cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
      {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
    </div>
  </div>
);

export default SkeletonCard;
