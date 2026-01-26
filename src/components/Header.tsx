import { Stethoscope } from 'lucide-react';

export function Header() {
  return (
    <header className="hero-gradient border-b border-border">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl medical-gradient flex items-center justify-center shadow-glow">
              <Stethoscope className="w-5 h-5 sm:w-7 sm:h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground font-heading">
                MedScribe AI
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Smart Prescription Generator
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
