import { useMember } from '@/integrations';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Menu, X, MessageCircle, Calendar, BookOpen, Users, BarChart3, Gamepad2 } from 'lucide-react';
import { useState } from 'react';
import { Image } from '@/components/ui/image';
import { useIsAdminOrCounselor } from '@/components/ui/admin-protected-route';
import SearchBar from '@/components/SearchBar';

export default function Layout() {
  const { member, isAuthenticated, isLoading, actions } = useMember();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAdminOrCounselor = useIsAdminOrCounselor();

  const navigation = [
    { name: 'Home', href: '/', icon: null },
    { name: 'Chat Support', href: '/chat', icon: MessageCircle },
    { name: 'Book Counselor', href: '/booking', icon: Calendar },
    { name: 'Resources', href: '/resources', icon: BookOpen },
    { name: 'Forum', href: '/forum', icon: Users },
    { name: 'Mindful Garden', href: '/plant-game', icon: Gamepad2 },
    // Only show admin dashboard for admin/counselor users
    ...(isAdminOrCounselor ? [{ name: 'Admin Dashboard', href: '/admin', icon: BarChart3 }] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-[120rem] mx-auto px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <Image
                src="/images/logo.png"
                alt="Saarthi Logo - Helping hands representing support and care"
                width={40}
                className="w-10 h-8 object-contain"
              />
              <span className="font-heading text-xl font-bold text-foreground">Saarthi</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-gray-50'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="font-paragraph text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Search and Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              <SearchBar />
              {isLoading && <LoadingSpinner />}
              {!isAuthenticated && (
                <button
                  onClick={actions.login}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-paragraph text-sm hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </button>
              )}
              {isAuthenticated && (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="text-foreground hover:text-primary font-paragraph text-sm"
                  >
                    {member?.profile?.nickname || 'Profile'}
                  </Link>
                  <button
                    onClick={actions.logout}
                    className="text-foreground hover:text-primary font-paragraph text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-foreground hover:bg-gray-50"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-gray-50'
                      }`}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      <span className="font-paragraph text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              
              {/* Mobile Auth */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                {isLoading && <LoadingSpinner />}
                {!isAuthenticated && (
                  <button
                    onClick={actions.login}
                    className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-paragraph text-sm hover:bg-primary/90 transition-colors"
                  >
                    Sign In
                  </button>
                )}
                {isAuthenticated && (
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-foreground hover:text-primary font-paragraph text-sm px-3 py-2"
                    >
                      {member?.profile?.nickname || 'Profile'}
                    </Link>
                    <button
                      onClick={actions.logout}
                      className="block w-full text-left text-foreground hover:text-primary font-paragraph text-sm px-3 py-2"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-20">
        <div className="max-w-[120rem] mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/images/logo.png"
                  alt="Saarthi Logo - Helping hands representing support and care"
                  width={32}
                  className="w-8 h-6 object-contain"
                />
                <span className="font-heading text-xl font-bold text-foreground">Saarthi</span>
              </div>
              <p className="font-paragraph text-gray-600 max-w-md">
                A digital sanctuary providing confidential mental health support for college students. 
                Your well-being is our priority.
              </p>
            </div>
            
            <div>
              <h3 className="font-heading text-sm font-bold text-foreground mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/chat" className="font-paragraph text-sm text-gray-600 hover:text-primary">Chat Support</Link></li>
                <li><Link to="/booking" className="font-paragraph text-sm text-gray-600 hover:text-primary">Book Counselor</Link></li>
                <li><Link to="/resources" className="font-paragraph text-sm text-gray-600 hover:text-primary">Resources</Link></li>
                <li><Link to="/forum" className="font-paragraph text-sm text-gray-600 hover:text-primary">Peer Forum</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-heading text-sm font-bold text-foreground mb-4">Emergency</h3>
              <div className="space-y-2">
                <p className="font-paragraph text-sm text-gray-600">Crisis Helplines:</p>
                <p className="font-paragraph text-sm font-bold text-destructive">022 2754 6669</p>
                <p className="font-paragraph text-sm font-bold text-destructive">1800-599-0019</p>
                <p className="font-paragraph text-sm text-gray-600">Available 24/7</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-8 pt-8 text-center">
            <p className="font-paragraph text-sm text-gray-600">
              © 2024 Saarthi. All rights reserved. Your privacy and confidentiality are protected.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}