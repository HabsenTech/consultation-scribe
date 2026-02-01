import { Mic, Square, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MobileAudioRecorderProps {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  interimTranscript: string;
  onStart: () => void;
  onStop: () => void;
}

export function MobileAudioRecorder({
  isListening,
  isSupported,
  error,
  interimTranscript,
  onStart,
  onStop,
}: MobileAudioRecorderProps) {
  if (!isSupported) {
    return (
      <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground mb-1">Speech Recognition Not Available</h3>
            <p className="text-sm text-muted-foreground">
              Please use Chrome or Edge browser for voice recording.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Recording Button */}
      <div className="flex items-center justify-between p-4 bg-card rounded-xl border">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-3 h-3 rounded-full",
            isListening ? "bg-destructive animate-pulse" : "bg-muted"
          )} />
          <div>
            <p className="font-medium text-foreground text-sm">
              {isListening ? 'Recording...' : 'Ready to Record'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isListening ? 'Tap stop when done' : 'Tap mic to start'}
            </p>
          </div>
        </div>
        
        <Button
          size="lg"
          variant={isListening ? "destructive" : "default"}
          className={cn(
            "h-14 w-14 rounded-full p-0",
            isListening && "animate-pulse"
          )}
          onClick={isListening ? onStop : onStart}
        >
          {isListening ? (
            <Square className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Live Transcript Preview */}
      {interimTranscript && (
        <div className="p-3 bg-muted/50 rounded-lg border border-muted">
          <p className="text-xs text-muted-foreground mb-1">Live transcript:</p>
          <p className="text-sm text-foreground italic">"{interimTranscript}"</p>
        </div>
      )}

      {/* Audio Visualizer for Recording State */}
      {isListening && (
        <div className="flex items-center justify-center gap-1 py-2">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full wave-animation"
              style={{
                height: `${12 + Math.random() * 12}px`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
