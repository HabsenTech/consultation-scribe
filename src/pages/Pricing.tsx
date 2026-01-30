import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Phone, Mail, MessageCircle } from 'lucide-react';

interface PricingPlan {
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular?: boolean;
  features: string[];
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    credits: 10,
    price: 9.99,
    pricePerCredit: 1.00,
    features: [
      '10 consultation credits',
      'AI-powered prescriptions',
      'Multi-language support',
      'PDF export',
      'Email support',
    ],
  },
  {
    name: 'Professional',
    credits: 50,
    price: 39.99,
    pricePerCredit: 0.80,
    popular: true,
    features: [
      '50 consultation credits',
      'AI-powered prescriptions',
      'Multi-language support',
      'PDF export',
      'Priority email support',
      '20% savings per credit',
    ],
  },
  {
    name: 'Enterprise',
    credits: 200,
    price: 119.99,
    pricePerCredit: 0.60,
    features: [
      '200 consultation credits',
      'AI-powered prescriptions',
      'Multi-language support',
      'PDF export',
      'Dedicated support',
      '40% savings per credit',
      'Custom branding (soon)',
    ],
  },
  {
    name: 'Unlimited',
    credits: 500,
    price: 249.99,
    pricePerCredit: 0.50,
    features: [
      '500 consultation credits',
      'AI-powered prescriptions',
      'Multi-language support',
      'PDF export',
      'Priority phone support',
      '50% savings per credit',
      'Custom branding (soon)',
      'API access (soon)',
    ],
  },
];

const Pricing = () => {
  const handleContactForPurchase = (plan: PricingPlan) => {
    const message = encodeURIComponent(
      `Hi! I'm interested in purchasing the ${plan.name} plan (${plan.credits} credits for $${plan.price.toFixed(2)}) for MedScribe AI.`
    );
    window.open(`https://wa.me/918919247590?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-heading mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your practice. All plans include our powerful AI prescription generator with multi-language support.
          </p>
        </div>

        {/* Free Trial Banner */}
        <div className="mb-10 p-6 rounded-xl bg-primary/10 border border-primary/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-5 h-5 text-primary fill-primary" />
            <h3 className="text-lg font-semibold text-foreground">Start with 10 Free Credits</h3>
            <Star className="w-5 h-5 text-primary fill-primary" />
          </div>
          <p className="text-muted-foreground">
            Every new account gets 10 free consultation credits to try MedScribe AI risk-free.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative flex flex-col ${
                plan.popular 
                  ? 'border-primary shadow-lg shadow-primary/10 scale-105' 
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-heading">{plan.name}</CardTitle>
                <CardDescription>{plan.credits} credits</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">${plan.price.toFixed(2)}</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    ${plan.pricePerCredit.toFixed(2)} per credit
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleContactForPurchase(plan)}
                  variant={plan.popular ? 'default' : 'outline'}
                  className="w-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Buy via WhatsApp
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="font-heading">Need Custom Volume?</CardTitle>
            <CardDescription>
              Contact us for bulk pricing, enterprise solutions, or custom requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <a 
                href="tel:+918919247590"
                className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Call Us</p>
                  <p className="text-sm text-muted-foreground">+91 8919247590</p>
                </div>
              </a>
              <a 
                href="mailto:hadhi@habsentech.com"
                className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Email Us</p>
                  <p className="text-sm text-muted-foreground">hadhi@habsentech.com</p>
                </div>
              </a>
            </div>
            <div className="text-center pt-4 text-sm text-muted-foreground">
              <p>Powered by <span className="font-semibold">Habsen Tech</span></p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6 font-heading">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">What is a credit?</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                One credit = one AI-generated prescription report. Each time you record a consultation and generate a prescription, one credit is deducted from your account.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">Do credits expire?</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                No! Your credits never expire. Use them at your own pace.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">How do I purchase credits?</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                Click the "Buy via WhatsApp" button on any plan to contact us directly. We'll process your order and add credits to your account within 24 hours.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                We accept UPI, bank transfer, PayPal, and credit/debit cards. Contact us to discuss payment options.
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
