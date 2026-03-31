import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
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
    { number: '15+', label: isTamil ? 'நம்பகத்தின் வரலாறு' : 'Legacy of Trust' },
    { number: '6L+', label: isTamil ? 'வாடிக்கையாளர்கள் சேவை' : 'Customers Served' },
    { number: '350+', label: isTamil ? 'தயாரிப்புகள் உருவாக்கப்பட்டன' : 'Products Crafted' },
    { number: '24+', label: isTamil ? 'குழு ஆலோசகர்கள்' : 'Team Advisors' },
    { number: '7,500+', label: isTamil ? 'மறுவிற்பனையாளர்கள்' : 'Resellers' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <SEOHead 
        title="About Us"
        description="Learn about Dharani Herbbals - 15+ years of excellence in natural and herbal products. Our mission, values, and commitment to your wellness."
        url="/about"
      />
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
              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p className="text-lg font-semibold italic text-green-700">
                  {isTamil ? 'இது ஒரு தயாரிப்பிலிருந்து தொடங்கவில்லை. இது ஒரு கேள்வியிலிருந்து தொடங்கியது.' : "It didn't start with a product. It started with a question."}
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {isTamil ? 'குணப்படுத்துதல் மீண்டும் எளிமையாக இருந்தால் என்ன?' : 'What if healing could be simple again?'}
                </p>
                <p className={isTamil ? 'tamil-text' : ''}>
                  {isTamil ?
                    'எங்கள் பயணம் 2004 இல் சித்தா மற்றும் ஆயுர்வேதத்தில் அர்ப்பணிப்புடன் ஆராய்ச்சி செய்வதன் மூலம் தொடங்கியது, இயற்கை குணப்படுத்தல் மற்றும் காலத்தால் சோதிக்கப்பட்ட மரபுகளின் ஆழத்தை ஆராய்ந்தது. தரணி ஹெர்பல்ஸ் 2007 இல் முறையாக நிறுவப்பட்டது, உண்மையான ஆரோக்கியம் இயற்கையாக, நேர்மையாக மற்றும் சிக்கலற்றதாக இருக்க வேண்டும் என்ற எளிய நம்பிக்கையின் அடிப்படையில்.' :
                    'Our journey began in 2004 with dedicated research into Siddha and Ayurveda, exploring the depth of natural healing and time-tested traditions. Dharani Herbals was formally incorporated in 2007, built on a simple belief that true wellness should be natural, honest, and uncomplicated.'
                  }
                </p>
                <p className={isTamil ? 'tamil-text' : ''}>
                  {isTamil ?
                    'செயற்கை தீர்வுகள் மற்றும் விரைவான தீர்வுகளால் நிரம்பிய உலகில், நாங்கள் வேறு ஒரு பாதையை தேர்ந்தெடுத்தோம் — தூய்மைக்கு, மரபுக்கு மற்றும் இயற்கையின் அமைதியான சக்திக்கு திரும்பும் பாதை.' :
                    'In a world overwhelmed by artificial solutions and quick fixes, we chose a different path — one that returns to purity, to tradition, and to the quiet power of nature.'
                  }
                </p>
                <p className={isTamil ? 'tamil-text' : ''}>
                  {isTamil ?
                    'நாங்கள் உருவாக்கும் ஒவ்வொரு தயாரிப்பும் இந்த அர்ப்பணிப்பை பிரதிபலிக்கிறது — பாதுகாப்பான, பயனுள்ள மற்றும் உண்மையிலேயே இயற்கையான குணப்படுத்தலை வழங்க பண்டைய ஞானத்தை நவீன கவனிப்புடன் இணைக்கிறது.' :
                    'Every product we create reflects this commitment, blending ancient wisdom with modern care to deliver safe, effective, and truly natural healing.'
                  }
                </p>
                <p className="text-lg font-semibold italic text-green-700">
                  {isTamil ? 'வேர்களுக்கு திரும்பு. சிறந்த வாழ்க்கையை நோக்கி முன்னேறு.' : 'Back to roots. Forward to better living.'}
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
                  {isTamil ?
                    'இயற்கை சிகிச்சைக்கான விழிப்புணர்வை ஊக்குவிக்கவும், மூலிகை மருந்துகளின் மூலம் பக்க விளைவுகள் இல்லாத இயற்கையான குணப்படுத்தலை அனைவருக்கும் எடுத்துச் செல்லுவது. பாரம்பரிய ஞானத்தை நவீன கவனிப்புடன் இணைத்து, பாதுகாப்பான, பயனுள்ள மற்றும் உண்மையிலேயே இயற்கையான குணப்படுத்தலை வழங்குவது எங்கள் திண்ம்.' :
                    'To promote natural healing for all through herbal medicines that are safe, effective, and free from side effects — blending ancient wisdom with modern care to deliver truly natural wellness.'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold text-gray-800 mb-4 ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil ? 'எங்கள் வரலாறு' : 'Our History'}
                </h3>
                <p className={`text-gray-600 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil ?
                    '2004 இல் சித்தா மற்றும் ஆயுர்வேத ஆராய்ச்சியுடன் தொடங்கி, 2007 இல் தரணி ஹெர்பல்ஸ் முறையாக நிறுவப்பட்டது. இன்று 15+ ஆண்டுகளாக 6 லட்சத்திற்கும் மேற்பட்ட வாடிக்கையாளர்களுடன், 350+ தயாரிப்புகளுடன் இயற்கை ஆரோக்கியத்தில் நம்பகமான பெயராக வளர்ந்திருக்கிறோம்.' :
                    'Founded in 2004 through Siddha and Ayurveda research, formally incorporated in 2007. Over 15+ years we have grown to serve 6 lakh+ customers across India with 350+ herbal products, becoming a trusted name in natural wellness.'
                  }
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

      </main>
      
      {/* Stats - Full Width */}
      <section className="bg-gradient-to-r from-primary to-green-600 text-white py-12 mb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                <div className={`text-sm md:text-base opacity-90 ${isTamil ? 'tamil-text' : ''}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <main className="container mx-auto px-4 pb-16">

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
                <h2 className={`text-3xl font-bold text-gray-800 mb-4 ${isTamil ? 'tamil-text' : ''}`}>
                  {translate('about.ourCommitment')}
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className={`font-semibold text-gray-800 mb-1 ${isTamil ? 'tamil-text' : ''}`}>
                        {translate('about.authenticProducts')}
                      </h4>
                      <p className={`text-gray-600 text-sm ${isTamil ? 'tamil-text' : ''}`}>
                        {isTamil ? 'ஒவ்வொரு தயாரிப்பும் உண்மையான பொருட்கள் மற்றும் பாரம்பரிய முறைகளுடன் உருவாக்கப்படுகிறது.' : 'Every product is crafted with authentic ingredients and traditional methods.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className={`font-semibold text-gray-800 mb-1 ${isTamil ? 'tamil-text' : ''}`}>
                        {translate('about.customerSatisfaction')}
                      </h4>
                      <p className={`text-gray-600 text-sm ${isTamil ? 'tamil-text' : ''}`}>
                        {isTamil ? 'உங்கள் ஆரோக்கியமும் திருப்தியும் எங்கள் முதன்மை முன்னுரிமைகள்.' : 'Your health and satisfaction are our top priorities.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className={`font-semibold text-gray-800 mb-1 ${isTamil ? 'tamil-text' : ''}`}>
                        {translate('about.sustainablePractices')}
                      </h4>
                      <p className={`text-gray-600 text-sm ${isTamil ? 'tamil-text' : ''}`}>
                        {isTamil ? 'நாங்கள் சுற்றுச்சூழல் பொறுப்புள்ள மூலப்பொருள் மற்றும் உற்பத்திக்கு உறுதிபூண்டுள்ளோம்.' : 'We are committed to environmentally responsible sourcing and production.'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className={`font-semibold text-gray-800 mb-1 ${isTamil ? 'tamil-text' : ''}`}>
                        {translate('about.expertGuidance')}
                      </h4>
                      <p className={`text-gray-600 text-sm ${isTamil ? 'tamil-text' : ''}`}>
                        {isTamil ? 'எங்கள் நிபுணர்கள் குழு உங்கள் நலவாழ்வு பயணத்தில் உங்களுக்கு வழிகாட்ட எப்போதும் கிடைக்கிறது.' : 'Our team of experts is always available to guide you on your wellness journey.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className={`font-semibold text-gray-800 mb-1 ${isTamil ? 'tamil-text' : ''}`}>
                        {translate('about.continuousInnovation')}
                      </h4>
                      <p className={`text-gray-600 text-sm ${isTamil ? 'tamil-text' : ''}`}>
                        {isTamil ? 'வளர்ந்து வரும் ஆரோக்கிய தேவைகளை பூர்த்தி செய்ய நாங்கள் தொடர்ந்து ஆராய்ச்சி செய்து புதிய தயாரிப்புகளை உருவாக்குகிறோம்.' : 'We continuously research and develop new products to meet evolving health needs.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className={`font-semibold text-gray-800 mb-1 ${isTamil ? 'tamil-text' : ''}`}>
                        {translate('about.transparentCommunication')}
                      </h4>
                      <p className={`text-gray-600 text-sm ${isTamil ? 'tamil-text' : ''}`}>
                        {isTamil ? 'எங்கள் தயாரிப்புகள் மற்றும் செயல்முறைகள் பற்றிய நேர்மையான, வெளிப்படையான தகவல்தொடர்பில் நாங்கள் நம்பிக்கை கொண்டுள்ளோம்.' : 'We believe in honest, transparent communication about our products and processes.'}
                      </p>
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
              <h2 className={`text-3xl font-bold text-gray-800 mb-4 ${isTamil ? 'tamil-text' : ''}`}>
                {translate('about.joinWellnessJourney')}
              </h2>
              <p className={`text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                {isTamil ? 'தரணி ஹெர்பல்ஸுடன் இயற்கை நலவாழ்வின் சக்தியை அனுபவியுங்கள். இயற்கையின் ஞானம் மற்றும் நவீன மூலிகை மருத்துவத்தின் அறிவியல் மூலம் சிறந்த ஆரோக்கியத்தை அடைவதற்கு உங்கள் பங்காளராக இருக்க அனுமதியுங்கள்.' : 'Experience the power of natural wellness with Dharani Herbals. Let us be your partner in achieving optimal health through the wisdom of nature and the science of modern herbal medicine.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products" className="inline-block">
                  <button className="bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all">
                    {translate('about.exploreProducts')}
                  </button>
                </Link>
                <Link to="/contact" className="inline-block">
                  <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-lg font-semibold transition-all">
                    {translate('about.getInTouch')}
                  </button>
                </Link>
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