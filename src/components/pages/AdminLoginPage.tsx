import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminCredentials {
  username: string;
  password: string;
}

const ADMIN_CREDENTIALS: AdminCredentials[] = [
  { username: 'admin', password: 'admin' },
  { username: 'admin2', password: 'admin2' }
];

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials
    const isValidCredentials = ADMIN_CREDENTIALS.some(
      cred => cred.username === username && cred.password === password
    );

    if (isValidCredentials) {
      // Store admin session in localStorage for development
      const sessionData = {
        username,
        loginTime: new Date().toISOString(),
        isAdmin: true
      };
      
      console.log('Storing admin session:', sessionData); // Debug log
      localStorage.setItem('devAdminSession', JSON.stringify(sessionData));
      
      // Verify the session was stored correctly
      const storedSession = localStorage.getItem('devAdminSession');
      console.log('Stored session verification:', storedSession); // Debug log

      // Redirect to admin dashboard
      navigate('/admin');
    } else {
      setError('Invalid username or password. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Admin Login
          </h1>
          <p className="text-blue-200 font-paragraph">
            Development access to admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block font-paragraph font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-paragraph"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-paragraph font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-paragraph pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="font-paragraph text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-paragraph font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Development Info */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-paragraph font-bold text-yellow-800 mb-2">
              Development Credentials
            </h3>
            <div className="space-y-1 text-sm font-paragraph text-yellow-700">
              <p><strong>Username:</strong> admin | <strong>Password:</strong> admin</p>
              <p><strong>Username:</strong> admin2 | <strong>Password:</strong> admin2</p>
            </div>
            <p className="text-xs font-paragraph text-yellow-600 mt-2">
              ⚠️ This is for development only. Remove before production.
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800 font-paragraph text-sm transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}