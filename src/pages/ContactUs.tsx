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
      const response = await fetch('https://api.dharaniherbbals.com/api/contact-forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }
        })
      });

      if (response.ok) {
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
      } else {
        throw new Error('Failed to submit form');
      }
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
      title: isTamil ? 'தொலைபேசி' : 'Phone',
      details: ['+91 97881 22001'],
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Mail,
      title: isTamil ? 'மின்னஞ்சல்' : 'Email',
      details: ['info@dharaniherbbals.in', 'salesdharani@gmail.com'],
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: MapPin,
      title: isTamil ? 'முகவரி' : 'Address',
      details: ['7/470-1, Chemparuthi Street,', 'West Nehru Nagar, Punjai Puliampatti,', 'Sathyamangalam(TALUK), Erode - 638 459, TN, India'],
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      icon: Clock,
      title: isTamil ? 'வணிக நேரம்' : 'Business Hours',
      details: isTamil ? ['திங்கள் - சனி: காலை 9:00 - மாலை 7:00'] : ['Mon - Sat: 9:00 AM - 7:00 PM'],
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const features = [
    {
      icon: Headphones,
      title: isTamil ? '24/7 ஆதரவு' : '24/7 Support',
      description: isTamil ? 'உங்கள் அனைத்து கேள்விகளுக்கும் 24 மணி நேர வாடிக்கையாளர் ஆதரவு' : 'Round-the-clock customer support for all your queries'
    },
    {
      icon: MessageCircle,
      title: isTamil ? 'விரைவான பதில்' : 'Quick Response',
      description: isTamil ? 'அனைத்து விசாரணைகளுக்கும் 2-4 மணி நேரத்திற்குள் பதிலளிக்கிறோம்' : 'We respond to all inquiries within 2-4 hours'
    },
    {
      icon: CheckCircle,
      title: isTamil ? 'நிபுணர் வழிகாட்டல்' : 'Expert Guidance',
      description: isTamil ? 'எங்கள் மூலிகை நலவாழ்வு நிபுணர்களிடமிருந்து ஆலோசனை பெறுங்கள்' : 'Get advice from our herbal wellness experts'
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
                  {info.title}
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
                <CardTitle className={`text-2xl font-bold text-center text-gray-800 flex items-center justify-center gap-2 ${isTamil ? 'tamil-text' : ''}`}>
                  <Send className="w-6 h-6 text-primary" />
                  {translate('contact.sendMessage')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className={`text-sm font-medium text-gray-700 mb-2 block ${isTamil ? 'tamil-text' : ''}`}>
                        {translate('contact.fullName')} *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder={translate('contact.fullName')}
                        className="h-12 border-gray-300 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className={`text-sm font-medium text-gray-700 mb-2 block ${isTamil ? 'tamil-text' : ''}`}>
                        {translate('contact.phoneNumber')} *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder={translate('contact.phoneNumber')}
                        className="h-12 border-gray-300 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className={`text-sm font-medium text-gray-700 mb-2 block ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('contact.emailAddress')} *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder={translate('contact.emailAddress')}
                      className="h-12 border-gray-300 focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject" className={`text-sm font-medium text-gray-700 mb-2 block ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('contact.subject')} *
                    </Label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full h-12 px-3 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary/20"
                    >
                      <option value="">{translate('contact.selectSubject')}</option>
                      <option value="product-inquiry">{translate('contact.productInquiry')}</option>
                      <option value="order-support">{translate('contact.orderSupport')}</option>
                      <option value="wellness-consultation">{translate('contact.wellnessConsultation')}</option>
                      <option value="partnership">{translate('contact.partnership')}</option>
                      <option value="feedback">{translate('contact.feedback')}</option>
                      <option value="other">{translate('contact.other')}</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="message" className={`text-sm font-medium text-gray-700 mb-2 block ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('contact.message')} *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder={translate('contact.messagePlaceholder')}
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
                        {translate('contact.sendingMessage')}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        {translate('contact.sendMessage')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Social Media - Moved here */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className={`text-xl font-bold text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>{translate('contact.followUs')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-gray-600 mb-4 ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil ? 'சமூக ஊடகங்களில் எங்களுடன் இணைந்திருங்கள், சமீபத்திய புதுப்பிப்புகள், ஆரோக்கிய குறிப்புகள் மற்றும் தயாரிப்பு அறிமுகங்களுக்காக.' : 'Stay connected with us on social media for the latest updates, health tips, and product launches.'}
                </p>
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/share/12JML3gctZN/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                    <Facebook className="w-6 h-6 text-white" />
                  </a>
                  <a href="https://www.instagram.com/dharani_herbbals?igsh=MXRueWJqMmtpZHRjOQ==" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center transition-colors">
                    <Instagram className="w-6 h-6 text-white" />
                  </a>
                  <a href="https://youtube.com/@dharaniherbbals1236?si=6fZfr3WVwFS6nLCC" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors">
                    <Youtube className="w-6 h-6 text-white" />
                  </a>
                  <a href="https://twitter.com/HerbbalsDharani" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-400 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
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
                <CardTitle className={`text-xl font-bold text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>{translate('contact.whyChooseUs')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-gray-800 mb-1 ${isTamil ? 'tamil-text' : ''}`}>{feature.title}</h3>
                      <p className={`text-gray-600 text-sm ${isTamil ? 'tamil-text' : ''}`}>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>



            {/* Map */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className={`text-xl font-bold text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>{translate('contact.visitStore')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1581.2417944166418!2d77.16591604953587!3d11.358297499569865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8e1bdd6179ddb%3A0x82f81936cbaf1a2!2sDharani%20Herbbals!5e0!3m2!1sen!2sin!4v1751999573702!5m2!1sen!2sin" 
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