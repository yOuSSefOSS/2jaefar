import React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  label: string;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export const Slider = ({ label, unit, min, max, step = 1, value, onChange, className }: SliderProps) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <div className="flex items-center justify-between text-xs">
      <span className="text-[var(--color-text-secondary)] font-semibold tracking-wide uppercase">{label}</span>
      <span className="font-mono text-[var(--color-accent)]">
        {value}{unit ? ` ${unit}` : ''}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full accent-[var(--color-accent)] cursor-pointer"
      aria-label={label}
    />
    <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] font-mono">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);
