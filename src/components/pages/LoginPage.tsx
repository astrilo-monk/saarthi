import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Shield, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    await login(email.trim());

    // If login succeeded (no error), redirect to forum
    const state = useAuth.getState();
    if (state.isAuthenticated) {
      navigate('/forum');
    }
  };

  const isCollegeEmail = email.includes('@') && (
    email.endsWith('.ac.in') || email.endsWith('.edu') || email.endsWith('.edu.in')
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-8 bg-gradient-to-br from-background via-mint-green/10 to-light-green/15">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-sage-green rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-3">
            Join Saarthi
          </h1>
          <p className="font-paragraph text-gray-600">
            Enter your email to continue. College emails get access to your campus forum.
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-paragraph font-medium text-foreground mb-2 text-sm">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  placeholder="you@college.ac.in"
                  required
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-paragraph transition-all"
                />
              </div>
            </div>

            {/* Role indicator */}
            {email.includes('@') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`p-3 rounded-xl text-sm font-paragraph ${
                  isCollegeEmail
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-blue-50 border border-blue-200 text-blue-700'
                }`}
              >
                {isCollegeEmail ? (
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>🎓 College email detected — you'll get campus forum access</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>You'll join as a public user with global forum access</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm font-paragraph flex items-center space-x-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-paragraph font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy note */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="font-paragraph text-xs text-gray-500 text-center">
              🔒 Your identity stays anonymous. We generate a random name for you.
              No personal data is shared in the forum.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
