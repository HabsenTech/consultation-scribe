import { Mic, Square, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MobileAudioRecorderProps {
  isRecording: boolean;
  isTranscribing: boolean;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}

export function MobileAudioRecorder({
  isRecording,
  isTranscribing,
  error,
  onStart,
  onStop,
}: MobileAudioRecorderProps) {
  const isProcessing = isRecording || isTranscribing;

  return (
    <div className="space-y-4">
      {/* Compact Recording Button */}
      <div className="flex items-center justify-between p-4 bg-card rounded-xl border">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-3 h-3 rounded-full",
            isRecording ? "bg-destructive animate-pulse" : 
            isTranscribing ? "bg-primary animate-pulse" : "bg-muted"
          )} />
          <div>
            <p className="font-medium text-foreground text-sm">
              {isTranscribing ? 'Processing...' : isRecording ? 'Recording...' : 'Ready to Record'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isTranscribing ? 'Transcribing audio' : isRecording ? 'Tap stop when done' : 'Tap mic to start'}
            </p>
          </div>
        </div>
        
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className={cn(
            "h-14 w-14 rounded-full p-0",
            isRecording && "animate-pulse"
          )}
          onClick={isRecording ? onStop : onStart}
          disabled={isTranscribing}
        >
          {isTranscribing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isRecording ? (
            <Square className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Processing Indicator */}
      {isTranscribing && (
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <p className="text-sm text-foreground">AI is transcribing your recording...</p>
          </div>
        </div>
      )}

      {/* Audio Visualizer for Recording State */}
      {isRecording && (
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

      {/* Backend transcription notice */}
      <p className="text-xs text-center text-muted-foreground">
        🎯 Using AI-powered transcription for accurate results
      </p>
    </div>
  );
}
