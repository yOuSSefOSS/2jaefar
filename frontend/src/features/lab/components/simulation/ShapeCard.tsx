import React from 'react';
import { Box, Wind, Layers, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ReactNode> = {
  box:      <Box size={18} />,
  wind:     <Wind size={18} />,
  layers:   <Layers size={18} />,
  sparkles: <Sparkles size={18} className="text-amber-300" />,
};

interface ShapeCardProps {
  id: string;
  name: string;
  type: string;
  icon?: React.ReactNode | string;
  active?: boolean;
  onClick: (id: string) => void;
}

export const ShapeCard = ({ id, name, type, icon, active, onClick }: ShapeCardProps) => {
  const renderedIcon =
    typeof icon === 'string'
      ? (ICON_MAP[icon] ?? <Box size={18} />)
      : React.isValidElement(icon)
      ? icon
      : <Box size={18} />;

  return (
    <button
      onClick={() => onClick(id)}
      aria-pressed={active}
      className={cn(
        'w-full text-left relative flex items-center gap-3.5 px-4 py-3.5 rounded-[14px] border transition-all duration-300 cursor-pointer',
        'hover:-translate-y-0.5 hover:scale-[1.01]',
        active
          ? 'bg-gradient-to-br from-[#0ea5e9]/8 to-[#00f0ff]/3 border-[#0ea5e9]/25 shadow-[0_0_12px_rgba(14,165,233,0.15),0_4px_12px_rgba(0,0,0,0.4)]'
          : 'bg-[rgba(17,24,39,0.6)] border-white/8 shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:border-white/15 hover:bg-[rgba(17,24,39,0.8)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.5)]'
      )}
    >
      {/* Icon box */}
      <div className={cn(
        'p-2.5 rounded-[10px] flex-shrink-0 transition-all duration-300',
        active
          ? 'bg-gradient-to-br from-[#00f0ff]/12 to-[#0ea5e9]/8 text-[#0ea5e9] shadow-[0_0_10px_rgba(0,240,255,0.1)]'
          : 'bg-[rgba(31,41,55,0.6)] text-[var(--color-text-muted)]'
      )}>
        {renderedIcon}
      </div>

      {/* Text */}
      <div>
        <h3 className={cn('text-sm font-semibold tracking-wide mb-0.5 transition-colors', active ? 'text-white' : 'text-[var(--color-text-secondary)]')}>
          {name}
        </h3>
        <span className="text-[11px] text-[var(--color-text-muted)] capitalize tracking-wide">{type}</span>
      </div>

      {/* Active left-edge indicator */}
      {active && (
        <div className="absolute left-0 top-[20%] bottom-[20%] w-0.5 rounded bg-gradient-to-b from-[#00f0ff] to-[#0ea5e9] shadow-[0_0_8px_rgba(0,240,255,0.3)]" />
      )}
    </button>
  );
};
