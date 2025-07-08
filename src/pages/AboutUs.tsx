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
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;

  const values = [
    {
      icon: Heart,
      title: 'Quality First',
      description: 'We prioritize quality in every product we create, ensuring the highest standards of herbal wellness.',
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      icon: Shield,
      title: 'Natural & Safe',
      description: 'All our products are made from natural ingredients, tested for safety and efficacy.',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: Award,
      title: 'Certified Excellence',
      description: 'Our products meet international quality standards and certifications.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Users,
      title: 'Customer Focused',
      description: 'We listen to our customers and continuously improve our products based on feedback.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  const stats = [
    { number: '10+', label: 'Years Experience' },
    { number: '1000+', label: 'Happy Customers' },
    { number: '50+', label: 'Products' },
    { number: '100%', label: 'Natural' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-green-600 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Dharani Herbals</h1>
            <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
              Your trusted partner in natural wellness and herbal healthcare solutions
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Company Overview */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Dharani Herbals was founded with a simple yet powerful vision: to bring the ancient wisdom of 
                  Ayurveda and herbal medicine to modern wellness seekers. Our journey began with a deep respect 
                  for nature's healing power and a commitment to providing authentic, high-quality herbal products.
                </p>
                <p>
                  Located in the heart of Tamil Nadu, we have been serving communities with traditional herbal 
                  remedies and wellness products for over a decade. Our expertise lies in combining time-tested 
                  Ayurvedic formulations with modern quality standards to create products that truly make a difference 
                  in people's lives.
                </p>
                <p>
                  Every product we create is a testament to our dedication to natural wellness, sustainable practices, 
                  and the well-being of our customers. We believe that nature has provided us with everything we need 
                  to maintain optimal health, and our mission is to make these natural solutions accessible to everyone.
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
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To provide authentic, high-quality herbal products that promote natural wellness and healthy living. 
                  We are committed to preserving traditional knowledge while embracing modern quality standards to 
                  deliver effective, safe, and natural healthcare solutions.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To become a leading provider of natural herbal products, making traditional wellness accessible 
                  to people worldwide. We envision a healthier world where natural remedies are the first choice 
                  for maintaining optimal health and well-being.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These values guide everything we do and shape our commitment to natural wellness
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 ${value.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <value.icon className={`w-8 h-8 ${value.color}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-gray-800">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
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
                    <div className="text-sm md:text-base opacity-90">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* What Makes Us Different */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">What Makes Us Different</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our commitment to excellence sets us apart in the herbal wellness industry
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
                    <h3 className="font-bold text-lg mb-2 text-gray-800">100% Natural Ingredients</h3>
                    <p className="text-gray-600 text-sm">
                      We source only the finest natural herbs and ingredients, ensuring purity and potency in every product.
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
                    <h3 className="font-bold text-lg mb-2 text-gray-800">Quality Assurance</h3>
                    <p className="text-gray-600 text-sm">
                      Every product undergoes rigorous testing and quality checks to meet the highest safety standards.
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
                    <h3 className="font-bold text-lg mb-2 text-gray-800">Traditional Wisdom</h3>
                    <p className="text-gray-600 text-sm">
                      Our formulations are based on ancient Ayurvedic principles, refined through generations of knowledge.
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