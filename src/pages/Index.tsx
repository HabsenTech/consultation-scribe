import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LanguageSelector } from '@/components/LanguageSelector';
import { AudioRecorder } from '@/components/AudioRecorder';
import { MobileAudioRecorder } from '@/components/MobileAudioRecorder';
import { TranscriptionDisplay } from '@/components/TranscriptionDisplay';
import { PrescriptionReportComponent } from '@/components/PrescriptionReport';
import { PatientInfoForm, PatientInfo, PatientVitals } from '@/components/PatientInfoForm';
import { RecentConsultations } from '@/components/RecentConsultations';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useBackendTranscription } from '@/hooks/useBackendTranscription';
import { TranscriptionEntry, PrescriptionReport, SUPPORTED_LANGUAGES } from '@/types/prescription';
import { Button } from '@/components/ui/button';
import { FileText, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIsMobile } from '@/hooks/use-mobile';
import { api } from '@/lib/api';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, loading, credits, refreshCredits } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [prescription, setPrescription] = useState<PrescriptionReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '', age: '', gender: '', address: '', occupation: '',
  });
  const [patientVitals, setPatientVitals] = useState<PatientVitals>({
    bloodPressure: '', pulse: '', temperature: '', weight: '', height: '', respiratoryRate: '', spo2: '',
  });

  const handleTranscription = useCallback((entry: TranscriptionEntry) => {
    setTranscriptions(prev => [...prev, entry]);
  }, []);

  const {
    isListening, isSupported, error: speechError, interimTranscript, startListening, stopListening,
  } = useSpeechRecognition({ languageCode: selectedLanguage, onTranscription: handleTranscription });

  const {
    isRecording, isTranscribing, error: backendError, startRecording, stopRecording,
  } = useBackendTranscription({ languageCode: selectedLanguage, onTranscription: handleTranscription });

  const error = isMobile ? backendError : speechError;

  const handleClearTranscriptions = () => {
    setTranscriptions([]);
    setPrescription(null);
  };

  const getLanguageName = (code: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang?.name || code;
  };

  const isChild = patientInfo.gender?.includes('child');
  const isFemale = patientInfo.gender === 'female' || patientInfo.gender === 'child-female';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleGeneratePrescription = async () => {
    if (transcriptions.length === 0) {
      toast.error('No transcription available. Please record a consultation first.');
      return;
    }

    if (!credits || credits.remaining <= 0) {
      toast.error('No credits remaining. Please contact admin to add more credits.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const fullTranscript = transcriptions.map(t => t.text).join('\n');

      // Generate prescription via edge function (keeps AI logic server-side)
      const { data, error } = await supabase.functions.invoke('generate-prescription', {
        body: { 
          transcript: fullTranscript,
          language: getLanguageName(selectedLanguage),
          patientDetails: {
            name: patientInfo.name || 'Not provided',
            age: patientInfo.age || 'N/A',
            gender: patientInfo.gender || 'N/A',
            address: patientInfo.address || 'N/A',
            occupation: patientInfo.occupation || 'N/A',
          },
          vitals: patientVitals,
          isChild,
          isFemale,
        },
      });

      if (error) {
        console.error('Error generating prescription:', error);
        toast.error(error.message || 'Failed to generate prescription');
        return;
      }

      if (data?.prescription) {
        const report: PrescriptionReport = {
          id: `rx-${Date.now()}`,
          patientInfo: data.prescription.patientInfo,
          pastHistory: data.prescription.pastHistory || '',
          drugHistory: data.prescription.drugHistory || '',
          vaccinationHistory: data.prescription.vaccinationHistory || '',
          childrenBirthHistory: data.prescription.childrenBirthHistory || '',
          pregnancyHistory: data.prescription.pregnancyHistory || '',
          familyHistory: data.prescription.familyHistory || '',
          investigations: data.prescription.investigations || [],
          diagnosis: data.prescription.diagnosis,
          medications: data.prescription.medications || [],
          advice: data.prescription.advice || [],
          dietChart: data.prescription.dietChart || [],
          followUp: data.prescription.followUp,
          generatedAt: new Date(),
          consultationTranscript: fullTranscript,
        };
        setPrescription(report);

        // Save consultation and deduct credit via backend API
        if (user) {
          const encryptedData = btoa(JSON.stringify(report));
          
          await api.createConsultation({
            patient_name: patientInfo.name || 'Unknown',
            patient_age: patientInfo.age,
            patient_gender: patientInfo.gender,
            patient_address: patientInfo.address,
            patient_occupation: patientInfo.occupation,
            consultation_data_encrypted: encryptedData,
            diagnosis: data.prescription.diagnosis,
          });

          await api.deductCredit();
          await refreshCredits();
        }

        toast.success('Prescription report generated successfully!');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to generate prescription. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setTranscriptions([]);
    setPrescription(null);
    setSelectedLanguage('en');
    setPatientInfo({ name: '', age: '', gender: '', address: '', occupation: '' });
    setPatientVitals({ bloodPressure: '', pulse: '', temperature: '', weight: '', height: '', respiratoryRate: '', spo2: '' });
    toast.success('Session reset. Ready for new consultation.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {credits && credits.remaining <= 2 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have only {credits.remaining} credit{credits.remaining !== 1 ? 's' : ''} remaining. 
              Contact admin to add more credits.
            </AlertDescription>
          </Alert>
        )}
        <div className="mb-4 sm:mb-8 flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground font-heading mb-0.5 sm:mb-1">
                Consultation Recorder
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Record consultations and generate detailed prescriptions
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector selectedLanguage={selectedLanguage} onLanguageChange={setSelectedLanguage} />
              <Button variant="outline" size="icon" onClick={handleReset} className="h-9 w-9 sm:h-10 sm:w-10">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <PatientInfoForm
            patientInfo={patientInfo} vitals={patientVitals}
            onPatientInfoChange={setPatientInfo} onVitalsChange={setPatientVitals}
            disabled={isListening}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <div className="space-y-4 sm:space-y-6">
            {isMobile ? (
              <MobileAudioRecorder isRecording={isRecording} isTranscribing={isTranscribing} error={backendError} onStart={startRecording} onStop={stopRecording} />
            ) : (
              <AudioRecorder isListening={isListening} isSupported={isSupported} error={speechError} interimTranscript={interimTranscript} onStart={startListening} onStop={stopListening} />
            )}
            <TranscriptionDisplay entries={transcriptions} onClear={handleClearTranscriptions} />
            {transcriptions.length > 0 && !isListening && !isRecording && !isTranscribing && (
              <Button className="w-full h-12 sm:h-14 text-sm sm:text-lg font-semibold" onClick={handleGeneratePrescription} disabled={isGenerating}>
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Generate Prescription Report
              </Button>
            )}
          </div>
          <div>
            <PrescriptionReportComponent report={prescription} isGenerating={isGenerating} patientDetails={patientInfo} patientVitals={patientVitals} />
          </div>
        </div>

        <div className="mt-8">
          <RecentConsultations />
        </div>

        <div className="mt-8 sm:mt-12 medical-card">
          <h3 className="text-base sm:text-lg font-semibold text-foreground font-heading mb-3 sm:mb-4">How to Use MedScribe AI</h3>
          <div className="grid sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { num: '1', title: 'Enter Patient Info', desc: 'Fill in patient details, address, occupation & vitals' },
              { num: '2', title: 'Select Language', desc: 'Choose consultation language' },
              { num: '3', title: 'Record Consultation', desc: 'Click the microphone and speak' },
              { num: '4', title: 'Generate & Share', desc: 'Generate comprehensive prescription report' },
            ].map(step => (
              <div key={step.num} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 sm:mx-auto sm:mb-3">
                  <span className="text-lg sm:text-xl font-bold text-primary">{step.num}</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-0.5 sm:mb-1 text-sm sm:text-base">{step.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
