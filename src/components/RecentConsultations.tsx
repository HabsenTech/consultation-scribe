import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, User, ArrowRight, FileText } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface RecentConsultation {
  id: string;
  patient_name: string;
  patient_age: string | null;
  patient_gender: string | null;
  diagnosis: string | null;
  consultation_date: string;
}

export function RecentConsultations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<RecentConsultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentConsultations();
    }
  }, [user]);

  const fetchRecentConsultations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('id, patient_name, patient_age, patient_gender, diagnosis, consultation_date')
        .eq('user_id', user.id)
        .order('consultation_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error('Error fetching recent consultations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            Recent Consultations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (consultations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            Recent Consultations
          </CardTitle>
          <CardDescription>Your recent patient consultations will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No consultations yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start recording to see your history
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            Recent Consultations
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {consultations.map((consultation) => (
          <div
            key={consultation.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            onClick={() => navigate('/history')}
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-foreground truncate">
                  {consultation.patient_name}
                </p>
                {consultation.patient_age && (
                  <span className="text-xs text-muted-foreground">
                    {consultation.patient_age}
                  </span>
                )}
              </div>
              {consultation.diagnosis && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {consultation.diagnosis}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(consultation.consultation_date), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
