import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope, Zap, Shield, Globe, Users, Award } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Transcription',
    description: 'Real-time speech recognition with advanced AI processing to generate accurate prescriptions.',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Support for English, Hindi, Telugu, Tamil, Kannada, and Marathi for diverse medical practices.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'All patient data is encrypted and stored securely with role-based access control.',
  },
  {
    icon: Users,
    title: 'Built for Doctors',
    description: 'Designed specifically for medical professionals to streamline consultation workflows.',
  },
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-2xl medical-gradient flex items-center justify-center mx-auto mb-6 glow-effect">
              <Stethoscope className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-heading mb-4">
              About MedScribe AI
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Revolutionizing medical documentation with AI-powered transcription and intelligent prescription generation.
            </p>
          </div>

          {/* Mission */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Our Mission
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                MedScribe AI was created to help doctors focus on what matters most - their patients. 
                By automating the tedious task of medical documentation, we enable healthcare professionals 
                to spend more time on patient care and less time on paperwork. Our AI understands medical 
                terminology, extracts relevant clinical information, and generates comprehensive prescriptions 
                in seconds.
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How It Works */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">How It Works</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Enter Patient Details</h4>
                    <p className="text-sm text-muted-foreground">Fill in basic patient information and vitals.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Record Consultation</h4>
                    <p className="text-sm text-muted-foreground">Speak naturally about symptoms, diagnosis, and treatment.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">AI Generates Prescription</h4>
                    <p className="text-sm text-muted-foreground">Our AI processes the consultation and creates a detailed prescription.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Download & Share</h4>
                    <p className="text-sm text-muted-foreground">Export as PDF and share with patients digitally or print.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Developer Info */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Developed by Habsen Tech</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Building innovative healthcare solutions with AI
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                <a 
                  href="mailto:hadhi@habsentech.com" 
                  className="text-primary hover:underline"
                >
                  hadhi@habsentech.com
                </a>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <a 
                  href="tel:+918919247590" 
                  className="text-primary hover:underline"
                >
                  +91 8919247590
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
