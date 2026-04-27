import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const PdfReportTemplate = React.forwardRef(({ 
  activeShape, 
  chartData, 
  windSpeed, 
  density, 
  pitchAngle,
  liftForce,
  dragForce,
  positiveStallAngle,
  isCompareMode,
  compareShape,
  compareChartData,
  comparePositiveStallAngle
}, ref) => {
  if (!activeShape) return null;

  const renderAirfoilPage = (shape, data, pAngle, stallAngle, titleLabel, showForces = false) => {
    if (!shape) return null;
    const pointsString = shape.airfoilData.map(p => `${p[0] * 300 + 150},${p[1] * -300 + 100}`).join(' ');
    
    return (
      <div className="pdf-page" style={{ width: '800px', height: '1130px', backgroundColor: '#ffffff', color: '#000000', padding: '40px', fontFamily: 'monospace', boxSizing: 'border-box', position: 'relative' }}>
        <div style={{ borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>VORTEX-GEN</h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>AERODYNAMIC ANALYSIS REPORT - {titleLabel}</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px' }}>
            <p style={{ margin: 0 }}>Date: {new Date().toLocaleDateString()}</p>
            <p style={{ margin: 0 }}>Solver: NeuralFoil AI Proxy</p>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>GEOMETRY: {shape.name}</h2>
          <div style={{ border: '1px solid #ddd', height: '200px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
            <svg width="100%" height="100%" viewBox="0 0 300 200">
              <polygon points={pointsString} fill="#e0e0e0" stroke="#000" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px' }}>
            <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>ENVIRONMENT</h3>
            <p style={{ margin: '5px 0' }}>Wind Speed: <strong>{windSpeed} m/s</strong></p>
            <p style={{ margin: '5px 0' }}>Air Density: <strong>{density} kg/m³</strong></p>
            <p style={{ margin: '5px 0' }}>Reynold's No: <strong>{((windSpeed * density) / 1.5e-5).toExponential(2)}</strong></p>
          </div>
          <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px' }}>
            <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>CURRENT STATE @ AoA {pAngle}°</h3>
            {showForces && (
              <>
                <p style={{ margin: '5px 0' }}>Lift Force: <strong>{liftForce.toFixed(2)} N</strong></p>
                <p style={{ margin: '5px 0' }}>Drag Force: <strong>{dragForce.toFixed(2)} N</strong></p>
              </>
            )}
            <p style={{ margin: '5px 0' }}>Positive Stall AoA: <strong>{stallAngle ? `${stallAngle}°` : 'N/A'}</strong></p>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '15px' }}>LIFT COEFFICIENT VS ANGLE OF ATTACK</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="aoa" stroke="#000" />
                <YAxis stroke="#000" />
                <Line type="monotone" dataKey="cl" stroke="#000" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderComparisonPage = () => {
    return (
      <div className="pdf-page" style={{ width: '800px', height: '1130px', backgroundColor: '#ffffff', color: '#000000', padding: '40px', fontFamily: 'monospace', boxSizing: 'border-box', position: 'relative' }}>
        <div style={{ borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>VORTEX-GEN</h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>AERODYNAMIC COMPARISON REPORT</p>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>OVERVIEW: {activeShape.name} vs {compareShape.name}</h2>
          <p>Comparing aerodynamic coefficients over AoA range.</p>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '15px' }}>LIFT COEFFICIENT COMPARISON (Cl)</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="aoa" stroke="#000" />
                <YAxis stroke="#000" />
                <Legend verticalAlign="top" height={36} />
                <Line name={activeShape.name} type="monotone" dataKey="cl" stroke="#0ea5e9" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line name={compareShape.name} type="monotone" data={compareChartData} dataKey="cl" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '15px' }}>DRAG COEFFICIENT COMPARISON (Cd)</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="aoa" stroke="#000" />
                <YAxis stroke="#000" />
                <Legend verticalAlign="top" height={36} />
                <Line name={activeShape.name} type="monotone" dataKey="cd" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line name={compareShape.name} type="monotone" data={compareChartData} dataKey="cd" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={ref}>
      {renderAirfoilPage(activeShape, chartData, pitchAngle, positiveStallAngle, 'PRIMARY AIRFOIL', true)}
      {isCompareMode && renderAirfoilPage(compareShape, compareChartData, pitchAngle, comparePositiveStallAngle, 'COMPARE AIRFOIL', false)}
      {isCompareMode && renderComparisonPage()}
    </div>
  );
});

export default PdfReportTemplate;
