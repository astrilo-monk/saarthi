import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle, Users, LogIn, LogOut, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Image } from '@/components/ui/image';
import { useAuth } from '@/hooks/useAuth';

export default function Layout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Restore session on mount
  useEffect(() => {
    useAuth.getState().restoreSession();
  }, []);

  const navigation = [
    { name: 'Forum', href: '/forum', icon: Users },
    { name: 'Chat Support', href: '/chat', icon: MessageCircle },
    { name: 'Help', href: '/#helplines', icon: Phone },
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

            {/* Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-paragraph text-sm hover:bg-primary/90 transition-colors inline-flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
              {isAuthenticated && user && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-foreground font-paragraph text-sm font-medium">
                      {user.anonymousName}
                    </span>
                    {user.role === 'COLLEGE_USER' && (
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-paragraph">
                        {user.collegeName}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={logout}
                    className="text-gray-500 hover:text-foreground font-paragraph text-sm inline-flex items-center space-x-1 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
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
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-paragraph text-sm hover:bg-primary/90 transition-colors inline-flex items-center justify-center space-x-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                )}
                {isAuthenticated && user && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-3 py-2">
                      <span className="text-foreground font-paragraph text-sm font-medium">
                        {user.anonymousName}
                      </span>
                      {user.role === 'COLLEGE_USER' && (
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-paragraph">
                          {user.collegeName}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="block w-full text-left text-gray-500 hover:text-foreground font-paragraph text-sm px-3 py-2"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                A private, anonymous mental health support system for college students.
                Your well-being matters. Your identity stays protected.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-sm font-bold text-foreground mb-4">Emergency Helplines</h3>
              <div className="space-y-2">
                <p className="font-paragraph text-sm text-gray-600">iCall:</p>
                <p className="font-paragraph text-sm font-bold text-destructive">022 2556 3291</p>
                <p className="font-paragraph text-sm text-gray-600">Vandrevala Foundation:</p>
                <p className="font-paragraph text-sm font-bold text-destructive">1860-2662-345</p>
                <p className="font-paragraph text-sm text-gray-600">AASRA:</p>
                <p className="font-paragraph text-sm font-bold text-destructive">9820466726</p>
                <p className="font-paragraph text-xs text-gray-500 mt-2">Available 24/7</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-8 pt-8 text-center">
            <p className="font-paragraph text-sm text-gray-600">
              © 2025 Saarthi. All rights reserved. Your privacy and anonymity are guaranteed.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}