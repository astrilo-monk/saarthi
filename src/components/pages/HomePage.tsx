import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Calendar, BookOpen, Shield, Users, Heart, CheckCircle, Gamepad2 } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useEffect, useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { Testimonials } from '@/entities/testimonials';

export default function HomePage() {
  const [testimonials, setTestimonials] = useState<Testimonials[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { items } = await BaseCrudService.getAll<Testimonials>('testimonials');
        setTestimonials(items.filter(t => t.isApproved).slice(0, 3));
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };

    fetchTestimonials();
  }, []);

  const features = [
    {
      icon: MessageCircle,
      title: 'AI Chat Support',
      description: 'Get immediate support through our confidential AI chatbot available 24/7.',
      link: '/chat'
    },
    {
      icon: Calendar,
      title: 'Book a Counselor',
      description: 'Schedule appointments with licensed mental health professionals.',
      link: '/booking'
    },
    {
      icon: BookOpen,
      title: 'Resource Hub',
      description: 'Access guided meditations, articles, and wellness tools.',
      link: '/resources'
    },
    {
      icon: Users,
      title: 'Peer Support',
      description: 'Connect anonymously with other students in our safe forum.',
      link: '/forum'
    },
    {
      icon: Gamepad2,
      title: 'Mindful Garden',
      description: 'Nurture your virtual plant by completing daily wellness tasks.',
      link: '/plant-game'
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Complete Privacy',
      description: 'Your conversations and data are completely confidential and secure.'
    },
    {
      icon: Heart,
      title: 'Stigma-Free Support',
      description: 'Access mental health resources without judgment or stigma.'
    },
    {
      icon: CheckCircle,
      title: 'Available 24/7',
      description: 'Get support whenever you need it, day or night.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        className="h-screen grid place-items-center bg-gradient-to-br from-background via-mint-green/20 to-light-green/30 px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.8 } }}
      >
        <div className="max-w-[120rem] mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-dark-green via-primary to-sage-green bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.8 } }}
          >
            Confidential Mental Health Support for Students
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-600 font-paragraph max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.8 } }}
          >
            A safe, private space where college students can access mental health resources, 
            connect with peers, and find the support they need to thrive.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.8 } }}
          >
            <Link
              to="/chat"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-paragraph font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat Now</span>
            </Link>
            
            <Link
              to="/booking"
              className="bg-sage-green text-white border border-sage-green px-8 py-4 rounded-lg font-paragraph font-medium hover:bg-sage-green/90 transition-all hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Book a Counselor</span>
            </Link>
            
            <Link
              to="/resources"
              className="bg-light-green text-dark-green border border-light-green px-8 py-4 rounded-lg font-paragraph font-medium hover:bg-light-green/90 transition-all hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>Explore Resources</span>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-[120rem] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-heading font-bold text-foreground mb-6">
                About Saarthi
              </h2>
              <p className="text-lg font-paragraph text-gray-600 mb-6">
                Saarthi is more than a platform—it's a digital sanctuary designed specifically for college students 
                navigating mental health challenges. We understand the unique pressures of academic life and provide 
                confidential, accessible support when you need it most.
              </p>
              <p className="text-lg font-paragraph text-gray-600 mb-8">
                Our mission is to break down barriers to mental health care, eliminate stigma, and create a 
                supportive community where every student feels heard, valued, and empowered.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-sage-green rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-heading font-bold text-foreground mb-2">{benefit.title}</h3>
                      <p className="font-paragraph text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="relative">
              <Image
                src="/images/about.png"
                alt="Students supporting each other in a calm, welcoming environment"
                width={600}
                className="rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8 bg-gradient-to-r from-mint-green/10 via-background to-light-green/10">
        <div className="max-w-[120rem] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-foreground mb-6">
              How We Support You
            </h2>
            <p className="text-lg font-paragraph text-gray-600 max-w-3xl mx-auto">
              Access comprehensive mental health support through multiple channels designed 
              to meet you where you are in your wellness journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colors = [
                'bg-primary/10 text-primary hover:bg-primary/20',
                'bg-sage-green/10 text-sage-green hover:bg-sage-green/20', 
                'bg-light-green/10 text-dark-green hover:bg-light-green/20',
                'bg-mint-green/10 text-dark-green hover:bg-mint-green/20',
                'bg-purple-100 text-purple-600 hover:bg-purple-200'
              ];
              return (
                <Link
                  key={index}
                  to={feature.link}
                  className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:scale-105 group border border-gray-100 hover:border-sage-green/30"
                >
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors ${colors[index]}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="font-paragraph text-gray-600">{feature.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-[120rem] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-foreground mb-6">
              Student Experiences
            </h2>
            <p className="text-lg font-paragraph text-gray-600 max-w-3xl mx-auto">
              Hear from students who have found support and healing through Saarthi.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial._id} className="bg-gradient-to-br from-mint-green/20 to-light-green/30 p-8 rounded-2xl border border-sage-green/20 hover:border-sage-green/40 transition-colors">
                <div className="flex items-center mb-6">
                  {testimonial.studentPhoto && (
                    <Image
                      src={testimonial.studentPhoto}
                      alt={`${testimonial.studentName} profile photo`}
                      width={48}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                  )}
                  <div>
                    <h3 className="font-heading font-bold text-foreground">{testimonial.studentName}</h3>
                    <p className="font-paragraph text-sm text-gray-600">{testimonial.programOfStudy}</p>
                  </div>
                </div>
                <blockquote className="font-paragraph text-gray-700 italic">
                  "{testimonial.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-gradient-to-r from-sage-green/10 via-mint-green/10 to-light-green/10">
        <div className="max-w-[120rem] mx-auto text-center">
          <h2 className="text-4xl font-heading font-bold text-foreground mb-6">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-lg font-paragraph text-gray-600 max-w-3xl mx-auto mb-12">
            Take the first step towards better mental health. Our platform is here to support you 
            every step of the way, with complete privacy and confidentiality.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/chat"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-paragraph font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Start Chatting</span>
            </Link>
            
            <Link
              to="/resources"
              className="bg-sage-green text-white border border-sage-green px-8 py-4 rounded-lg font-paragraph font-medium hover:bg-sage-green/90 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Browse Resources
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}