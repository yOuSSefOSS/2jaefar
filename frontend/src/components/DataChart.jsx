import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea, Legend } from 'recharts';

const DataChart = ({ data, compareData = [], primaryName = "Primary", compareName = "Comparison", title, dataKey, xKey = "time", activeX = null, stallAngleX = null, negativeStallAngleX = null, isStalling = false, strokeColor, isOptimistic = false }) => {
  // Compute chart domain for reference areas
  const xMin = data && data.length > 0 ? data[0][xKey] : -20;
  const xMax = data && data.length > 0 ? data[data.length - 1][xKey] : 30;

  const activePitchColor = isStalling ? '#ff4444' : 'var(--color-accent-blue)';

  // Optimistic ghost state: render line in red, fade label
  const lineColor = isOptimistic ? '#ef4444' : strokeColor;

  return (
    <div className="w-full h-full glass-panel p-4 flex flex-col" style={{
      boxShadow: isStalling
        ? '0 0 20px rgba(255,68,68,0.25), inset 0 0 30px rgba(255,68,68,0.05)'
        : isOptimistic
          ? '0 0 18px rgba(239,68,68,0.15), inset 0 0 24px rgba(239,68,68,0.04)'
          : undefined,
      transition: 'box-shadow 0.5s ease',
      position: 'relative',
    }}>
       <div className="flex items-center justify-between mb-3">
         <h3 className="text-xs font-semibold tracking-widest text-brand-300 uppercase">{title}</h3>
         <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
           {isOptimistic && (
             <span style={{
               fontFamily: 'monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em',
               color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)',
               padding: '2px 8px', borderRadius: 20, background: 'rgba(239,68,68,0.08)',
               animation: 'pulse 1.5s ease-in-out infinite',
             }}>
               ◉ ESTIMATING…
             </span>
           )}
           {isStalling && (
             <span className="text-[10px] font-mono font-bold text-[#ff4444] animate-pulse tracking-widest border border-[#ff4444]/50 px-2 py-0.5 rounded-full bg-[#ff4444]/10">
               ⚠ STALL
             </span>
           )}
         </div>
       </div>
       <div className="flex-1 w-full min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brand-700)" vertical={false} />
              <XAxis dataKey={xKey} stroke="var(--color-brand-400)" tick={{fill: 'var(--color-brand-300)', fontSize: 10}} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-brand-400)" tick={{fill: 'var(--color-brand-300)', fontSize: 10}} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-brand-800)', borderColor: 'var(--color-brand-600)', borderRadius: '8px', color: '#e2e8f0' }}
                itemStyle={{ color: lineColor }}
                labelStyle={{ color: 'var(--color-brand-300)' }}
              />

              {/* Positive stall zone shading */}
              {stallAngleX !== null && (
                <ReferenceArea x1={stallAngleX} x2={xMax} fill="#ff220015" stroke="none" />
              )}
              {/* Negative stall zone shading */}
              {negativeStallAngleX !== null && negativeStallAngleX < 0 && (
                <ReferenceArea x1={xMin} x2={negativeStallAngleX} fill="#ff220015" stroke="none" />
              )}

              {/* Active pitch angle line — turns red in stall zone */}
              {activeX !== null && (
                <ReferenceLine
                  x={activeX}
                  stroke={activePitchColor}
                  strokeDasharray="3 3"
                  strokeWidth={isStalling ? 2 : 1}
                  opacity={0.9}
                />
              )}

              {/* Positive stall marker */}
              {stallAngleX !== null && (
                <ReferenceLine
                  x={stallAngleX}
                  stroke="#ff2200"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  opacity={0.8}
                  label={{ position: 'insideTopLeft', value: 'STALL+', fill: '#ff2200', fontSize: 9, offset: 6 }}
                />
              )}

              {/* Negative stall marker */}
              {negativeStallAngleX !== null && negativeStallAngleX < 0 && (
                <ReferenceLine
                  x={negativeStallAngleX}
                  stroke="#ff6600"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  opacity={0.8}
                  label={{ position: 'insideTopRight', value: 'STALL−', fill: '#ff6600', fontSize: 9, offset: 6 }}
                />
              )}

              {compareData && compareData.length > 0 && (
                <Legend verticalAlign="top" height={36} iconType="plainline" wrapperStyle={{ fontSize: '11px', color: 'var(--color-brand-300)', fontFamily: 'monospace' }} />
              )}
              {compareData && compareData.length > 0 && (
                <Line name={compareName} type="monotone" data={compareData} dataKey={dataKey} stroke="var(--color-brand-500)" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />
              )}
              <Line
                name={primaryName}
                type="monotone"
                dataKey={dataKey}
                stroke={lineColor}
                strokeWidth={isOptimistic ? 1.5 : 2}
                strokeDasharray={isOptimistic ? '6 3' : undefined}
                dot={false}
                activeDot={{ r: 6, fill: lineColor }}
                isAnimationActive={!isOptimistic}
              />
            </LineChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
}

export default DataChart;
