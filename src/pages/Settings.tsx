import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, Bell, Globe, FileText, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SUPPORTED_LANGUAGES } from '@/types/prescription';

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    defaultLanguage: 'en',
    showAdvice: true,
    showInvestigations: true,
    showDietChart: true,
    showPastHistory: true,
    showDrugHistory: true,
    showFamilyHistory: true,
    showVaccinationHistory: true,
    showBirthHistory: true,
    showPregnancyHistory: true,
    defaultFollowUpDays: 7,
    defaultAdvice: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('consultation_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setPreferences({
          defaultLanguage: 'en',
          showAdvice: data.show_advice ?? true,
          showInvestigations: data.show_investigations ?? true,
          showDietChart: data.show_diet_chart ?? true,
          showPastHistory: data.show_past_history ?? true,
          showDrugHistory: data.show_drug_history ?? true,
          showFamilyHistory: data.show_family_history ?? true,
          showVaccinationHistory: data.show_vaccination_history ?? true,
          showBirthHistory: data.show_birth_history ?? true,
          showPregnancyHistory: data.show_pregnancy_history ?? true,
          defaultFollowUpDays: data.default_follow_up_days ?? 7,
          defaultAdvice: data.default_advice?.join('\n') ?? '',
        });
      }
    };

    fetchPreferences();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('consultation_preferences')
        .upsert({
          user_id: user.id,
          show_advice: preferences.showAdvice,
          show_investigations: preferences.showInvestigations,
          show_diet_chart: preferences.showDietChart,
          show_past_history: preferences.showPastHistory,
          show_drug_history: preferences.showDrugHistory,
          show_family_history: preferences.showFamilyHistory,
          show_vaccination_history: preferences.showVaccinationHistory,
          show_birth_history: preferences.showBirthHistory,
          show_pregnancy_history: preferences.showPregnancyHistory,
          default_follow_up_days: preferences.defaultFollowUpDays,
          default_advice: preferences.defaultAdvice.split('\n').filter(a => a.trim()),
        });

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
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
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-heading">Settings</h1>
              <p className="text-muted-foreground text-sm">Customize your consultation preferences</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Language Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="w-5 h-5 text-primary" />
                  Language Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="defaultLanguage">Default Recording Language</Label>
                    <Select 
                      value={preferences.defaultLanguage} 
                      onValueChange={(v) => setPreferences(p => ({ ...p, defaultLanguage: v }))}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_LANGUAGES.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prescription Sections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  Prescription Sections
                </CardTitle>
                <CardDescription>Choose which sections to include in generated prescriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { key: 'showAdvice', label: 'General Advice' },
                    { key: 'showInvestigations', label: 'Investigations' },
                    { key: 'showDietChart', label: 'Diet Chart' },
                    { key: 'showPastHistory', label: 'Past History' },
                    { key: 'showDrugHistory', label: 'Drug History' },
                    { key: 'showFamilyHistory', label: 'Family History' },
                    { key: 'showVaccinationHistory', label: 'Vaccination History' },
                    { key: 'showBirthHistory', label: 'Birth History (Children)' },
                    { key: 'showPregnancyHistory', label: 'Pregnancy History (Female)' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key}>{label}</Label>
                      <Switch
                        id={key}
                        checked={preferences[key as keyof typeof preferences] as boolean}
                        onCheckedChange={(v) => setPreferences(p => ({ ...p, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Default Values */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="w-5 h-5 text-primary" />
                  Default Values
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="followUp">Default Follow-up Days</Label>
                    <Input
                      id="followUp"
                      type="number"
                      min={1}
                      max={90}
                      value={preferences.defaultFollowUpDays}
                      onChange={(e) => setPreferences(p => ({ ...p, defaultFollowUpDays: parseInt(e.target.value) || 7 }))}
                      className="mt-1.5 w-24"
                    />
                  </div>
                  <div>
                    <Label htmlFor="defaultAdvice">Default Advice (one per line)</Label>
                    <Textarea
                      id="defaultAdvice"
                      placeholder="Rest adequately&#10;Drink plenty of fluids&#10;Follow prescribed medications"
                      value={preferences.defaultAdvice}
                      onChange={(e) => setPreferences(p => ({ ...p, defaultAdvice: e.target.value }))}
                      className="mt-1.5"
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Settings
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
