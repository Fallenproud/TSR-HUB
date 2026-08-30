import React, { useState } from 'react';
import { Mic, MicOff, AlertCircle, Sparkles, Volume2 } from 'lucide-react';
import { useVoiceToText } from '../../hooks/useVoiceToText';
import { LiveWaveform } from './LiveWaveform';

interface VoiceInputButtonProps {
  onTranscript: (text: string, mode: 'append' | 'replace') => void;
  mode?: 'append' | 'replace';
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  placeholderPrompt?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  mode = 'append',
  title = 'Click to dictate with voice',
  size = 'md',
  className = '',
  placeholderPrompt,
}) => {
  const [showStatusTooltip, setShowStatusTooltip] = useState(false);

  const {
    isListening,
    audioLevel,
    errorMessage,
    isSupported,
    permissionGranted,
    toggleListening,
    interimTranscript,
  } = useVoiceToText({
    continuous: true,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (text && text.trim()) {
        onTranscript(text, mode);
      }
    },
  });

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-xs',
    lg: 'px-3 py-2 text-sm',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleListening();
        }}
        onMouseEnter={() => setShowStatusTooltip(true)}
        onMouseLeave={() => setShowStatusTooltip(false)}
        className={`relative inline-flex items-center justify-center gap-1.5 rounded-xl transition-all duration-200 ${sizeClasses[size]} ${
          isListening
            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-300 dark:ring-rose-800'
            : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-slate-700/80'
        } ${className}`}
        title={isListening ? 'Click to stop voice dictation' : title}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <>
            <Mic className={`${iconSizes[size]} animate-pulse`} />
            <LiveWaveform isListening={isListening} audioLevel={audioLevel} barCount={4} />
            <span className="text-[10px] font-semibold uppercase tracking-wider hidden sm:inline">
              Listening
            </span>
          </>
        ) : (
          <>
            <Mic className={iconSizes[size]} />
          </>
        )}
      </button>

      {/* Floating status & interim transcript preview pill while actively listening */}
      {isListening && interimTranscript && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 animate-in fade-in zoom-in-95">
          <Volume2 className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="italic font-medium text-slate-200">"{interimTranscript}..."</span>
        </div>
      )}

      {/* Error notice tooltip if mic error occurs */}
      {errorMessage && (
        <div className="absolute top-full mt-1.5 left-0 z-50 w-48 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-[11px] p-2 rounded-xl shadow-lg flex items-start gap-1.5 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
