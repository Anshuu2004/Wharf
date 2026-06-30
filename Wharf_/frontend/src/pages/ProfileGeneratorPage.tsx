import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { PageWrapper } from '../components/layout';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Pencil,
  FileText,
  Zap,
  LayoutTemplate,
  Download,
  History,
  PlusCircle,
  User,
  Clock,
  Palette,
  Settings2,
  Star,
  Code,
  Eye,
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import {
  ProfileForm,
  TemplateSelector,
  BioGenerator,
  ThemePicker,
  ProfileExportActions,
  ProfileHistoryView,
  TechStackSelector,
  SocialBadgesInput,
  WidgetsCustomizer,
} from '../components/profile';
import { ReadmePreview } from '../components/generator/ReadmePreview';
import { generatePreviewMarkdown } from '../utils/previewGenerator';
import { Badge, Button, Card } from '../components/ui';
import api from '../lib/api';

// Define Proper Types
interface ProfileData {
  username: string;
  name: string;
  bio: string;
  avatarUrl: string;
  company?: string;
  location?: string;
  followers: number;
  following: number;
  repos: number;
  totalStars: number;
  totalForks: number;
  topLanguages: { name: string; percentage: number }[];
  techStack: string[];
  contributions: number;
  joinDate: string;
}

// Define The Template Type
type TemplateType = 'minimal' | 'developer' | 'creative' | 'professional' | 'terminal';

interface ProfileOptionsType {
  template: TemplateType;
  theme: string;
  githubBadges: string[];
  techStack: string[];
  social: { provider: string; url: string }[];
  showStats: boolean;
  showTopLanguages: boolean;
  showContributions: boolean;
  showTrophies: boolean;
  showStreak: boolean;
}

// Profile Stats Section
const ProfileStatsSection = ({ refreshTrigger }: { refreshTrigger?: number }) => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProfiles: 0,
    readmesGenerated: 0,
    totalStars: 0,
    templatesUsed: 0,
    topTemplate: '--',
    lastGenerated: '--',
  });

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/profile/history');
        if (!isMounted) return;

        if (res.data?.success) {
          const history = res.data.data;

          if (!history || history.length === 0) {
            setStats({
              totalProfiles: 0,
              readmesGenerated: 0,
              totalStars: 0,
              templatesUsed: 0,
              topTemplate: '--',
              lastGenerated: '--',
            });
            setIsLoading(false);
            return;
          }

          const uniqueProfiles = new Set(history.map((r: { username: string }) => r.username));
          let totalStars = 0;
          const templateCounts: Record<string, number> = {};
          let latestDate = 0;

          history.forEach(
            (r: {
              username: string;
              template?: string;
              generatedAt?: string;
              createdAt?: string;
              stars?: number;
            }) => {
              totalStars += r.stars || 0;
              const template = r.template || 'minimal';
              templateCounts[template] = (templateCounts[template] || 0) + 1;
              const dateStr = r.generatedAt || r.createdAt;
              const date = dateStr ? new Date(dateStr).getTime() : 0;
              if (date && date > latestDate) latestDate = date;
            }
          );

          const sortedTemplates = Object.entries(templateCounts).sort((a, b) => b[1] - a[1]);
          const mostUsed = sortedTemplates.length > 0 ? sortedTemplates[0][0] : '--';
          const validLatestDate = latestDate > 0 ? new Date(latestDate).toLocaleDateString() : '--';

          const targetStats = {
            totalProfiles: uniqueProfiles.size,
            readmesGenerated: history.length,
            totalStars: totalStars,
            templatesUsed: Object.keys(templateCounts).length,
            topTemplate: mostUsed,
            lastGenerated: validLatestDate,
          };

          const duration = 1500;
          const steps = 30;
          const interval = duration / steps;
          let currentStep = 0;

          const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            if (isMounted) {
              setStats({
                totalProfiles: Math.floor(targetStats.totalProfiles * progress),
                readmesGenerated: Math.floor(targetStats.readmesGenerated * progress),
                totalStars: Math.floor(targetStats.totalStars * progress),
                templatesUsed: Math.floor(targetStats.templatesUsed * progress),
                topTemplate: currentStep > steps / 2 ? targetStats.topTemplate : '--',
                lastGenerated: currentStep > steps / 2 ? targetStats.lastGenerated : '--',
              });
            }

            if (currentStep >= steps) {
              clearInterval(timer);
            }
          }, interval);

          setIsLoading(false);
          return () => clearInterval(timer);
        }
      } catch (err) {
        console.error('Failed to fetch profile stats:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [user, refreshTrigger]);

  const statItems = [
    {
      label: 'Profiles Generated',
      value: isLoading ? '--' : stats.totalProfiles.toLocaleString(),
      icon: User,
      color: 'bg-wharf-pink',
      description: 'Profile READMEs created',
    },
    {
      label: 'Profile READMEs',
      value: isLoading ? '--' : stats.readmesGenerated.toLocaleString(),
      icon: FileText,
      color: 'bg-wharf-cyan',
      description: 'Docs generated',
    },
    {
      label: 'Total Stars',
      value: isLoading ? '--' : stats.totalStars.toLocaleString(),
      icon: Star,
      color: 'bg-wharf-yellow',
      description: 'Across all profiles',
    },
    {
      label: 'Templates Used',
      value: isLoading ? '--' : stats.templatesUsed.toLocaleString(),
      icon: LayoutTemplate,
      color: 'bg-wharf-purple',
      description: 'Unique templates',
    },
    {
      label: 'Top Template',
      value: isLoading ? '--' : stats.topTemplate,
      icon: Palette,
      color: 'bg-wharf-green',
      description: 'Most popular',
    },
    {
      label: 'Last Generated',
      value: isLoading ? '--' : stats.lastGenerated,
      icon: Clock,
      color: 'bg-wharf-orange',
      description: 'Most recent activity',
    },
  ];

  if (!user) {
    return (
      <section className="py-20 bg-wharf-surface-secondary border-y-4 border-wharf-border-primary w-full mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Badge variant="default" className="gap-2 mx-auto w-fit">
              <User className="w-3 h-3" />
              Your Stats
            </Badge>
            <p className="font-mono text-sm text-wharf-text-tertiary mt-3 capitalize">
              Sign in to see Your Profile Stats
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-3"
              onClick={() => (window.location.href = '/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-wharf-surface-secondary border-y-4 border-wharf-border-primary w-full mt-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="cyan" className="mb-4 gap-2">
            <User className="w-3 h-3" />
            Your Profile Stats
          </Badge>
          <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-4">
            Your{' '}
            <span className="bg-gradient-to-r from-wharf-green-dark to-wharf-green-darker bg-clip-text text-transparent">
              Profile Activity
            </span>
          </h2>
          <p className="font-mono text-base text-wharf-text-secondary max-w-2xl mx-auto capitalize">
            Your personal profile README analytics
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {statItems.map((stat) => (
            <Card
              key={stat.label}
              variant="hard-sm"
              className="text-center group hover:translate-y-[-2px] transition-all duration-300"
            >
              <div className="flex flex-col items-center p-3">
                <div
                  className={`w-10 h-10 ${stat.color} border-2 border-wharf-border-primary flex items-center justify-center mb-3 shadow-brutal-sm group-hover:shadow-brutal transition-all`}
                >
                  <stat.icon className="w-5 h-5 text-wharf-black" />
                </div>
                <div className="font-display font-black text-2xl md:text-3xl tracking-tighter capitalize">
                  {stat.value}
                </div>
                <div className="font-mono text-xs text-wharf-text-secondary mt-1 capitalize">
                  {stat.label}
                </div>
                <div className="font-mono text-[10px] text-wharf-text-tertiary mt-0.5 capitalize">
                  {stat.description}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Profile Generator Page
export const ProfileGeneratorPage = () => {
  const { user } = useAuthStore();

  // Helper For LocalStorage State Initialization
  const initializeState = <T,>(key: string, defaultValue: T): T => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`wharf_profile_gen_${key}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return defaultValue;
        }
      }
    }
    return defaultValue;
  };

  // State Management
  const [appState, setAppState] = useState<'landing' | 'wizard' | 'history'>(() =>
    initializeState('appState', 'landing')
  );
  const [profileData, setProfileData] = useState<ProfileData | null>(() =>
    initializeState('profileData', null)
  );
  const [generatedReadme, setGeneratedReadme] = useState(() =>
    initializeState('generatedReadme', '')
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [options, setOptions] = useState<ProfileOptionsType>(() =>
    initializeState('options', {
      template: 'minimal',
      theme: 'tokyonight',
      githubBadges: ['stars', 'followers', 'views'],
      techStack: [],
      social: [],
      showStats: true,
      showTopLanguages: true,
      showContributions: true,
      showTrophies: true,
      showStreak: true,
    })
  );

  const [currentStep, setCurrentStep] = useState(() => initializeState('currentStep', 1));
  const [activeTab, setActiveTab] = useState(() => initializeState('activeTab', 'layout'));

  const hasWidgets =
    options.githubBadges.length > 0 ||
    options.showStats ||
    options.showTopLanguages ||
    options.showContributions ||
    options.showStreak ||
    options.showTrophies;

  const completionScore = Math.min(
    25 +
      (options.techStack.length > 0 ? 15 : 0) +
      (options.social.length > 0 ? 15 : 0) +
      (options.template !== 'minimal' ? 15 : 0) +
      (options.theme !== 'default' ? 15 : 0) +
      (hasWidgets ? 15 : 0),
    100
  );

  // Persist State To Sync Across Page Refreshes
  useEffect(() => {
    localStorage.setItem('wharf_profile_gen_appState', JSON.stringify(appState));
    localStorage.setItem('wharf_profile_gen_profileData', JSON.stringify(profileData));
    localStorage.setItem('wharf_profile_gen_generatedReadme', JSON.stringify(generatedReadme));
    localStorage.setItem('wharf_profile_gen_options', JSON.stringify(options));
    localStorage.setItem('wharf_profile_gen_currentStep', JSON.stringify(currentStep));
    localStorage.setItem('wharf_profile_gen_activeTab', JSON.stringify(activeTab));
  }, [appState, profileData, generatedReadme, options, currentStep, activeTab]);

  // Fallback Cleanup If A User Reloads During An Active Generation Step Without The Network Stream
  useEffect(() => {
    if (currentStep === 3 && !generatedReadme && !isGenerating) {
      setCurrentStep(2);
    }
  }, [currentStep, generatedReadme, isGenerating]);

  // Simulate Progress For Better UX
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setGenerationProgress(0);
    }
  }, [isGenerating]);

  const handleFetchProfile = async (username: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/profile/${username}`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token || ''}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      if (data.success) {
        setProfileData(data.data);
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!profileData) return;

    setIsGenerating(true);
    setGeneratedReadme('');
    setGenerationProgress(0);
    setCurrentStep(3);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/profile/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${useAuthStore.getState().token || ''}`,
          },
          body: JSON.stringify({
            profileData,
            options,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to generate profile README');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) return;

      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine.startsWith('data: ')) continue;

          const dataStr = cleanLine.slice(6);
          if (dataStr === '[DONE]') {
            setGenerationProgress(100);
            setRefreshTrigger((prev) => prev + 1);
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              console.error(parsed.error);
              alert(parsed.error);
              break;
            }
            if (parsed.text) {
              setGeneratedReadme((prev) => prev + parsed.text);
              setGenerationProgress((prev) => Math.min(prev + 0.5, 95));
            }
          } catch {
            // Partial JSON
          }
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const steps = [
    { step: 1, label: 'Enter Profile', icon: User },
    { step: 2, label: 'Customize', icon: Settings2 },
    { step: 3, label: 'Generate', icon: Zap },
    { step: 4, label: 'Export', icon: Download },
  ];

  const canProceedToStep = (step: number) => {
    if (step === 1) return true;
    if (step === 2 && profileData) return true;
    if (step === 3 && generatedReadme) return true;
    if (step === 4 && generatedReadme) return true;
    return false;
  };

  const LandingState = () => (
    <div className="space-y-12 animate-fadeInUp pb-12">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-8">
        <div className="relative text-center max-w-4xl mx-auto py-8">
          <div className="space-y-6 relative">
            <Badge variant="pink" className="gap-2 mx-auto w-fit">
              <FaGithub className="w-3 h-3" />
              Profile README Generator
            </Badge>

            <h2 className="font-display font-black text-5xl md:text-7xl tracking-tighter leading-[1.1]">
              Create A Stunning
              <br />
              <span className="bg-gradient-to-r from-wharf-pink-dark to-wharf-pink bg-clip-text text-transparent">
                GitHub Profile README
              </span>
            </h2>

            <p className="font-mono text-base md:text-lg text-wharf-text-secondary max-w-2xl mx-auto capitalize">
              Generate a beautiful, professional profile README that stands out in seconds...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setProfileData(null);
                setGeneratedReadme('');
                setCurrentStep(1);
                setAppState('wizard');
              }}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Create New Profile
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setAppState('history')}
              disabled={!user}
              icon={<History className="w-4 h-4" />}
            >
              {user ? 'View History' : 'Login to View History'}
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Stats Section */}
      <ProfileStatsSection refreshTrigger={refreshTrigger} />

      {/* How It Works */}
      <section className="py-20 bg-wharf-surface-primary mt-[-2rem]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="cyan" className="mb-4 gap-2">
              <Zap className="w-3 h-3" />
              Simple Process
            </Badge>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-4">
              How It{' '}
              <span className="bg-gradient-to-r from-wharf-cyan-dark to-wharf-cyan-darker bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="font-mono text-base text-wharf-text-secondary max-w-2xl mx-auto capitalize">
              Three simple steps to create your perfect GitHub profile README
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 max-w-6xl mx-auto w-full">
            {[
              {
                step: '01',
                title: 'Enter Username',
                desc: 'Enter your GitHub username or profile URL',
                icon: User,
                color: 'bg-wharf-pink',
              },
              {
                step: '02',
                title: 'Customize Design',
                desc: 'Choose template, theme, and sections',
                icon: Palette,
                color: 'bg-wharf-cyan',
              },
              {
                step: '03',
                title: 'Generate & Export',
                desc: 'Get your profile README in seconds',
                icon: Zap,
                color: 'bg-wharf-green',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative w-full">
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-16 w-16 h-0.75 bg-wharf-border-primary" />
                )}

                <Card
                  variant="hard"
                  className="text-center h-full w-full hover:translate-y-[-4px] transition-all duration-300"
                >
                  <div className="flex flex-col items-center p-2 w-full">
                    <div
                      className={`w-12 h-12 ${item.color} border-2 border-wharf-border-primary flex items-center justify-center mb-4 shadow-brutal-sm flex-shrink-0`}
                    >
                      <span className="font-mono font-black text-sm text-wharf-black">
                        {item.step}
                      </span>
                    </div>

                    <div className="w-16 h-16 border-2 border-wharf-border-primary bg-wharf-surface-primary flex items-center justify-center mb-4 shadow-brutal-sm flex-shrink-0">
                      <item.icon className="w-8 h-8 text-wharf-text-primary" />
                    </div>

                    <h3 className="font-display font-black text-xl mb-2 text-center">
                      {item.title}
                    </h3>
                    <p className="font-mono text-sm text-wharf-text-secondary text-center max-w-xs capitalize">
                      {item.desc}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  if (appState === 'landing') {
    return (
      <main className="min-h-screen">
        <LandingState />
      </main>
    );
  }

  return (
    <PageWrapper title="" description="">
      <div className="max-w-7xl mx-auto space-y-8">
        {appState === 'history' && (
          <div className="space-y-6 animate-fadeInUp">
            <button
              onClick={() => setAppState('landing')}
              className="flex items-center gap-2 font-mono text-sm font-bold text-wharf-text-secondary hover:text-wharf-pink transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back To Dashboard
            </button>

            <div>
              <ProfileHistoryView
                onSelect={(content) => {
                  setGeneratedReadme(content);
                  setCurrentStep(4);
                  setAppState('wizard');
                }}
              />
            </div>
          </div>
        )}

        {appState === 'wizard' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setAppState('landing')}
                className="flex items-center gap-2 font-mono text-sm font-bold text-wharf-text-secondary hover:text-wharf-pink transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>
              {profileData && (
                <Badge variant="cyan" className="gap-1.5">
                  <FaGithub className="w-3 h-3" />
                  {profileData.username}
                </Badge>
              )}
            </div>

            {/* Step Progress Indicator */}
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-wharf-border-secondary -z-0" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-wharf-pink transition-all duration-500 -z-0"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />

              <div className="flex justify-between relative z-10">
                {steps.map((s) => {
                  const isActive = currentStep === s.step;
                  const isCompleted = currentStep > s.step;
                  const isAccessible = canProceedToStep(s.step);

                  return (
                    <button
                      key={s.step}
                      onClick={() => {
                        if (canProceedToStep(s.step)) {
                          setCurrentStep(s.step);
                        }
                      }}
                      disabled={!isAccessible}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div
                        className={`
                        w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                        ${
                          isActive
                            ? 'bg-wharf-pink border-wharf-border-primary shadow-brutal-sm'
                            : isCompleted
                              ? 'bg-wharf-green border-wharf-border-primary'
                              : 'bg-wharf-surface-secondary border-wharf-border-secondary'
                        }
                        ${isAccessible && !isActive && !isCompleted ? 'hover:border-wharf-pink hover:bg-wharf-pink/10' : ''}
                        ${!isAccessible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-wharf-black" />
                        ) : (
                          <s.icon
                            className={`w-5 h-5 ${isActive ? 'text-wharf-black' : 'text-wharf-text-tertiary'}`}
                          />
                        )}
                      </div>
                      <span
                        className={`font-mono text-xs font-bold hidden sm:block ${
                          isActive ? 'text-wharf-pink' : 'text-wharf-text-tertiary'
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content Card */}
            <Card variant="hard" className="overflow-hidden">
              <div className="p-4">
                {/* Step 1: Enter Profile */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fadeInUp">
                    <div className="text-center mb-8">
                      <h3 className="font-display font-black text-3xl tracking-tighter">
                        Enter Your GitHub Profile
                      </h3>
                      <p className="font-mono text-sm text-wharf-text-tertiary mt-1 capitalize">
                        Enter your username to fetch profile data
                      </p>
                    </div>
                    <ProfileForm
                      user={user}
                      onFetch={handleFetchProfile}
                      isLoading={isGenerating}
                    />
                  </div>
                )}

                {/* Step 2: Customize */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fadeInUp">
                    <div className="text-center mb-8">
                      <h3 className="font-display font-black text-3xl tracking-tighter">
                        Customize Your Profile
                      </h3>
                      <p className="font-mono text-sm text-wharf-text-tertiary mt-2 capitalize">
                        Choose template, theme & sections for your README
                      </p>
                    </div>

                    {profileData ? (
                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-10">
                        {/* Main Customizable Area */}
                        <div className="space-y-6 min-w-0">
                          {/* Tab Navigation */}
                          <div className="w-full bg-wharf-surface-primary border-2 border-wharf-border-primary rounded-lg p-2 shadow-brutal-sm">
                            <div className="grid grid-cols-5 gap-4 w-full">
                              {[
                                {
                                  id: 'layout',
                                  label: 'Layout',
                                  icon: LayoutTemplate,
                                  activeBg: 'bg-wharf-cyan/20',
                                  activeText: 'text-wharf-cyan-darker',
                                  borderColor: 'border-wharf-cyan/40',
                                },
                                {
                                  id: 'stack',
                                  label: 'Tech Stack',
                                  icon: Code,
                                  activeBg: 'bg-wharf-purple/20',
                                  activeText: 'text-wharf-purple-darker',
                                  borderColor: 'border-wharf-purple/40',
                                },
                                {
                                  id: 'social',
                                  label: 'Social',
                                  icon: User,
                                  activeBg: 'bg-wharf-pink/20',
                                  activeText: 'text-wharf-pink-darker',
                                  borderColor: 'border-wharf-pink/40',
                                },
                                {
                                  id: 'widgets',
                                  label: 'Widgets',
                                  icon: Star,
                                  activeBg: 'bg-wharf-yellow/20',
                                  activeText: 'text-wharf-yellow-darker',
                                  borderColor: 'border-wharf-text-primary',
                                },
                                {
                                  id: 'preview',
                                  label: 'Preview',
                                  icon: Eye,
                                  activeBg: 'bg-wharf-teal/20',
                                  activeText: 'text-wharf-teal-darker',
                                  borderColor: 'border-wharf-teal/40',
                                },
                              ].map((tab) => {
                                const isActive = activeTab === tab.id;
                                const Icon = tab.icon;

                                return (
                                  <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                      relative flex items-center justify-center gap-2.5 px-2 py-3
                                      font-mono text-sm font-bold transition-all duration-300 rounded-md cursor-pointer
                                      ${
                                        isActive
                                          ? `${tab.activeBg} ${tab.activeText} border border-wharf-border-primary shadow-brutal-sm`
                                          : `text-wharf-text-primary  hover:bg-wharf-surface-secondary/50 hover:text-wharf-text-primary border border-wharf-border-primary hover:shadow-brutal-sm`
                                      }
                                    `}
                                  >
                                    <Icon
                                      className={`w-4 h-4 transition-all duration-300 ${
                                        isActive ? '' : 'text-wharf-text-secondary'
                                      }`}
                                    />

                                    <span className="hidden sm:inline tracking-wider font-bold">
                                      {tab.label}
                                    </span>

                                    {/* Active Indicator */}
                                    {isActive && (
                                      <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center">
                                        <div className="relative">
                                          <Star className="w-4 h-4 text-wharf-green-dark fill-wharf-green-dark stroke-wharf-border-primary stroke-[1.5] drop-shadow-[0_0_12px_rgba(255,107,157,0.5)]" />
                                          {/* Pulsing Glow */}
                                          <span className="absolute inset-0 animate-ping opacity-67">
                                            <Star className="w-4 h-4 text-wharf-pink fill-wharf-pink" />
                                          </span>
                                        </div>
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Tab Content */}
                          <div className="min-h-[400px] pt-4">
                            {/* Layout Section */}
                            {activeTab === 'layout' && (
                              <div>
                                {/* Divider - Template Selection */}
                                <div className="relative py-2 mb-2">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-wharf-border-secondary"></div>
                                  </div>
                                  <div className="relative flex justify-center">
                                    <span className="px-4 py-0.5 bg-wharf-surface-primary border border-wharf-border-secondary font-mono text-[10px] text-wharf-text-secondary flex items-center gap-2">
                                      <LayoutTemplate className="w-3 h-3 text-wharf-cyan-darker" />
                                      Step 1: Choose Layout
                                    </span>
                                  </div>
                                </div>

                                {/* Template Section */}
                                <div>
                                  <div className="flex items-center gap-2 mb-4">
                                    <LayoutTemplate className="w-5 h-5 text-wharf-cyan-darker" />
                                    <h4 className="font-display font-black text-lg tracking-tighter">
                                      Select Template
                                    </h4>
                                    <span className="ml-auto font-mono text-[10px] text-wharf-text-tertiary bg-wharf-surface-secondary px-2 py-0.5 border border-wharf-border-secondary capitalize">
                                      {options.template}
                                    </span>
                                  </div>
                                  <TemplateSelector
                                    selected={options.template}
                                    onChange={(template: string) =>
                                      setOptions({ ...options, template: template as TemplateType })
                                    }
                                  />
                                </div>

                                {/* Divider - Theme Selection */}
                                <div className="relative py-2 mt-12 mb-2">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-wharf-border-secondary"></div>
                                  </div>
                                  <div className="relative flex justify-center">
                                    <span className="px-4 py-0.5 bg-wharf-surface-primary border border-wharf-border-secondary font-mono text-[10px] text-wharf-text-secondary flex items-center gap-2">
                                      <Palette className="w-3 h-3 text-wharf-yellow-darker" />
                                      Step 2: Pick Colors
                                    </span>
                                  </div>
                                </div>

                                {/* Theme Section */}
                                <div>
                                  <div className="flex items-center gap-2 mb-4">
                                    <Palette className="w-5 h-5 text-wharf-yellow-darker" />
                                    <h4 className="font-display font-black text-lg tracking-tighter">
                                      Choose Theme
                                    </h4>
                                    <span className="ml-auto font-mono text-[10px] text-wharf-text-tertiary bg-wharf-surface-secondary px-2 py-0.5 border border-wharf-border-secondary capitalize">
                                      {options.theme}
                                    </span>
                                  </div>
                                  <ThemePicker
                                    selected={options.theme}
                                    onChange={(t: string) => setOptions({ ...options, theme: t })}
                                  />
                                </div>

                                {/* Divider - Bio Section */}
                                <div className="relative py-2 mt-12 mb-2">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-wharf-border-secondary"></div>
                                  </div>
                                  <div className="relative flex justify-center">
                                    <span className="px-4 py-0.5 bg-wharf-surface-primary border border-wharf-border-secondary font-mono text-[10px] text-wharf-text-secondary flex items-center gap-2">
                                      <Pencil className="w-3 h-3 text-wharf-green-darker" />
                                      Step 3: Personalize
                                    </span>
                                  </div>
                                </div>

                                {/* Bio Section */}
                                <div>
                                  <div className="flex items-center gap-2 mb-4">
                                    <Pencil className="w-5 h-5 text-wharf-green-darker" />
                                    <h4 className="font-display font-black text-lg tracking-tighter">
                                      Edit Bio
                                    </h4>
                                    <span className="ml-auto font-mono text-[10px] text-wharf-text-tertiary bg-wharf-surface-secondary px-2 py-0.5 border border-wharf-border-secondary capitalize">
                                      {profileData.bio?.length || 0} chars
                                    </span>
                                  </div>
                                  <BioGenerator
                                    bio={profileData.bio}
                                    onGenerate={(newBio: string) =>
                                      setProfileData({ ...profileData, bio: newBio })
                                    }
                                  />
                                </div>
                              </div>
                            )}

                            {/* Tech Stack Section */}
                            {activeTab === 'stack' && (
                              <div className="space-y-4">
                                {/* Divider - Tech Stack Section */}
                                <div className="relative py-2 mb-2">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-wharf-border-secondary"></div>
                                  </div>
                                  <div className="relative flex justify-center">
                                    <span className="px-4 py-0.5 bg-wharf-surface-primary border border-wharf-border-secondary font-mono text-[10px] text-wharf-text-secondary flex items-center gap-2">
                                      <Code className="w-3 h-3 text-wharf-purple-darker" />
                                      Step 4: Tech Stack
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                  <Code className="w-5 h-5 text-wharf-purple-darker" />
                                  <h4 className="font-display font-black text-lg tracking-tighter">
                                    Select Your Tech Stack
                                  </h4>
                                </div>
                                <p className="font-mono text-sm text-wharf-text-secondary mb-6 capitalize">
                                  Select the technologies you actively use to generate beautiful
                                  skill badges...
                                </p>
                                <TechStackSelector
                                  selected={options.techStack}
                                  onChange={(stack: string[]) =>
                                    setOptions({ ...options, techStack: stack })
                                  }
                                  detectedStack={profileData.techStack}
                                />
                              </div>
                            )}

                            {/* Social Connections Section */}
                            {activeTab === 'social' && (
                              <div className="space-y-4">
                                {/* Divider - Social Section */}
                                <div className="relative py-2 mb-2">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-wharf-border-secondary"></div>
                                  </div>
                                  <div className="relative flex justify-center">
                                    <span className="px-4 py-0.5 bg-wharf-surface-primary border border-wharf-border-secondary font-mono text-[10px] text-wharf-text-secondary flex items-center gap-2">
                                      <Code className="w-3 h-3 text-wharf-pink-darker" />
                                      Step 5: Social Connections
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                  <User className="w-5 h-5 text-wharf-pink-darker" />
                                  <h4 className="font-display font-black text-lg tracking-tighter">
                                    Social Links
                                  </h4>
                                </div>
                                <p className="font-mono text-sm text-wharf-text-secondary mb-6 capitalize">
                                  Add your handles to display "Let's Connect" badges on your
                                  profile...
                                </p>
                                <SocialBadgesInput
                                  links={options.social}
                                  onChange={(links: { provider: string; url: string }[]) =>
                                    setOptions({ ...options, social: links })
                                  }
                                />
                              </div>
                            )}

                            {/* Widgets Section */}
                            {activeTab === 'widgets' && (
                              <div className="space-y-4">
                                {/* Divider - Social Section */}
                                <div className="relative py-2 mb-2">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-wharf-border-secondary"></div>
                                  </div>
                                  <div className="relative flex justify-center">
                                    <span className="px-4 py-0.5 bg-wharf-surface-primary border border-wharf-border-secondary font-mono text-[10px] text-wharf-text-secondary flex items-center gap-2">
                                      <Code className="w-3 h-3 text-wharf-pink-darker" />
                                      Step 6: Widgets
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                  <Star className="w-5 h-5 text-wharf-yellow-dark" />
                                  <h4 className="font-display font-black text-lg tracking-tighter">
                                    Widgets & Trophies
                                  </h4>
                                </div>
                                <p className="font-mono text-sm text-wharf-text-secondary mb-6 capitalize">
                                  Toggle various graphical stats & repo visualizers...
                                </p>
                                <WidgetsCustomizer
                                  options={options}
                                  onChange={(opts) => setOptions((prev) => ({ ...prev, ...opts }))}
                                />
                              </div>
                            )}

                            {/* Preview Section */}
                            {activeTab === 'preview' && (
                              <div className="space-y-4">
                                <div className="relative py-2 mb-2">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-wharf-border-secondary"></div>
                                  </div>
                                  <div className="relative flex justify-center">
                                    <span className="px-4 py-0.5 bg-wharf-surface-primary border border-wharf-border-secondary font-mono text-[10px] text-wharf-text-secondary flex items-center gap-2">
                                      <Eye className="w-3 h-3 text-wharf-green-darker" />
                                      Step 7: README Preview
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                  <Eye className="w-5 h-5 text-wharf-green-darker" />
                                  <h4 className="font-display font-black text-lg tracking-tighter">
                                    Live Preview
                                  </h4>
                                </div>
                                <p className="font-mono text-sm text-wharf-text-secondary mb-4 capitalize">
                                  See how your profile will look with the current settings...
                                </p>
                                <div className="border-2 border-wharf-border-primary overflow-hidden">
                                  <ReadmePreview
                                    content={generatePreviewMarkdown(profileData, options)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          {/* Profile Preview Card */}
                          <Card variant="hard" className="p-5 sticky top-6">
                            <div className="flex items-center gap-4 mb-4 pb-4 border-b-2 border-wharf-border-secondary">
                              <div className="relative">
                                <img
                                  src={profileData.avatarUrl}
                                  alt={profileData.username}
                                  className="w-16 h-16 border-2 border-wharf-border-primary rounded-full"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-wharf-green border-2 border-wharf-border-primary rounded-full flex items-center justify-center">
                                  <FaGithub className="w-2.5 h-2.5 text-wharf-black" />
                                </div>
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-display font-black text-xl tracking-tighter leading-tight truncate">
                                  {profileData.name || profileData.username}
                                </h4>
                                <p className="font-mono text-sm text-wharf-text-secondary">
                                  {profileData.username}
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="font-mono text-xs text-wharf-text-secondary flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {profileData.followers}
                                  </span>
                                  <span className="font-mono text-xs text-wharf-text-secondary flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    {profileData.totalStars}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              <div className="bg-wharf-surface-secondary border border-wharf-border-primary p-2 text-center">
                                <div className="font-mono text-xs text-wharf-text-secondary">
                                  Template
                                </div>
                                <div className="font-display font-black text-sm tracking-tighter capitalize">
                                  {options.template}
                                </div>
                              </div>
                              <div className="bg-wharf-surface-secondary border border-wharf-border-primary p-2 text-center">
                                <div className="font-mono text-xs text-wharf-text-secondary">
                                  Theme
                                </div>
                                <div className="font-display font-black text-sm tracking-tighter capitalize">
                                  {options.theme}
                                </div>
                              </div>
                            </div>

                            {/* Configuration Summary */}
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center py-1 border-b border-wharf-border-secondary/50">
                                <span className="font-mono text-xs text-wharf-text-secondary">
                                  Tech Stack
                                </span>
                                <Badge variant="cyan" size="sm">
                                  {options.techStack.length} items
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center py-1 border-b border-wharf-border-secondary/50">
                                <span className="font-mono text-xs text-wharf-text-secondary">
                                  Social Links
                                </span>
                                <Badge variant="purple" size="sm">
                                  {options.social.length} connected
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="font-mono text-xs text-wharf-text-secondary">
                                  Active Widgets
                                </span>
                                <Badge variant="pink" size="sm">
                                  {
                                    [
                                      options.showStats,
                                      options.showTopLanguages,
                                      options.showTrophies,
                                      options.showStreak,
                                    ].filter(Boolean).length
                                  }{' '}
                                  / 4
                                </Badge>
                              </div>
                            </div>

                            {/* Progress Indicator */}
                            <div className="mt-4 pt-4 border-t-2 border-wharf-border-secondary">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-[11px] text-wharf-text-secondary uppercase">
                                  Completion
                                </span>
                                <span className="font-mono text-sm font-bold text-wharf-pink-dark">
                                  {completionScore}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 border border-wharf-border-primary bg-wharf-surface-secondary overflow-hidden">
                                <div
                                  className="h-full bg-wharf-pink-dark transition-all duration-500"
                                  style={{ width: `${completionScore}%` }}
                                />
                              </div>
                            </div>
                          </Card>

                          {/* Quick Action Tips */}
                          <Card variant="hard-sm" className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-wharf-purple/20 border border-wharf-border-primary flex items-center justify-center flex-shrink-0">
                                <Zap className="w-4 h-4 text-wharf-purple-darker" />
                              </div>
                              <div>
                                <p className="font-mono text-sm font-bold">Pro Tip</p>
                                <p className="font-mono text-[12px] text-wharf-text-secondary mt-0.5 leading-relaxed capitalize">
                                  {options.techStack.length === 0 && (
                                    <span>
                                      Add your{' '}
                                      <span className="text-wharf-cyan-darker font-bold">
                                        tech stack
                                      </span>{' '}
                                      to show off your skills & attract the right opportunities...
                                    </span>
                                  )}
                                  {options.techStack.length > 0 && options.techStack.length < 5 && (
                                    <span>
                                      You have{' '}
                                      <span className="text-wharf-teal-dark font-bold">
                                        {options.techStack.length}
                                      </span>{' '}
                                      technologies selected. Add more to create a comprehensive
                                      skill showcase...
                                    </span>
                                  )}
                                  {options.techStack.length >= 5 && options.social.length === 0 && (
                                    <span>
                                      Connect your{' '}
                                      <span className="text-wharf-pink-dark font-bold">
                                        social profiles
                                      </span>{' '}
                                      to build trust & make it easy for people to reach out...
                                    </span>
                                  )}
                                  {options.techStack.length >= 5 &&
                                    options.social.length > 0 &&
                                    options.template === 'minimal' && (
                                      <span>
                                        Try the{' '}
                                        <span className="text-wharf-purple-darker font-bold">
                                          Developer
                                        </span>{' '}
                                        or{' '}
                                        <span className="text-wharf-cyan-darker font-bold">
                                          Creative
                                        </span>{' '}
                                        template to better showcase your extensive skills...
                                      </span>
                                    )}
                                  {options.techStack.length >= 5 &&
                                    options.social.length > 0 &&
                                    options.template !== 'minimal' && (
                                      <span>
                                        Your profile is looking great! Consider enabling{' '}
                                        <span className="text-wharf-yellow-dark font-bold">
                                          GitHub Trophies
                                        </span>{' '}
                                        to highlight your achievements...
                                      </span>
                                    )}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="font-mono text-wharf-text-tertiary capitalize">
                          Please enter a username first...
                        </p>
                        <Button variant="ghost" onClick={prevStep} className="mt-4">
                          Go Back
                        </Button>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    {profileData && (
                      <div className="flex justify-between items-center mt-8 pt-6 border-t-2 border-wharf-border-secondary">
                        <Button
                          variant="ghost"
                          onClick={prevStep}
                          icon={<ArrowLeft className="w-4 h-4" />}
                        >
                          Back
                        </Button>
                        <div className="flex items-center gap-6">
                          {completionScore < 100 && (
                            <span className="px-4 py-1 bg-wharf-yellow/75 border border-wharf-border-primary font-mono text-[11px] text-wharf-text-primary flex items-center gap-2">
                              <AlertCircle className="w-3 h-3 text-wharf-error" />
                              Complete Profile To 100% To Generate
                            </span>
                          )}
                          <Button
                            variant="primary"
                            size="lg"
                            onClick={handleGenerate}
                            icon={<Zap className="w-4 h-4" />}
                            className="font-bold"
                            disabled={completionScore < 100}
                          >
                            Generate Profile
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Generate */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fadeInUp">
                    <div className="text-center mb-8">
                      <h3 className="font-display font-black text-2xl tracking-tighter">
                        {isGenerating ? 'Generating Your Profile' : 'Preview Your Profile'}
                      </h3>
                      <p className="font-mono text-sm text-wharf-text-tertiary mt-1 mb-8 capitalize">
                        {isGenerating
                          ? 'AI is creating your GitHub profile README...'
                          : 'Review your generated profile'}
                      </p>
                    </div>

                    {isGenerating && (
                      <div className="mb-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-2 border border-wharf-border-primary bg-wharf-surface-secondary overflow-hidden">
                            <div
                              className="h-full bg-wharf-pink transition-all duration-500"
                              style={{ width: `${generationProgress}%` }}
                            />
                          </div>
                          <span className="font-mono text-sm font-bold text-wharf-pink">
                            {generationProgress}%
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <span className="font-mono text-xs text-wharf-text-tertiary capitalize">
                            Analyzing profile data...
                          </span>
                        </div>
                      </div>
                    )}

                    {generatedReadme && !isGenerating && (
                      <>
                        <ReadmePreview
                          content={generatedReadme}
                          onContentChange={setGeneratedReadme}
                        />
                        <div className="flex justify-between mt-6 pt-4 border-t-2 border-wharf-border-secondary">
                          <Button
                            variant="ghost"
                            onClick={prevStep}
                            icon={<ArrowLeft className="w-4 h-4" />}
                          >
                            Back to Customize
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => setCurrentStep(4)}
                            iconPosition="right"
                            icon={<ArrowRight className="w-4 h-4" />}
                          >
                            Continue to Export
                          </Button>
                        </div>
                      </>
                    )}

                    {generatedReadme && isGenerating && (
                      <ReadmePreview content={generatedReadme} isGenerating={true} />
                    )}
                  </div>
                )}

                {/* Step 4: Export */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-fadeInUp">
                    <div className="text-center mb-8">
                      <h3 className="font-display font-black text-2xl tracking-tighter">
                        Export Your Profile README
                      </h3>
                      <p className="font-mono text-sm text-wharf-text-tertiary mt-1 mb-8 capitalize">
                        Save, download, or deploy your profile README
                      </p>
                    </div>

                    {generatedReadme ? (
                      <>
                        <div className="bg-wharf-surface-secondary border-2 border-wharf-border-primary p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-wharf-pink" />
                            <span className="font-mono font-bold text-sm">
                              {profileData?.username || 'profile'}-README.md
                            </span>
                            <Badge variant="green" size="sm" className="ml-auto">
                              Ready
                            </Badge>
                          </div>
                          <p className="font-mono text-xs text-wharf-text-tertiary capitalize">
                            {generatedReadme.split(' ').length} words | {options.template} template
                            | {options.theme} theme
                          </p>
                        </div>
                        <ProfileExportActions
                          content={generatedReadme}
                          username={profileData?.username}
                        />
                        <div className="flex justify-start mt-6 pt-4 border-t-2 border-wharf-border-secondary">
                          <Button
                            variant="ghost"
                            onClick={prevStep}
                            icon={<ArrowLeft className="w-4 h-4" />}
                          >
                            Back to Preview
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <p className="font-mono text-wharf-text-tertiary">
                          Generate a profile README first.
                        </p>
                        <Button variant="ghost" onClick={() => setCurrentStep(1)} className="mt-4">
                          Start Over
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};
