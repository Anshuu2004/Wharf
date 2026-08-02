import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  User,
  LogOut,
  ChevronDown,
  Mail,
  Calendar,
  Bell,
  BellDot,
  FileText,
  Home,
  Activity,
  Settings,
  MessageSquare,
  Rocket,
  RefreshCw,
  Wrench,
  Shield,
  Hammer,
  Newspaper,
  Logs,
  LayoutDashboard,
  Users as UsersIcon,
} from 'lucide-react';
import { Button, useToast } from '../ui';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import { useAnalytics } from '../../hooks/useAnalytics';

interface Notification {
  id: string;
  title: string;
  message: string;
  publishedAt: string;
  isRead: boolean;
  type: 'FEATURE' | 'UPDATE' | 'FIX' | 'SECURITY' | 'MAINTENANCE' | 'NEWS';
}

export const Header = () => {
  const navigate = useNavigate();
  const analytics = useAnalytics();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  // User State Is Handled By authStore
  const { showToast } = useToast();

  useEffect(() => {
    const handleAuthExpired = () => {
      showToast('Your session has expired. Please log in again.', 'warning');
      logout();
      setTimeout(() => {
        if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
          navigate('/');
        }
      }, 2000);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [logout, showToast, navigate]);

  // Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/user/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    // Poll Every 5 Minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close Menus When Clicking Outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (
        showNotifications &&
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu, showNotifications]);

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/github`;
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    analytics.track('User Logged Out');
    analytics.reset();
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleLogoClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    if (window.location.pathname !== '/') {
      navigate('/');
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic Update
    const prev = [...notifications];
    setNotifications((prevList) =>
      prevList.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );
    try {
      await api.post(`/user/notifications/${id}/read`);
    } catch {
      setNotifications(prev);
    }
  };

  const markAllAsRead = async () => {
    const prev = [...notifications];
    setNotifications((prevList) => prevList.map((notif) => ({ ...notif, isRead: true })));
    try {
      await api.post('/user/notifications/read-all');
    } catch {
      setNotifications(prev);
    }
  };

  const clearNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const getUserDisplay = () => {
    if (user?.username) return user.username;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserInitial = () => {
    if (user?.username) return user.username[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mobile Navigation Links With Icons 
  const mobileNavLinks = [
    { href: '/', label: 'HOME', icon: Home, color: 'text-wharf-cyan-darker' },
    { href: '/generator', label: 'REPO README', icon: FileText, color: 'text-wharf-pink-darker' },
    { href: '/profile', label: 'PROFILE README', icon: UsersIcon, color: 'text-yellow-600' },
    { href: '/chat', label: 'CHAT', icon: MessageSquare, color: 'text-wharf-purple-darker' },
    { href: '/health', label: 'HEALTH', icon: Activity, color: 'text-wharf-green-darker' },
    { href: '/changelog', label: 'CHANGELOG', icon: Logs, color: 'text-wharf-cyan-darker' },
    ...(user ? [{ href: '/settings', label: 'SETTINGS', icon: Settings, color: 'text-wharf-text-secondary' }] : []),
    ...(user?.isAdmin ? [{ href: '/admin', label: 'ADMIN', icon: LayoutDashboard, color: 'text-wharf-error' }] : []),
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'FEATURE':
        return <Rocket className="w-4 h-4 text-wharf-cyan-darker" />;
      case 'UPDATE':
        return <RefreshCw className="w-4 h-4 text-wharf-purple-darker" />;
      case 'FIX':
        return <Wrench className="w-4 h-4 text-yellow-500" />;
      case 'SECURITY':
        return <Shield className="w-4 h-4 text-wharf-error" />;
      case 'MAINTENANCE':
        return <Hammer className="w-4 h-4 text-wharf-orange-darker" />;
      case 'NEWS':
        return <Newspaper className="w-4 h-4 text-wharf-pink-darker" />;
      default:
        return <FileText className="w-4 h-4 text-wharf-cyan-darker" />;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Notification Dropdown Component
  const NotificationDropdown = () => (
    <div className="fixed left-4 right-4 top-[72px] md:absolute md:inset-auto md:right-0 md:top-auto md:mt-2 w-auto md:w-96 md:max-w-sm border-2 border-wharf-border-primary bg-wharf-surface-primary shadow-brutal z-50 rounded-xl">
      <div className="flex items-center justify-between p-4 border-b-2 border-wharf-border-primary bg-wharf-surface-secondary rounded-xl">
        <h3 className="font-display font-black text-lg tracking-tighter">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="font-mono text-xs font-bold text-wharf-pink-dark hover:text-wharf-pink-darker hover:scale-105 cursor-pointer"
          >
            Mark All As Read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-wharf-text-secondary mx-auto mb-2" />
            <p className="font-mono text-sm text-wharf-text-secondary">No Notifications Yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-wharf-border-secondary hover:bg-wharf-surface-secondary transition-colors rounded-xl cursor-pointer ${
                !notification.isRead ? 'bg-wharf-pink/20' : ''
              }`}
              onClick={(e) => markAsRead(notification.id, e)}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-mono font-bold text-sm truncate">{notification.title}</p>
                  </div>
                  <p className="font-mono text-xs text-wharf-text-secondary line-clamp-2">
                    {notification.message}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between flex-shrink-0 ml-1">
                  <div className="flex items-center gap-4 -mt-1">
                    {!notification.isRead && (
                      <span className="font-mono text-[10px] font-bold text-wharf-pink-darker tracking-wider uppercase">
                        Unread
                      </span>
                    )}
                    <button
                      onClick={(e) => clearNotification(notification.id, e)}
                      className="text-wharf-text-secondary hover:text-wharf-error transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="font-mono text-[10px] text-wharf-text-secondary mt-2 text-right whitespace-nowrap">
                    {formatRelativeTime(notification.publishedAt)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 rounded-3xl ${
          scrolled
            ? 'bg-wharf-surface-primary/95 backdrop-blur-sm border-b-2 border-wharf-border-primary'
            : 'bg-wharf-surface-primary border-b-2 border-wharf-border-primary'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-17">
            {/* Left Section - Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 md:-mx-3">
                <div className="cursor-pointer group" onClick={handleLogoClick}>
                  <img
                    src="https://res.cloudinary.com/dhn92qb61/image/upload/w_200,q_auto,f_auto/v1777107144/Wharf_Logo-Photoroom_upscaled_tgvwm2.webp"
                    width="64"
                    height="64"
                    alt="Wharf logo"
                    className="w-14 h-14 md:w-18 md:h-18 object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-display font-black text-2xl tracking-tighter leading-tight">
                    WHARF
                  </h1>
                  <p className="text-[10px] text-wharf-text-secondary uppercase tracking-wide">
                    Ship Code That Speaks
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-4 md:gap-6">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  ref={notificationButtonRef}
                  onClick={toggleNotifications}
                  className="relative w-10 h-10 border-2 border-wharf-border-primary bg-wharf-surface-primary hover:bg-wharf-pink/50 transition-all flex items-center justify-center shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none rounded-xl cursor-pointer"
                  aria-label="Notifications"
                >
                  {unreadCount > 0 ? (
                    <>
                      <BellDot className="w-5 h-5" />
                      <span className="absolute -top-1 -right-2 w-4 h-4 bg-wharf-orange border border-wharf-border-primary text-[10px] font-black flex items-center justify-center rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </>
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && <NotificationDropdown />}
              </div>

              {/* User Menu / Sign In Button */}
              {user ? (
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-2 py-1.5 border-2 border-wharf-border-primary bg-wharf-surface-primary hover:bg-wharf-surface-secondary transition-all group rounded-lg cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-wharf-purple border border-wharf-border-primary flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-wharf-black">{getUserInitial()}</span>
                      )}
                    </div>
                    <span className="hidden lg:block font-mono text-sm font-bold">
                      {getUserDisplay()}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-80 border-2 border-wharf-border-primary bg-wharf-surface-primary shadow-brutal z-50">
                      <div className="p-4 border-b-2 border-wharf-border-primary bg-wharf-surface-secondary">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-wharf-pink border-2 border-wharf-border-primary flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg font-black text-wharf-black">
                                {getUserInitial()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-display font-black text-lg tracking-tighter">
                              {getUserDisplay()}
                            </p>
                            <p className="font-mono text-xs flex items-center gap-1 text-wharf-text-tertiary">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border-b-2 border-wharf-border-primary bg-wharf-surface-tertiary">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Joined{' '}
                            {user?.githubCreatedAt
                              ? new Intl.DateTimeFormat('en-US', {
                                  month: 'short',
                                  year: 'numeric',
                                }).format(new Date(user.githubCreatedAt))
                              : 'Recent'}
                          </span>
                        </div>
                        {user.username && (
                          <div className="flex items-center gap-2 font-mono text-xs mt-1">
                            <User className="w-3 h-3" />
                            <span>{user.username}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-3 py-2 text-left font-mono text-sm font-bold text-yellow-500 hover:text-wharf-error transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Sign In Button */
                <div className="hidden md:block">
                  <Button variant="primary" size="md" onClick={handleLogin}>
                    Sign In
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden relative w-10 h-10 border-2 border-wharf-border-primary bg-wharf-surface-primary hover:bg-wharf-pink/20 transition-all duration-300 flex items-center justify-center shadow-brutal-sm hover:shadow-none rounded-xl group"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <span
                    className={`absolute h-0.5 w-5 bg-wharf-text-primary rounded-full transition-all duration-300 ease-in-out ${
                      isMobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'
                    }`}
                  />
                  <span
                    className={`absolute h-0.5 w-5 bg-wharf-text-primary rounded-full transition-all duration-300 ease-in-out ${
                      isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  <span
                    className={`absolute h-0.5 w-5 bg-wharf-text-primary rounded-full transition-all duration-300 ease-in-out ${
                      isMobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed left-4 right-4 top-[72px] bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal z-40 max-h-[calc(100vh-[90px])] overflow-y-auto animate-slideDown rounded-xl">
              {/* User Profile Section */}
              {user ? (
                <div className="p-5 border-b-2 border-wharf-border-primary bg-gradient-to-r from-wharf-surface-secondary to-wharf-surface-tertiary rounded-t-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-wharf-pink to-wharf-purple border-2 border-wharf-border-primary flex items-center justify-center overflow-hidden shadow-brutal-sm">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-black text-wharf-black">
                          {getUserInitial()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-black text-lg tracking-tighter text-wharf-text-primary">
                        {getUserDisplay()}
                      </p>
                      <p className="font-mono text-xs text-wharf-text-secondary flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-mono text-[10px] text-wharf-text-tertiary flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined{' '}
                          {user?.githubCreatedAt
                            ? new Intl.DateTimeFormat('en-US', {
                                month: 'short',
                                year: 'numeric',
                              }).format(new Date(user.githubCreatedAt))
                            : 'Recent'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 border-b-2 border-wharf-border-primary bg-gradient-to-r from-wharf-surface-secondary to-wharf-surface-tertiary">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-black text-xl tracking-tighter text-wharf-text-primary">
                        Welcome to Wharf
                      </p>
                      <p className="font-mono text-xs text-wharf-text-secondary mt-1 capitalize">
                        Sign in to access all features
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogin();
                      }}
                      className="px-4 py-2.5 font-mono font-bold text-sm border-2 border-wharf-border-primary bg-wharf-pink hover:bg-wharf-pink-dark transition-all shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 rounded-2xl"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="py-3 px-4">
                <p className="font-mono text-sm font-bold text-wharf-text-secondary uppercase tracking-wider px-4 py-2">
                  Navigation
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {mobileNavLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 px-4 py-3.5 font-mono font-bold text-sm uppercase tracking-wider border-2 border-wharf-border-secondary hover:border-wharf-border-primary bg-wharf-surface-secondary hover:bg-wharf-surface-primary transition-all duration-200 rounded-2xl group shadow-sm hover:shadow-brutal-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={`${link.color} transition-transform group-hover:scale-110`}>
                        <link.icon className="w-5 h-5" />
                      </div>
                      <span className="text-wharf-text-primary text-xs">{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Sign Out */}
              {user && (
                <div className="py-3 px-4 border-t-2 border-wharf-border-primary">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 font-mono font-bold text-sm border-2 border-wharf-border-primary/60 hover:border-wharf-error bg-wharf-surface-secondary hover:bg-wharf-error/10 transition-all rounded-2xl text-yellow-600 hover:text-wharf-error cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16 md:h-20" />
    </>
  );
};