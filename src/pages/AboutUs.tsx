import React from 'react';
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
    { number: '15+', label: isTamil ? 'மகிமையான ஆண்டுகள்' : 'Glorious years' },
    { number: '6L+', label: isTamil ? 'மகிழ்ச்சியான வாடிக்கையாளர்கள்' : 'Customers' },
    { number: '350+', label: isTamil ? 'தயாரிப்புகள்' : 'Products' },
    { number: '24+', label: isTamil ? 'குழு ஆலோசகர்கள்' : 'Team advisor' },
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
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p className={isTamil ? 'tamil-text' : ''}>
                  {isTamil ? 
                    'தரணி ஹெர்பல்ஸ் 2004 ஆம் ஆண்டில் சித்தா மற்றும் ஆயுர்வேதத்தில் ஆராய்ச்சி செய்வதற்காக உருவாக்கப்பட்டது. இதன் விளைவாக, தரணி ஹெர்பல்ஸ் 2007 இல் நிறுவப்பட்டது. ராம்கேர் செம்பருத்தி மூலிகை தலைமுடி எண்ணெய், ராம்கேர் மூடகத்ரன் மூலிகை வலி நிவாரண எண்ணெய், ராம்கேர் லக்ஸ்னா மூலிகை தோல் எண்ணெய் - பிராண்ட் காப்புரிமை பெறாத மருந்துகள் உருவாக்கப்பட்டன.' :
                    'Dharani Herbbals commenced research initiatives in Siddha and Ayurveda in 2004, culminating in the company\'s formal incorporation in 2007. Ramcare Chemparuthi herbal hair oil, Ramcare Moodakattran herbal pain reliever oil, Ramcare Luxsna herbal skin oil- Brand Non patented medicines were developed.'
                  }
                </p>
                <p className={isTamil ? 'tamil-text' : ''}>
                  {isTamil ? 
                    '100% மூலிகை மருந்துகளை அறிமுகப்படுத்துவதன் மூலம் இயற்கை சிகிச்சைக்கான விழிப்புணர்வை ஊக்குவிக்கவும். மூலிகை மருந்துகள் இயற்கையானவை மற்றும் பக்க விளைவுகள் இல்லாமல் தீங்கு விளைவிக்காதவை. எனவே இந்த மருந்துகள் உலகம் முழுவதும் உள்ள மக்களிடையே அன்பான வரவேற்பைப் பெற்றுள்ளன. நாங்கள் மூலிகைகளில் அதிகமான ஆராய்ச்சி செய்து வருகிறோம். நாம் மாசுபட்ட சூழலில் வாழ்ந்து கொண்டிருப்பதால், நமது ஆரோக்கியத்தைப் பாதுகாக்க ஒரே வழி இயற்கை சிகிச்சையை நோக்கி திரும்புவதுதான்.' :
                    'Promote awareness for nature cure by introducing 100% Herbal Medicines. Herbal medicines are Natural and harmless with no side effects.Hence these medicines have warm welcome among people all over the world. We are doing more and more research in herbs. As we are living in polluted atmosphere, the only way to safe-guard our health is to turn back to nature cure.'
                  }
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
                    '100% மூலிகை மருந்துகளை அறிமுகப்படுத்துவதன் மூலம் இயற்கை சிகிச்சைக்கான விழிப்புணர்வை ஊக்குவிக்கவும். மூலிகை மருந்துகள் இயற்கையானவை மற்றும் பக்க விளைவுகள் இல்லாமல் தீங்கு விளைவிக்காதவை. எனவே இந்த மருந்துகள் உலகம் முழுவதும் உள்ள மக்களிடையே அன்பான வரவேற்பைப் பெற்றுள்ளன. நாங்கள் மூலிகைகளில் அதிகமான ஆராய்ச்சி செய்து வருகிறோம். நாம் மாசுபட்ட சூழலில் வாழ்ந்து கொண்டிருப்பதால், நமது ஆரோக்கியத்தைப் பாதுகாக்க ஒரே வழி இயற்கை சிகிச்சையை நோக்கி திரும்புவதுதான்.' :
                    'Promote awareness for nature cure by introducing 100% Herbal Medicines. Herbal medicines are Natural and harmless with no side effects.Hence these medicines have warm welcome among people all over the world. We are doing more and more research in herbs. As we are living in polluted atmosphere, the only way to safe-guard our health is to turn back to nature cure.'
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
                    '100% மூலிகை மருந்துகளை அறிமுகப்படுத்துவதன் மூலம் இயற்கை சிகிச்சைக்கான விழிப்புணர்வை ஊக்குவிக்கவும். மூலிகை மருந்துகள் இயற்கையானவை மற்றும் பக்க விளைவுகள் இல்லாமல் தீங்கு விளைவிக்காதவை. எனவே இந்த மருந்துகள் உலகம் முழுவதும் உள்ள மக்களிடையே அன்பான வரவேற்பைப் பெற்றுள்ளன. நாங்கள் மூலிகைகளில் அதிகமான ஆராய்ச்சி செய்து வருகிறோம். நாம் மாசுபட்ட சூழலில் வாழ்ந்து கொண்டிருப்பதால், நமது ஆரோக்கியத்தைப் பாதுகாக்க ஒரே வழி இயற்கை சிகிச்சையை நோக்கி திரும்புவதுதான்.' :
                    'Promote awareness for nature cure by introducing 100% Herbal Medicines. Herbal medicines are Natural and harmless with no side effects.Hence these medicines have warm welcome among people all over the world. We are doing more and more research in herbs. As we are living in polluted atmosphere, the only way to safe-guard our health is to turn back to nature cure.'
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
                <a href="/products" className="inline-block">
                  <button className="bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all">
                    {translate('about.exploreProducts')}
                  </button>
                </a>
                <a href="/contact" className="inline-block">
                  <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-lg font-semibold transition-all">
                    {translate('about.getInTouch')}
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