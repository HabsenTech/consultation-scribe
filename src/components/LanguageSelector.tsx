import { SUPPORTED_LANGUAGES } from '@/types/prescription';
import { Globe, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (code: string) => void;
}

export function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary hidden sm:block" />
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-[140px] sm:w-[200px] bg-card border-border text-sm">
          <SelectValue>
            {selectedLang ? (
              <span className="flex items-center gap-1">
                <span className="font-medium">{selectedLang.nativeName}</span>
                <span className="text-muted-foreground text-xs hidden sm:inline">({selectedLang.name})</span>
              </span>
            ) : 'Select Language'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-card border-border z-50">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="text-sm">
              <span className="flex items-center gap-2">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-muted-foreground text-xs">({lang.name})</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
