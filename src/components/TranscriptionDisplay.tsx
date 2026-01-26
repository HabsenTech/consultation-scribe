import { TranscriptionEntry, SUPPORTED_LANGUAGES } from '@/types/prescription';
import { MessageSquare, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranscriptionDisplayProps {
  entries: TranscriptionEntry[];
  onClear: () => void;
}

export function TranscriptionDisplay({ entries, onClear }: TranscriptionDisplayProps) {
  const getLanguageName = (code: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang?.nativeName || code;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (entries.length === 0) {
    return (
      <div className="medical-card text-center py-8 sm:py-12">
        <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 font-heading">
          No Transcription Yet
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base px-4">
          Start recording the consultation to see the transcription here
        </p>
      </div>
    );
  }

  return (
    <div className="medical-card">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground font-heading">
            Consultation Transcript
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-destructive text-xs sm:text-sm"
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </div>

      <ScrollArea className="h-[200px] sm:h-[250px] lg:h-[300px] pr-2 sm:pr-4">
        <div className="space-y-2 sm:space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-3 sm:p-4 bg-muted/50 rounded-xl animate-fade-in"
            >
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <span className="text-xs px-2 py-0.5 sm:py-1 bg-primary/10 text-primary rounded-full">
                  {getLanguageName(entry.language)}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(entry.timestamp)}
                </span>
              </div>
              <p className="text-foreground leading-relaxed text-sm sm:text-base">{entry.text}</p>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Total entries: {entries.length}
        </p>
      </div>
    </div>
  );
}
