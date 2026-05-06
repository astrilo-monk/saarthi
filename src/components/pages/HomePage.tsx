import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Shield, Lock, Heart, ArrowRight, Phone, GraduationCap } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Users,
      title: 'Anonymous Forum',
      description: 'Connect with peers from your campus. Share experiences, seek advice — all anonymously.',
      link: '/forum',
      cta: 'Open Forum',
      gradient: 'from-primary/10 to-sage-green/10 dark:from-primary/20 dark:to-sage-green/20',
      iconBg: 'bg-primary/15 text-primary',
    },
    {
      icon: MessageCircle,
      title: 'AI Chat Support',
      description: 'Get immediate, confidential support through our AI companion. Available 24/7, no judgment.',
      link: '/chat',
      cta: 'Start Chat',
      gradient: 'from-sage-green/10 to-mint-green/10 dark:from-sage-green/20 dark:to-mint-green/20',
      iconBg: 'bg-sage-green/15 text-sage-green',
    },
    {
      icon: Phone,
      title: 'Crisis Helplines',
      description: 'Immediate access to professional crisis support. Real humans, real help, right now.',
      link: '#helplines',
      cta: 'View Helplines',
      gradient: 'from-mint-green/10 to-light-green/10 dark:from-mint-green/20 dark:to-light-green/20',
      iconBg: 'bg-mint-green/15 text-dark-green dark:text-green-400',
    },
  ];

  const trustPoints = [
    {
      icon: Lock,
      title: 'Fully Anonymous',
      description: 'Auto-generated usernames. No real names, no tracking, no data leakage.',
    },
    {
      icon: Shield,
      title: 'Campus-Only Access',
      description: 'Verified college email ensures only your peers are in your campus forum.',
    },
    {
      icon: Heart,
      title: 'Zero Judgment',
      description: 'A safe space designed by students, for students. Every voice matters here.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        className="min-h-[85vh] grid place-items-center bg-gradient-to-br from-background via-mint-green/15 to-light-green/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-8 transition-colors duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.8 } }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="inline-block bg-primary/10 dark:bg-primary/20 text-primary dark:text-green-400 px-4 py-2 rounded-full font-paragraph text-sm font-medium mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.6 } }}
          >
            🎓 Private. Anonymous. For your college.
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground dark:text-gray-100 mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.8 } }}
          >
            Private mental health space{' '}
            <span className="bg-gradient-to-r from-primary via-sage-green to-dark-green dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              for your college
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-paragraph max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.8 } }}
          >
            Talk anonymously with peers, get AI support, and access help —
            all within a private space exclusive to your college.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.7, duration: 0.8 } }}
          >
            {isAuthenticated ? (
              <>
                <Link
                  to="/forum"
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-paragraph font-medium hover:bg-primary/90 transition-all hover:scale-[1.03] shadow-lg hover:shadow-xl inline-flex items-center space-x-2 text-base"
                >
                  <Users className="w-5 h-5" />
                  <span>{user?.role === 'COLLEGE_USER' ? `Enter ${user.collegeName} Forum` : 'Enter the Forum'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/chat"
                  className="bg-white dark:bg-gray-800 text-foreground dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl font-paragraph font-medium hover:border-primary/40 dark:hover:border-green-500/40 transition-all hover:scale-[1.03] shadow-sm hover:shadow-md inline-flex items-center space-x-2 text-base"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat with AI</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-paragraph font-medium hover:bg-primary/90 transition-all hover:scale-[1.03] shadow-lg hover:shadow-xl inline-flex items-center space-x-2 text-base"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Continue with college email</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/chat"
                  className="bg-white dark:bg-gray-800 text-foreground dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl font-paragraph font-medium hover:border-primary/40 dark:hover:border-green-500/40 transition-all hover:scale-[1.03] shadow-sm hover:shadow-md inline-flex items-center space-x-2 text-base"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat with AI</span>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground dark:text-gray-100 mb-4">
              Three ways we support you
            </h2>
            <p className="text-lg font-paragraph text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              No sign-up walls. No complicated features. Just the help you need, when you need it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                >
                  <Link
                    to={feature.link}
                    className={`block bg-gradient-to-br ${feature.gradient} p-8 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-primary/20 dark:hover:border-green-500/30 transition-all hover:shadow-lg hover:scale-[1.02] group h-full`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.iconBg}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-foreground dark:text-gray-100 mb-3 group-hover:text-primary dark:group-hover:text-green-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="font-paragraph text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <span className="font-paragraph text-primary dark:text-green-400 font-medium inline-flex items-center space-x-1 text-sm">
                      <span>{feature.cta}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-8 bg-gradient-to-r from-mint-green/5 via-background to-light-green/5 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground dark:text-gray-100 mb-4">
              Built on trust
            </h2>
            <p className="text-lg font-paragraph text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Saarthi is designed with privacy as the foundation. We don't store personal data. We don't share identities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-sage-green rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-foreground dark:text-gray-100 text-lg mb-3">{point.title}</h3>
                  <p className="font-paragraph text-gray-600 dark:text-gray-400 leading-relaxed">{point.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Helplines Section */}
      <section id="helplines" className="py-20 px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground dark:text-gray-100 mb-4">
            Need help right now?
          </h2>
          <p className="text-lg font-paragraph text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
            If you or someone you know is in crisis, reach out immediately. These helplines are free, confidential, and available 24/7.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl p-6">
              <Phone className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-heading font-bold text-foreground dark:text-gray-100 mb-1">iCall</h3>
              <p className="font-paragraph text-2xl font-bold text-red-600 dark:text-red-400 mb-1">022 2556 3291</p>
              <p className="font-paragraph text-sm text-gray-500 dark:text-gray-500">Mon-Sat, 8am-10pm</p>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl p-6">
              <Phone className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-heading font-bold text-foreground dark:text-gray-100 mb-1">Vandrevala Foundation</h3>
              <p className="font-paragraph text-2xl font-bold text-red-600 dark:text-red-400 mb-1">1860-2662-345</p>
              <p className="font-paragraph text-sm text-gray-500 dark:text-gray-500">24/7 Helpline</p>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl p-6">
              <Phone className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-heading font-bold text-foreground dark:text-gray-100 mb-1">AASRA</h3>
              <p className="font-paragraph text-2xl font-bold text-red-600 dark:text-red-400 mb-1">9820466726</p>
              <p className="font-paragraph text-sm text-gray-500 dark:text-gray-500">24/7 Helpline</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-8 bg-gradient-to-r from-primary/5 via-sage-green/5 to-mint-green/5 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground dark:text-gray-100 mb-4">
            You don't have to face this alone.
          </h2>
          <p className="text-lg font-paragraph text-gray-600 dark:text-gray-400 mb-8">
            Join your campus community. Talk anonymously. Get support.
          </p>
          {isAuthenticated ? (
            <Link
              to="/forum"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-paragraph font-medium hover:bg-primary/90 transition-all hover:scale-[1.03] shadow-lg hover:shadow-xl inline-flex items-center space-x-2 text-base"
            >
              <span>Enter the Forum</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-paragraph font-medium hover:bg-primary/90 transition-all hover:scale-[1.03] shadow-lg hover:shadow-xl inline-flex items-center space-x-2 text-base"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Continue with college email</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}