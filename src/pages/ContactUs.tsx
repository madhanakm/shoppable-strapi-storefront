import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle, 
  Headphones,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  CheckCircle
} from 'lucide-react';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: translate('contact.messageSent'),
        description: translate('contact.messageResponse'),
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: translate('contact.error'),
        description: translate('contact.errorMessage'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['+91 97881 22001'],
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@dharaniherbbals.in', 'salesdharani@gmail.com'],
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: MapPin,
      title: 'Address',
      details: ['7/470-1, Chemparuthi Street,', 'West Nehru Nagar Punjai Puliampatti', 'Sathyamangalam(TALUK), Erode - 638 459, TN, India'],
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Mon - Sat: 9:00 AM - 7:00 PM', 'Sunday: 10:00 AM - 5:00 PM'],
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const features = [
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your queries'
    },
    {
      icon: MessageCircle,
      title: 'Quick Response',
      description: 'We respond to all inquiries within 2-4 hours'
    },
    {
      icon: CheckCircle,
      title: 'Expert Guidance',
      description: 'Get advice from our herbal wellness experts'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-green-600 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${isTamil ? 'tamil-text' : ''}`}>
            {translate('contact.title')}
          </h1>
          <p className={`text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
            {translate('contact.subtitle')}
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className={`w-16 h-16 ${info.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <info.icon className={`w-8 h-8 ${info.color}`} />
                </div>
                <h3 className={`font-bold text-lg mb-3 text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>
                  {translate(`contact.${info.title.toLowerCase().replace(/\s+/g, '')}`) || info.title}
                </h3>
                <div className="space-y-1">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600">{detail}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="space-y-8">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-green-500/10 rounded-t-lg">
                <CardTitle className="text-2xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
                  <Send className="w-6 h-6 text-primary" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                        className="h-12 border-gray-300 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your phone number"
                        className="h-12 border-gray-300 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your email address"
                      className="h-12 border-gray-300 focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium text-gray-700 mb-2 block">
                      Subject *
                    </Label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full h-12 px-3 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary/20"
                    >
                      <option value="">Select a subject</option>
                      <option value="product-inquiry">Product Inquiry</option>
                      <option value="order-support">Order Support</option>
                      <option value="wellness-consultation">Wellness Consultation</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="feedback">Feedback & Suggestions</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700 mb-2 block">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Tell us how we can help you..."
                      className="min-h-[120px] border-gray-300 focus:border-primary focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-12 bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-600 shadow-lg text-lg font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Social Media - Moved here */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">Follow Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Stay connected with us on social media for the latest updates, health tips, and product launches.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                    <Facebook className="w-6 h-6 text-white" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center transition-colors">
                    <Instagram className="w-6 h-6 text-white" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors">
                    <Youtube className="w-6 h-6 text-white" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="space-y-8">
            {/* Features */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">Why Choose Us?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>



            {/* Map */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">Visit Our Store</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4151.067048559386!2d77.16405807526331!3d11.358041348196105!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8e1bdd6179ddb%3A0x82f81936cbaf1a2!2sDharani%20Herbbals!5e1!3m2!1sen!2sin!4v1751917089863!5m2!1sen!2sin" 
                    width="100%" 
                    height="400" 
                    style={{border: 0}} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                  ></iframe>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>


      </main>
      
      <Footer />
    </div>
  );
};

export default ContactUs;