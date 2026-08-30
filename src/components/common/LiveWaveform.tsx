import React from 'react';

interface LiveWaveformProps {
  isListening: boolean;
  audioLevel?: number; // 0 to 100
  barCount?: number;
  className?: string;
}

export const LiveWaveform: React.FC<LiveWaveformProps> = ({
  isListening,
  audioLevel = 0,
  barCount = 5,
  className = '',
}) => {
  if (!isListening) return null;

  return (
    <div className={`flex items-center gap-0.5 h-4 px-1.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => {
        // Compute dynamic height based on audio level with variable offsets
        const offset = Math.sin((i / barCount) * Math.PI) * 0.4 + 0.6;
        const levelHeight = Math.max(3, Math.min(14, (audioLevel / 100) * 14 * offset + 2));

        return (
          <span
            key={i}
            className="w-0.5 rounded-full bg-rose-500 transition-all duration-75 ease-out"
            style={{
              height: `${levelHeight}px`,
              animation: `pulse ${0.4 + (i % 3) * 0.15}s ease-in-out infinite alternate`,
            }}
          />
        );
      })}
    </div>
  );
};
