import { Mic, MicOff, Square, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  interimTranscript: string;
  onStart: () => void;
  onStop: () => void;
}

export function AudioRecorder({
  isListening,
  isSupported,
  error,
  interimTranscript,
  onStart,
  onStop,
}: AudioRecorderProps) {
  if (!isSupported) {
    return (
      <div className="medical-card text-center">
        <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-destructive mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
          Speech Recognition Not Supported
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base px-2">
          Your browser does not support the Web Speech API. Please use Google Chrome or Microsoft Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="medical-card">
      <div className="flex flex-col items-center">
        {/* Recording Button */}
        <button
          onClick={isListening ? onStop : onStart}
          className={cn(
            "relative w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all duration-300",
            isListening
              ? "bg-destructive hover:bg-destructive/90 glow-effect"
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {/* Pulse Animation */}
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full bg-destructive/30 recording-pulse" />
              <span className="absolute inset-0 rounded-full bg-destructive/20 recording-pulse" style={{ animationDelay: '0.5s' }} />
            </>
          )}
          
          {isListening ? (
            <Square className="w-8 h-8 sm:w-12 sm:h-12 text-destructive-foreground relative z-10" />
          ) : (
            <Mic className="w-8 h-8 sm:w-12 sm:h-12 text-primary-foreground relative z-10" />
          )}
        </button>

        {/* Status Text */}
        <div className="mt-4 sm:mt-6 text-center px-4">
          <p className={cn(
            "text-base sm:text-lg font-semibold font-heading",
            isListening ? "text-destructive" : "text-foreground"
          )}>
            {isListening ? 'Recording Consultation...' : 'Start Recording'}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isListening 
              ? 'Click to stop and generate prescription' 
              : 'Click to start recording the consultation'}
          </p>
        </div>

        {/* Audio Visualizer */}
        {isListening && (
          <div className="flex items-center gap-1 mt-4 sm:mt-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 sm:w-1.5 bg-primary rounded-full wave-animation"
                style={{
                  height: `${16 + Math.random() * 16}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Interim Transcript */}
        {interimTranscript && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted rounded-xl max-w-full sm:max-w-md mx-4">
            <p className="text-xs sm:text-sm text-muted-foreground italic break-words">
              "{interimTranscript}..."
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start sm:items-center gap-2 sm:gap-3 mx-4">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-xs sm:text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
