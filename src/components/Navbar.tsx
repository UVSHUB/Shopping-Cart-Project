import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Sun, Moon, Search, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Sync state with current theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('color-scheme') as 'light' | 'dark';
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Synchronize class list and style color-scheme
  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!localStorage.getItem('color-scheme')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('color-scheme', nextTheme);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-app-border backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">SmartCart</span>
            </Link>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative">
            <input
              type="text"
              placeholder="Search fresh vegetables, fruits, dairy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full text-sm glass-input text-app-text border border-app-border"
            />
            <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-gray-400" />
            <button type="submit" className="hidden" />
          </form>

          {/* Desktop Navigation Links & Action Controls */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              to="/products"
              className={`text-sm font-medium hover:text-primary transition-colors ${
                location.pathname === '/products' ? 'text-primary font-semibold' : 'text-app-text'
              }`}
            >
              Shop Grocery
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-full text-app-text hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-accent" /> : <Moon className="h-5 w-5 text-gray-500" />}
            </button>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="p-2 rounded-full text-app-text hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 px-3 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-app-text"
                  >
                    <User className="h-5 w-5 text-primary" />
                    <span>Hi, {user.name.split(' ')[0]}</span>
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <>
                        {/* Overlay backdrop to dismiss dropdown */}
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setProfileDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-48 rounded-2xl glass-panel shadow-lg py-1 z-40 text-app-text"
                        >
                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-slate-850"
                            >
                              <LayoutDashboard className="h-4 w-4 text-primary" />
                              Admin Portal
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              logout();
                              navigate('/login');
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <LogOut className="h-4 w-4" />
                            Log Out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover px-4.5 py-2 rounded-full transition-colors shadow-sm"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-full text-app-text hover:bg-gray-100 dark:hover:bg-slate-850"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-accent" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link
              to="/cart"
              className="p-2 rounded-full text-app-text hover:bg-gray-100 dark:hover:bg-slate-850 relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full text-app-text hover:bg-gray-100 dark:hover:bg-slate-850"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t border-app-border"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full text-sm glass-input text-app-text"
                />
                <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-gray-400" />
              </form>

              <div className="flex flex-col gap-3 font-medium text-app-text">
                <Link
                  to="/products"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 hover:text-primary border-b border-app-border/40"
                >
                  Shop Grocery
                </Link>

                {user && user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="py-2 hover:text-primary flex items-center gap-2 border-b border-app-border/40"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Portal
                  </Link>
                )}

                {user ? (
                  <div className="pt-2">
                    <p className="text-xs text-gray-400">Logged in as</p>
                    <p className="text-sm font-semibold">{user.name}</p>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="mt-3 flex items-center gap-1.5 text-sm text-red-500 font-semibold"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 text-center py-2.5 rounded-full text-sm font-semibold text-white bg-primary hover:bg-primary-hover"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
