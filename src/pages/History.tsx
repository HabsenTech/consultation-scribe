import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Loader2, 
  Search, 
  Calendar, 
  User, 
  FileText, 
  Eye, 
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  History as HistoryIcon
} from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import { PrescriptionReport } from '@/types/prescription';

interface Consultation {
  id: string;
  patient_name: string;
  patient_age: string | null;
  patient_gender: string | null;
  patient_address: string | null;
  patient_occupation: string | null;
  diagnosis: string | null;
  consultation_date: string;
  consultation_data_encrypted: string;
}

const ITEMS_PER_PAGE = 10;

const History = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [decodedReport, setDecodedReport] = useState<PrescriptionReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchConsultations();
    }
  }, [user, currentPage, searchQuery, dateFilter]);

  const fetchConsultations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('consultations')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('consultation_date', { ascending: false });

      // Search filter
      if (searchQuery) {
        query = query.or(`patient_name.ilike.%${searchQuery}%,diagnosis.ilike.%${searchQuery}%`);
      }

      // Date filter
      if (dateFilter) {
        const startOfDay = new Date(dateFilter);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateFilter);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte('consultation_date', startOfDay.toISOString())
          .lte('consultation_date', endOfDay.toISOString());
      }

      // Pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setConsultations(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      toast.error('Failed to load consultation history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    try {
      const decoded = JSON.parse(atob(consultation.consultation_data_encrypted));
      setDecodedReport(decoded);
    } catch (e) {
      console.error('Error decoding consultation data:', e);
      setDecodedReport(null);
    }
    setIsDialogOpen(true);
  };

  const handleDownloadPDF = (consultation: Consultation) => {
    try {
      const decoded = JSON.parse(atob(consultation.consultation_data_encrypted)) as PrescriptionReport;
      
      const doc = new jsPDF();
      const lineHeight = 7;
      let yPos = 20;

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Prescription Report', 105, yPos, { align: 'center' });
      yPos += 15;

      // Patient Info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Information', 20, yPos);
      yPos += lineHeight;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Name: ${consultation.patient_name}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Age: ${consultation.patient_age || 'N/A'} | Gender: ${consultation.patient_gender || 'N/A'}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Date: ${format(new Date(consultation.consultation_date), 'PPP')}`, 20, yPos);
      yPos += lineHeight * 2;

      // Diagnosis
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Diagnosis', 20, yPos);
      yPos += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const diagnosisLines = doc.splitTextToSize(decoded.diagnosis || consultation.diagnosis || 'Not specified', 170);
      doc.text(diagnosisLines, 20, yPos);
      yPos += diagnosisLines.length * lineHeight + 5;

      // Medications
      if (decoded.medications && decoded.medications.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Medications', 20, yPos);
        yPos += lineHeight;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        decoded.medications.forEach((med, idx) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`${idx + 1}. ${med.name} - ${med.dosage} - ${med.frequency} - ${med.duration}`, 20, yPos);
          yPos += lineHeight;
          if (med.instructions) {
            doc.text(`   Instructions: ${med.instructions}`, 20, yPos);
            yPos += lineHeight;
          }
        });
        yPos += 5;
      }

      // Advice
      if (decoded.advice && decoded.advice.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Advice', 20, yPos);
        yPos += lineHeight;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        decoded.advice.forEach((advice) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`• ${advice}`, 20, yPos);
          yPos += lineHeight;
        });
      }

      // Follow-up
      if (decoded.followUp) {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Follow-up', 20, yPos);
        yPos += lineHeight;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(decoded.followUp, 20, yPos);
      }

      doc.save(`prescription_${consultation.patient_name}_${format(new Date(consultation.consultation_date), 'yyyy-MM-dd')}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <HistoryIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
                Consultation History
              </h1>
              <p className="text-muted-foreground">
                View and manage your past consultations
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name or diagnosis..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 w-40"
                  />
                </div>
                {(searchQuery || dateFilter) && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setDateFilter('');
                      setCurrentPage(1);
                    }}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {consultations.length} of {totalCount} consultations
          </p>
        </div>

        {/* Consultations List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : consultations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No consultations found</h3>
              <p className="text-muted-foreground">
                {searchQuery || dateFilter 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start recording consultations to see them here'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation) => (
              <Card key={consultation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {consultation.patient_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                          {consultation.patient_age && (
                            <span>{consultation.patient_age}</span>
                          )}
                          {consultation.patient_gender && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{consultation.patient_gender}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{format(new Date(consultation.consultation_date), 'PPP')}</span>
                        </div>
                        {consultation.diagnosis && (
                          <Badge variant="secondary" className="mt-2">
                            {consultation.diagnosis.length > 50 
                              ? `${consultation.diagnosis.substring(0, 50)}...` 
                              : consultation.diagnosis}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewConsultation(consultation)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadPDF(consultation)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>

      {/* View Consultation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-heading">Consultation Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            {selectedConsultation && decodedReport && (
              <div className="space-y-6">
                {/* Patient Info */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Patient Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {selectedConsultation.patient_name}</p>
                    <p><span className="text-muted-foreground">Age:</span> {selectedConsultation.patient_age || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Gender:</span> {selectedConsultation.patient_gender || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Date:</span> {format(new Date(selectedConsultation.consultation_date), 'PPP')}</p>
                  </div>
                </div>

                <Separator />

                {/* Symptoms */}
                {decodedReport.patientInfo?.symptoms && decodedReport.patientInfo.symptoms.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Symptoms</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {decodedReport.patientInfo.symptoms.map((symptom, idx) => (
                        <li key={idx}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Diagnosis */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Diagnosis</h4>
                  <p className="text-sm text-muted-foreground">
                    {decodedReport.diagnosis || selectedConsultation.diagnosis || 'Not specified'}
                  </p>
                </div>

                {/* Medications */}
                {decodedReport.medications && decodedReport.medications.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Medications</h4>
                    <div className="space-y-2">
                      {decodedReport.medications.map((med, idx) => (
                        <div key={idx} className="p-3 bg-muted rounded-lg text-sm">
                          <p className="font-medium">{med.name}</p>
                          <p className="text-muted-foreground">
                            {med.dosage} • {med.frequency} • {med.duration}
                          </p>
                          {med.instructions && (
                            <p className="text-xs text-muted-foreground mt-1">{med.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Advice */}
                {decodedReport.advice && decodedReport.advice.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Advice</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {decodedReport.advice.map((advice, idx) => (
                        <li key={idx}>{advice}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow-up */}
                {decodedReport.followUp && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Follow-up</h4>
                    <p className="text-sm text-muted-foreground">{decodedReport.followUp}</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default History;
