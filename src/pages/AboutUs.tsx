import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Leaf, 
  Heart, 
  Shield, 
  Award, 
  Users, 
  Globe, 
  CheckCircle,
  Star,
  Target,
  Eye
} from 'lucide-react';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';

const AboutUs = () => {
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  const values = [
    {
      icon: Heart,
      titleKey: 'about.qualityFirst',
      descKey: 'about.qualityFirstDesc',
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      icon: Shield,
      titleKey: 'about.naturalSafe',
      descKey: 'about.naturalSafeDesc',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: Award,
      titleKey: 'about.certifiedExcellence',
      descKey: 'about.certifiedExcellenceDesc',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Users,
      titleKey: 'about.customerFocused',
      descKey: 'about.customerFocusedDesc',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  const stats = [
    { number: '10+', labelKey: 'about.yearsExperience' },
    { number: '1000+', labelKey: 'about.happyCustomers' },
    { number: '50+', labelKey: 'about.products' },
    { number: '100%', labelKey: 'about.natural' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-green-600 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${isTamil ? 'tamil-text' : ''}`}>
              {translate('about.title')}
            </h1>
            <p className={`text-xl md:text-2xl opacity-90 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
              {translate('about.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Company Overview */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-3xl font-bold text-gray-800 mb-6 ${isTamil ? 'tamil-text' : ''}`}>
                {translate('about.ourStory')}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p className={isTamil ? 'tamil-text' : ''}>
                  {translate('about.storyPara1')}
                </p>
                <p className={isTamil ? 'tamil-text' : ''}>
                  {translate('about.storyPara2')}
                </p>
                <p className={isTamil ? 'tamil-text' : ''}>
                  {translate('about.storyPara3')}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://api.dharaniherbbals.com/uploads/about_54cd77d099.jpg" 
                  alt="Dharani Herbals About Us" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold text-gray-800 mb-4 ${isTamil ? 'tamil-text' : ''}`}>
                  {translate('about.ourMission')}
                </h3>
                <p className={`text-gray-600 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                  {translate('about.missionText')}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold text-gray-800 mb-4 ${isTamil ? 'tamil-text' : ''}`}>
                  {translate('about.ourVision')}
                </h3>
                <p className={`text-gray-600 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                  {translate('about.visionText')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold text-gray-800 mb-4 ${isTamil ? 'tamil-text' : ''}`}>
              {translate('about.coreValues')}
            </h2>
            <p className={`text-gray-600 max-w-2xl mx-auto ${isTamil ? 'tamil-text' : ''}`}>
              {translate('about.coreValuesDesc')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 ${value.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <value.icon className={`w-8 h-8 ${value.color}`} />
                  </div>
                  <h3 className={`font-bold text-lg mb-3 text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>
                    {translate(value.titleKey)}
                  </h3>
                  <p className={`text-gray-600 text-sm leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                    {translate(value.descKey)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-16">
          <Card className="shadow-2xl border-0 bg-gradient-to-r from-primary to-green-600 text-white">
            <CardContent className="p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                    <div className={`text-sm md:text-base opacity-90 ${isTamil ? 'tamil-text' : ''}`}>
                      {translate(stat.labelKey)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* What Makes Us Different */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold text-gray-800 mb-4 ${isTamil ? 'tamil-text' : ''}`}>
              {translate('about.whatMakesUsDifferent')}
            </h2>
            <p className={`text-gray-600 max-w-2xl mx-auto ${isTamil ? 'tamil-text' : ''}`}>
              {translate('about.differentDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg mb-2 text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('about.naturalIngredients')}
                    </h3>
                    <p className={`text-gray-600 text-sm ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('about.naturalIngredientsDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg mb-2 text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('about.qualityAssurance')}
                    </h3>
                    <p className={`text-gray-600 text-sm ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('about.qualityAssuranceDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg mb-2 text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('about.traditionalWisdom')}
                    </h3>
                    <p className={`text-gray-600 text-sm ${isTamil ? 'tamil-text' : ''}`}>
                      {translate('about.traditionalWisdomDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Commitment */}
        <section className="mb-16">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Commitment to You</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Authentic Products</h4>
                      <p className="text-gray-600 text-sm">Every product is crafted with authentic ingredients and traditional methods.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Customer Satisfaction</h4>
                      <p className="text-gray-600 text-sm">Your health and satisfaction are our top priorities.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Sustainable Practices</h4>
                      <p className="text-gray-600 text-sm">We are committed to environmentally responsible sourcing and production.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Expert Guidance</h4>
                      <p className="text-gray-600 text-sm">Our team of experts is always available to guide you on your wellness journey.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Continuous Innovation</h4>
                      <p className="text-gray-600 text-sm">We continuously research and develop new products to meet evolving health needs.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Transparent Communication</h4>
                      <p className="text-gray-600 text-sm">We believe in honest, transparent communication about our products and processes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="shadow-2xl border-0 bg-gradient-to-r from-primary/10 to-green-500/10">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Join Our Wellness Journey</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Experience the power of natural wellness with Dharani Herbals. Let us be your partner in achieving 
                optimal health through the wisdom of nature and the science of modern herbal medicine.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/products" className="inline-block">
                  <button className="bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all">
                    Explore Our Products
                  </button>
                </a>
                <a href="/contact" className="inline-block">
                  <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-lg font-semibold transition-all">
                    Get In Touch
                  </button>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUs;