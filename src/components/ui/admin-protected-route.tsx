import { useMember } from '@/integrations';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Shield, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  messageToSignIn?: string;
}

// Check for development admin session
const hasDevAdminSession = (): boolean => {
  try {
    const session = localStorage.getItem('devAdminSession');
    if (session) {
      const parsed = JSON.parse(session);
      console.log('Dev admin session found:', parsed); // Debug log
      return parsed.isAdmin === true;
    }
    console.log('No dev admin session found'); // Debug log
  } catch (error) {
    console.error('Error checking dev admin session:', error);
    // Clear corrupted session data
    localStorage.removeItem('devAdminSession');
  }
  return false;
};

// For demo purposes, we'll simulate admin roles based on email patterns
// In a real app, this would come from the user's profile data
const isAdminOrCounselor = (member: any): boolean => {
  if (!member?.loginEmail) return false;
  
  // Check if user is admin or counselor based on email patterns
  const email = member.loginEmail.toLowerCase();
  
  // Admin emails (you can customize these patterns)
  const adminPatterns = [
    'admin@',
    'administrator@',
    'support@',
    'staff@'
  ];
  
  // Counselor emails (you can customize these patterns)
  const counselorPatterns = [
    'counselor@',
    'therapist@',
    'psychologist@',
    'mental-health@'
  ];
  
  // Check if email matches admin or counselor patterns
  const isAdmin = adminPatterns.some(pattern => email.includes(pattern));
  const isCounselor = counselorPatterns.some(pattern => email.includes(pattern));
  
  return isAdmin || isCounselor;
};

export function AdminProtectedRoute({ 
  children, 
  messageToSignIn = "Sign in to access the admin dashboard" 
}: AdminProtectedRouteProps) {
  const { member, isAuthenticated, isLoading } = useMember();

  // Check for development admin session first
  const hasDevSession = hasDevAdminSession();
  
  console.log('AdminProtectedRoute - hasDevSession:', hasDevSession); // Debug log
  console.log('AdminProtectedRoute - isLoading:', isLoading); // Debug log
  console.log('AdminProtectedRoute - isAuthenticated:', isAuthenticated); // Debug log
  
  if (hasDevSession) {
    console.log('Allowing access via dev session'); // Debug log
    return <>{children}</>;
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="font-paragraph text-gray-600 mt-4">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show sign-in prompt with dev login option
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-8">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
            Admin Access Required
          </h1>
          
          <p className="font-paragraph text-gray-600 mb-8">
            {messageToSignIn}
          </p>
          
          <div className="space-y-4">
            <Link
              to="/admin-login"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-paragraph font-medium hover:bg-blue-700 transition-colors block"
            >
              Development Admin Login
            </Link>
            
            <button
              onClick={() => window.location.href = '/api/auth/login'}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-paragraph font-medium hover:bg-primary/90 transition-colors"
            >
              Sign In with Account
            </button>
            
            <Link
              to="/"
              className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-paragraph font-medium hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated but not admin/counselor, show access denied
  if (!isAdminOrCounselor(member)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-8">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
            Access Denied
          </h1>
          
          <p className="font-paragraph text-gray-600 mb-8">
            You don't have permission to access the admin dashboard. This area is restricted to administrators and counselors only.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="font-paragraph text-sm text-blue-800">
              <strong>Need admin access?</strong> Contact your system administrator to request the appropriate permissions.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link
              to="/admin-login"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-paragraph font-medium hover:bg-blue-700 transition-colors"
            >
              Development Admin Login
            </Link>
            
            <Link
              to="/"
              className="block w-full bg-primary text-primary-foreground py-3 rounded-lg font-paragraph font-medium hover:bg-primary/90 transition-colors"
            >
              Back to Home
            </Link>
            
            <Link
              to="/chat"
              className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-paragraph font-medium hover:bg-gray-200 transition-colors"
            >
              Get Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated and has admin/counselor role, render the protected content
  return <>{children}</>;
}

// Helper function to check if current user has admin access (for conditional rendering)
export function useIsAdminOrCounselor(): boolean {
  const { member, isAuthenticated } = useMember();
  
  // Check for development admin session first
  const hasDevSession = hasDevAdminSession();
  console.log('useIsAdminOrCounselor - hasDevSession:', hasDevSession); // Debug log
  
  if (hasDevSession) {
    return true;
  }
  
  if (!isAuthenticated || !member) return false;
  
  return isAdminOrCounselor(member);
}