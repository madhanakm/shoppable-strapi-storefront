import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Leaf, 
  Shield, 
  Award, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';

const OurStorySection = () => {
  const { translate, language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  const stats = [
    { number: '15+', label: isTamil ? 'நம்பகத்தின் வரலாறு' : 'Legacy of Trust' },
    { number: '6L+', label: isTamil ? 'வாடிக்கையாளர்கள் சேவை' : 'Customers Served' },
    { number: '350+', label: isTamil ? 'தயாரிப்புகள் உருவாக்கப்பட்டன' : 'Products Crafted' },
    { number: '100%', label: isTamil ? 'ராசாயனம் இல்லாத' : 'Chemical-Free' }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-emerald-50 via-white to-green-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 bg-clip-text text-transparent ${isTamil ? 'tamil-text' : ''}`}>
              {translate('about.ourStory')}
            </h2>
          </div>
          <div className="flex justify-center items-center gap-2 mb-8">
            <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
            <div className="w-20 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
            <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
          </div>
        </div>

        {/* Main Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="order-2 lg:order-1">
            <div className="space-y-6">
              <p className={`text-xl font-semibold italic text-emerald-700 ${isTamil ? 'tamil-text' : ''}`}>
                {isTamil ? 'இது ஒரு தயாரிப்பிலிருந்து தொடங்கவில்லை. இது ஒரு கேள்வியிலிருந்து தொடங்கியது.' : "It didn't start with a product. It started with a question."}
              </p>
              <p className={`text-2xl font-bold text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>
                {isTamil ? 'குணப்படுத்துதல் மீண்டும் எளிமையாக இருந்தால் என்ன?' : 'What if healing could be simple again?'}
              </p>
              <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-green-500 rounded-full"></div>
                <p className={`text-lg leading-relaxed text-gray-700 pl-8 ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil ?
                    'எங்கள் பயணம் 2004 இல் சித்தா மற்றும் ஆயுர்வேதத்தில் அர்ப்பணிப்புடன் ஆராய்ச்சி செய்வதன் மூலம் தொடங்கியது, இயற்கை குணப்படுத்தல் மற்றும் காலத்தால் சோதிக்கப்பட்ட மரபுகளின் ஆழத்தை ஆராய்ந்தது. தரணி ஹெர்பல்ஸ் 2007 இல் முறையாக நிறுவப்பட்டது.' :
                    'Our journey began in 2004 with dedicated research into Siddha and Ayurveda, exploring the depth of natural healing and time-tested traditions. Dharani Herbals was formally incorporated in 2007, built on a simple belief that true wellness should be natural, honest, and uncomplicated.'
                  }
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                <p className={`text-lg leading-relaxed text-gray-700 pl-8 ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil ?
                    'செயற்கை தீர்வுகள் மற்றும் விரைவான தீர்வுகளால் நிரம்பிய உலகில், நாங்கள் வேறு ஒரு பாதையை தேர்ந்தெடுத்தோம் — தூய்மைக்கு, மரபுக்கு, மற்றும் இயற்கையின் அமைதியான சக்திக்கு திரும்பும் பாதை.' :
                    'In a world overwhelmed by artificial solutions and quick fixes, we chose a different path — one that returns to purity, to tradition, and to the quiet power of nature.'
                  }
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                <p className={`text-lg leading-relaxed text-gray-700 pl-8 ${isTamil ? 'tamil-text' : ''}`}>
                  {isTamil ?
                    'நாங்கள் உருவாக்கும் ஒவ்வொரு தயாரிப்பும் இந்த அர்ப்பணிப்பை பிரதிபலிக்கிறது — பாதுகாப்பான, பயனுள்ள மற்றும் உண்மையிலேயே இயற்கையான குணப்படுத்தலை வழங்க பண்டைய ஞானத்தை நவீன கவனிப்புடன் இணைக்கிறது.' :
                    'Every product we create reflects this commitment, blending ancient wisdom with modern care to deliver safe, effective, and truly natural healing.'
                  }
                </p>
              </div>
              <p className={`text-lg font-semibold text-emerald-700 italic ${isTamil ? 'tamil-text' : ''}`}>
                {isTamil ? 'வேர்களுக்கு திரும்பு. சிறந்த வாழ்க்கையை நோக்கி முன்னேறு.' : 'Back to roots. Forward to better living.'}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link to="/products">
                <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <span className={isTamil ? 'tamil-text' : ''}>{translate('about.exploreProducts')}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-8 py-3 rounded-xl font-bold transition-all duration-300">
                  <span className={isTamil ? 'tamil-text' : ''}>{translate('about.getInTouch')}</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-green-400 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                <img 
                  src="https://api.dharaniherbbals.com/uploads/about_54cd77d099.jpg" 
                  alt="Dharani Herbals About Us" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-emerald-500 to-green-500 border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                {stats.map((stat, index) => (
                  <div key={index} className="transform hover:scale-110 transition-transform duration-300">
                    <div className="text-3xl md:text-4xl font-black mb-2">{stat.number}</div>
                    <div className={`text-sm md:text-base opacity-90 font-medium ${isTamil ? 'tamil-text' : ''}`}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What Makes Us Different */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="group shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className={`font-bold text-lg mb-2 text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>
                    {translate('about.naturalIngredients')}
                  </h4>
                  <p className={`text-gray-600 text-sm leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                    {translate('about.naturalIngredientsDesc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className={`font-bold text-lg mb-2 text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>
                    {translate('about.qualityAssurance')}
                  </h4>
                  <p className={`text-gray-600 text-sm leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                    {translate('about.qualityAssuranceDesc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className={`font-bold text-lg mb-2 text-gray-800 ${isTamil ? 'tamil-text' : ''}`}>
                    {translate('about.traditionalWisdom')}
                  </h4>
                  <p className={`text-gray-600 text-sm leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                    {translate('about.traditionalWisdomDesc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default OurStorySection;