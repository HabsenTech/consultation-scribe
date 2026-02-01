import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Phone, Mail, HelpCircle, Mic, FileText, CreditCard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const faqs = [
  {
    question: 'How do I start a consultation recording?',
    answer: 'Simply click the microphone button on the home page, speak clearly, and the AI will transcribe your consultation in real-time. Once done, click stop and generate the prescription.',
    icon: Mic,
  },
  {
    question: 'Which languages are supported?',
    answer: 'MedScribe AI supports English, Hindi, Telugu, Tamil, Kannada, and Marathi. Select your preferred language from the dropdown before recording.',
    icon: HelpCircle,
  },
  {
    question: 'How do credits work?',
    answer: 'Each prescription generation uses 1 credit. New users get 10 free credits. You can purchase additional credit packages from the Pricing page.',
    icon: CreditCard,
  },
  {
    question: 'Is patient data secure?',
    answer: 'Yes, all consultation data is encrypted and stored securely. Only you can access your patient records through your authenticated account.',
    icon: Shield,
  },
  {
    question: 'Can I edit the generated prescription?',
    answer: 'Currently, prescriptions are generated based on your consultation. You can download the PDF and make edits as needed.',
    icon: FileText,
  },
  {
    question: 'Why is speech recognition not working on my device?',
    answer: 'Speech recognition requires microphone permission and works best on Chrome or Edge browsers. On mobile, ensure you have granted microphone access in your browser settings.',
    icon: Mic,
  },
];

const Help = () => {
  const whatsappNumber = '+918919247590';
  const supportEmail = 'hadhi@habsentech.com';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-heading mb-2">
              Help & Support
            </h1>
            <p className="text-muted-foreground">
              Find answers to common questions or reach out to our support team
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">WhatsApp Support</h3>
                <p className="text-sm text-muted-foreground mb-3">Quick responses via WhatsApp</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`https://wa.me/${whatsappNumber.replace('+', '')}`, '_blank')}
                >
                  Chat Now
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p className="text-sm text-muted-foreground mb-3">Call us directly</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`tel:${whatsappNumber}`, '_self')}
                >
                  {whatsappNumber}
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-3">Detailed inquiries</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`mailto:${supportEmail}`, '_self')}
                >
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Quick answers to common questions about MedScribe AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      <span className="flex items-center gap-2">
                        <faq.icon className="w-4 h-4 text-primary flex-shrink-0" />
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Help;
