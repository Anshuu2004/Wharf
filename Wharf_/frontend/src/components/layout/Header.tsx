import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Mail,
  Calendar,
  Bell,
  BellDot,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Home,
  GitBranch,
  Activity,
  BarChart3,
  Settings,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'success' | 'info' | 'warning' | 'mention';
}

export const Header = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Documentation Generated',
      message: 'Your README for "awesome-project" has been generated successfully.',
      time: '2 min ago',
      read: false,
      type: 'success',
    },
    {
      id: '2',
      title: 'New Feature',
      message: 'Tree map generator is now available! Visualize your repo structure.',
      time: '1 hour ago',
      read: false,
      type: 'info',
    },
    {
      id: '3',
      title: 'Health Score Updated',
      message: 'Your repository health score has been recalculated.',
      time: '3 hours ago',
      read: true,
      type: 'success',
    },
    {
      id: '4',
      title: 'Mentioned in Discussion',
      message: '@developer mentioned you in a documentation thread.',
      time: '1 day ago',
      read: true,
      type: 'mention',
    },
  ]);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  // Mock User State
  useEffect(() => {
    // TODO: Replace with actual auth check
    const mockUser = null;
    setUser(mockUser);
  }, []);

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
    navigate('/login');
  };

  const handleLogout = async () => {
    setUser(null);
    setShowUserMenu(false);
    navigate('/');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    setShowUserMenu(false);
  };

  const handleSettings = () => {
    navigate('/settings');
    setShowUserMenu(false);
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

  const markAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const clearNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const getUserDisplay = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserInitial = () => {
    if (user?.name) return user.name[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mobile Navigation Links
  const mobileNavLinks = [
    { href: '/', label: 'HOME', icon: Home },
    { href: '/generator', label: 'GENERATOR', icon: FileText },
    { href: '/treemap', label: 'TREE MAP', icon: GitBranch },
    { href: '/health', label: 'HEALTH', icon: Activity },
    { href: '/analytics', label: 'ANALYTICS', icon: BarChart3 },
    { href: '/settings', label: 'SETTINGS', icon: Settings },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-wharf-green" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-wharf-yellow" />;
      case 'mention':
        return <Users className="w-4 h-4 text-wharf-purple" />;
      default:
        return <FileText className="w-4 h-4 text-wharf-cyan" />;
    }
  };

  // Notification Dropdown Component
  const NotificationDropdown = () => (
    <div className="absolute -right-14 mt-2 w-96 border-2 border-wharf-border-primary bg-wharf-surface-primary shadow-brutal z-50">
      <div className="flex items-center justify-between p-4 border-b-2 border-wharf-border-primary bg-wharf-surface-secondary">
        <h3 className="font-display font-black text-lg tracking-tighter">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="font-mono text-xs font-bold text-wharf-pink hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-wharf-text-tertiary mx-auto mb-2" />
            <p className="font-mono text-sm text-wharf-text-tertiary">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-wharf-border-secondary hover:bg-wharf-surface-secondary transition-colors cursor-pointer ${
                !notification.read ? 'bg-wharf-pink/5' : ''
              }`}
              onClick={(e) => markAsRead(notification.id, e)}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-mono font-bold text-sm">{notification.title}</p>
                    <span className="font-mono text-[10px] text-wharf-text-tertiary">
                      {notification.time}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-wharf-text-secondary">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={(e) => clearNotification(notification.id, e)}
                  className="flex-shrink-0 text-wharf-text-tertiary hover:text-wharf-orange transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t-2 border-wharf-border-primary bg-wharf-surface-secondary">
          <button
            onClick={() => {
              navigate('/notifications');
              setShowNotifications(false);
            }}
            className="w-full font-mono text-sm font-bold text-center hover:text-wharf-pink transition-colors"
          >
            View All Notifications →
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
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
                    src="https://res.cloudinary.com/dhn92qb61/image/upload/v1777107144/Wharf_Logo-Photoroom_upscaled_tgvwm2.webp"
                    alt="Wharf logo"
                    className="w-14 h-14 md:w-16 md:h-16 object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-display font-black text-2xl tracking-tighter leading-tight">
                    WHARF
                  </h1>
                  <p className="text-[10px] text-wharf-text-tertiary uppercase tracking-wide">
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
                  className="relative w-10 h-10 border-2 border-wharf-border-primary bg-wharf-surface-primary hover:bg-wharf-pink transition-all flex items-center justify-center shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                  aria-label="Notifications"
                >
                  {unreadCount > 0 ? (
                    <>
                      <BellDot className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-wharf-orange border border-wharf-border-primary text-[10px] font-black flex items-center justify-center">
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
                    className="flex items-center gap-2 px-2 py-1.5 border-2 border-wharf-border-primary bg-wharf-surface-primary hover:bg-wharf-surface-secondary transition-all group"
                  >
                    <div className="w-8 h-8 bg-wharf-purple border border-wharf-border-primary flex items-center justify-center">
                      <span className="text-sm font-bold text-wharf-black">{getUserInitial()}</span>
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
                          <div className="w-12 h-12 bg-wharf-pink border-2 border-wharf-border-primary flex items-center justify-center">
                            <span className="text-lg font-black text-wharf-black">
                              {getUserInitial()}
                            </span>
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
                          <span>Joined Jan 2024</span>
                        </div>
                        {user.name && (
                          <div className="flex items-center gap-2 font-mono text-xs mt-1">
                            <User className="w-3 h-3" />
                            <span>{user.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-2">
                        <button
                          onClick={handleDashboard}
                          className="w-full px-3 py-2 text-left font-mono text-sm font-bold hover:bg-wharf-pink transition-colors flex items-center gap-2"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={handleSettings}
                          className="w-full px-3 py-2 text-left font-mono text-sm font-bold hover:bg-wharf-pink transition-colors flex items-center gap-2 mt-1"
                        >
                          Settings
                        </button>
                      </div>

                      <div className="p-2 border-t-2 border-wharf-border-primary">
                        <button
                          onClick={handleLogout}
                          className="w-full px-3 py-2 text-left font-mono text-sm font-bold text-wharf-orange hover:bg-wharf-orange/10 transition-colors flex items-center gap-2"
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
                className="md:hidden w-10 h-10 border-2 border-wharf-border-primary bg-wharf-surface-primary hover:bg-wharf-pink transition-all flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed left-0 right-0 top-16 bg-wharf-surface-primary border-b-2 border-wharf-border-primary shadow-brutal animate-slideDown z-40 max-h-[calc(100vh-64px)] overflow-y-auto">
              <div className="flex flex-col py-4">
                {mobileNavLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-4 px-6 py-4 font-mono font-bold text-base uppercase tracking-wider border-l-4 border-transparent hover:border-wharf-pink hover:bg-wharf-surface-secondary transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className="w-5 h-5 text-wharf-pink" />
                    {link.label}
                  </a>
                ))}

                {/* Divider */}
                <div className="h-px bg-wharf-border-secondary my-2 mx-6" />

                {/* Sign In Button for Mobile */}
                {!user ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogin();
                    }}
                    className="flex items-center justify-center gap-3 mx-6 mt-2 py-3 font-mono font-bold text-sm uppercase tracking-wider border-2 border-wharf-border-primary bg-wharf-pink hover:bg-wharf-pink-dark transition-all shadow-brutal-sm"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </button>
                ) : (
                  <div className="mx-6 mt-2 space-y-2">
                    <div className="flex items-center gap-3 py-3 px-3 border-2 border-wharf-border-primary bg-wharf-surface-secondary">
                      <div className="w-10 h-10 bg-wharf-purple border border-wharf-border-primary flex items-center justify-center">
                        <span className="text-sm font-bold text-wharf-black">
                          {getUserInitial()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-mono text-sm font-bold">{getUserDisplay()}</p>
                        <p className="font-mono text-xs text-wharf-text-tertiary">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleDashboard();
                      }}
                      className="w-full py-2 font-mono text-sm font-bold text-center hover:bg-wharf-pink transition-colors border-2 border-wharf-border-primary"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSettings();
                      }}
                      className="w-full py-2 font-mono text-sm font-bold text-center hover:bg-wharf-pink transition-colors border-2 border-wharf-border-primary"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full py-2 font-mono text-sm font-bold text-center text-wharf-orange hover:bg-wharf-orange/10 transition-colors border-2 border-wharf-border-primary"
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

      {/* Spacer */}
      <div className="h-16 md:h-20" />
    </>
  );
};
