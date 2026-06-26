import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { PageWrapper } from '../components/layout'
import { 
  ProfileForm, 
  TemplateSelector, 
  BioGenerator, 
  ThemePicker, 
  ProfileExportActions,
  TechStackSelector,
  SocialBadgesInput,
  WidgetsCustomizer
} from '../components/profile'
import { ProfileHistoryView } from '../components/profile/ProfileHistoryView'
import { ReadmePreview } from '../components/generator/ReadmePreview'
import { generatePreviewMarkdown } from '../utils/previewGenerator'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Sparkles,
  Zap,
  LayoutTemplate,
  Download,
  History,
  PlusCircle,
  User,
  Clock,
  Palette,
  Settings2,
  UserCircle,
  Star
} from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import api from '../lib/api'

// Define Proper Types
interface ProfileData {
  username: string
  name: string
  bio: string
  avatarUrl: string
  company?: string
  location?: string
  followers: number
  following: number
  repos: number
  totalStars: number
  totalForks: number
  topLanguages: { name: string; percentage: number }[]
  techStack: string[]
  contributions: number
  joinDate: string
}

// Define the template type
type TemplateType = 'minimal' | 'developer' | 'creative' | 'professional' | 'terminal'

interface ProfileOptionsType {
  template: TemplateType
  theme: string
  githubBadges: string[]
  techStack: string[]
  social: { provider: string; url: string }[]
  showStats: boolean
  showTopLanguages: boolean
  showContributions: boolean
  showTrophies: boolean
  showStreak: boolean
}

// Profile Stats Section
const ProfileStatsSection = ({ refreshTrigger }: { refreshTrigger?: number }) => {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProfiles: 0,
    readmesGenerated: 0,
    totalStars: 0,
    templatesUsed: 0,
    topTemplate: '--',
    lastGenerated: '--'
  })

  useEffect(() => {
    if (!user) return

    let isMounted = true

    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const res = await api.get('/profile/stats')
        if (!isMounted) return

        if (res.data?.success) {
          const data = res.data.data
          const duration = 1500
          const steps = 30
          const interval = duration / steps
          let currentStep = 0
          
          const timer = setInterval(() => {
            currentStep++
            const progress = currentStep / steps
            
            if (isMounted) {
              setStats({
                totalProfiles: Math.floor((data.totalProfiles || 0) * progress),
                readmesGenerated: Math.floor((data.readmesGenerated || 0) * progress),
                totalStars: Math.floor((data.totalStars || 0) * progress),
                templatesUsed: Math.floor((data.templatesUsed || 0) * progress),
                topTemplate: currentStep > steps / 2 ? (data.topTemplate || '--') : '--',
                lastGenerated: currentStep > steps / 2 ? (data.lastGenerated || '--') : '--'
              })
            }

            if (currentStep >= steps) {
              clearInterval(timer)
            }
          }, interval)

          setIsLoading(false)
          return () => clearInterval(timer)
        }
      } catch (err) {
        console.error('Failed to fetch profile stats:', err)
        if (isMounted) setIsLoading(false)
      }
    }

    fetchStats()
    return () => { isMounted = false }
  }, [user, refreshTrigger])

  const statItems = [
    {
      label: 'Profiles Generated',
      value: isLoading ? '--' : stats.totalProfiles.toLocaleString(),
      icon: UserCircle,
      color: 'bg-wharf-pink',
      description: 'Profile READMEs created'
    },
    {
      label: 'Profile READMEs',
      value: isLoading ? '--' : stats.readmesGenerated.toLocaleString(),
      icon: FileText,
      color: 'bg-wharf-cyan',
      description: 'Docs generated'
    },
    {
      label: 'Total Stars',
      value: isLoading ? '--' : stats.totalStars.toLocaleString(),
      icon: Star,
      color: 'bg-wharf-yellow',
      description: 'Across all profiles'
    },
    {
      label: 'Templates Used',
      value: isLoading ? '--' : stats.templatesUsed.toLocaleString(),
      icon: LayoutTemplate,
      color: 'bg-wharf-purple',
      description: 'Unique templates'
    },
    {
      label: 'Top Template',
      value: isLoading ? '--' : stats.topTemplate,
      icon: Palette,
      color: 'bg-wharf-green',
      description: 'Most popular'
    },
    {
      label: 'Last Generated',
      value: isLoading ? '--' : stats.lastGenerated,
      icon: Clock,
      color: 'bg-wharf-orange',
      description: 'Most recent activity'
    }
  ]

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
              onClick={() => window.location.href = '/login'}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-wharf-surface-secondary border-y-4 border-wharf-border-primary w-full mt-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="cyan" className="mb-4 gap-2">
            <UserCircle className="w-3 h-3" />
            Your Profile Stats
          </Badge>
          <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-4">
            Your{' '}
            <span className="bg-gradient-to-r from-wharf-pink to-wharf-pink-dark bg-clip-text text-transparent">
              Profile Activity
            </span>
          </h2>
          <p className="font-mono text-base text-wharf-text-secondary max-w-2xl mx-auto capitalize">
            Your personal profile README analytics
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statItems.map((stat) => (
            <Card
              key={stat.label}
              variant="hard-sm"
              className="text-center group hover:translate-y-[-2px] transition-all duration-300"
            >
              <div className="flex flex-col items-center p-3">
                <div className={`w-10 h-10 ${stat.color} border-2 border-wharf-border-primary flex items-center justify-center mb-3 shadow-brutal-sm group-hover:shadow-brutal transition-all`}>
                  <stat.icon className="w-5 h-5 text-wharf-black" />
                </div>
                <div className="font-display font-black text-2xl md:text-3xl tracking-tighter">
                  {stat.value}
                </div>
                <div className="font-mono text-xs text-wharf-text-tertiary mt-1">
                  {stat.label}
                </div>
                <div className="font-mono text-[10px] text-wharf-text-tertiary/60 mt-0.5 capitalize">
                  {stat.description}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// Profile Generator Page
export const ProfileGeneratorPage = () => {
  const { user } = useAuthStore()
  
  // State Management
  const [appState, setAppState] = useState<'landing' | 'wizard' | 'history'>('landing')
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [generatedReadme, setGeneratedReadme] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  const [options, setOptions] = useState<ProfileOptionsType>({
    template: 'minimal',
    theme: 'tokyonight',
    githubBadges: ['stars', 'followers', 'views'],
    techStack: [],
    social: [],
    showStats: true,
    showTopLanguages: true,
    showContributions: true,
    showTrophies: true,
    showStreak: true
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [activeTab, setActiveTab] = useState('layout')

  // Simulate Progress For Better UX
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + 5
        })
      }, 500)
      return () => clearInterval(interval)
    } else {
      setGenerationProgress(0)
    }
  }, [isGenerating])

  const handleFetchProfile = async (username: string) => {
    setIsGenerating(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/profile/${username}`, {
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().token || ''}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch profile')

      const data = await response.json()
      if (data.success) {
        setProfileData(data.data)
        setCurrentStep(2)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerate = async () => {
    if (!profileData) return
    
    setIsGenerating(true)
    setGeneratedReadme('')
    setGenerationProgress(0)
    setCurrentStep(3)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/profile/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token || ''}`
        },
        body: JSON.stringify({
          profileData,
          options
        })
      })

      if (!response.ok) throw new Error('Failed to generate profile README')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder('utf-8')
      if (!reader) return

      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')

        buffer = lines.pop() || ''

        for (const line of lines) {
          const cleanLine = line.trim()
          if (!cleanLine.startsWith('data: ')) continue
          
          const dataStr = cleanLine.slice(6)
          if (dataStr === '[DONE]') {
            setGenerationProgress(100)
            setRefreshTrigger(prev => prev + 1)
            break
          }

          try {
            const parsed = JSON.parse(dataStr)
            if (parsed.error) {
              console.error(parsed.error)
              alert(parsed.error)
              break
            }
            if (parsed.text) {
              setGeneratedReadme((prev) => prev + parsed.text)
              setGenerationProgress(prev => Math.min(prev + 0.5, 95))
            }
          } catch {
            // Partial JSON - ignore and continue
          }
        }
      }
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const steps = [
    { step: 1, label: 'Enter Profile', icon: User },
    { step: 2, label: 'Customize', icon: Settings2 },
    { step: 3, label: 'Generate', icon: Sparkles },
    { step: 4, label: 'Export', icon: Download }
  ]

  const canProceedToStep = (step: number) => {
    if (step === 1) return true
    if (step === 2 && profileData) return true
    if (step === 3 && generatedReadme) return true
    if (step === 4 && generatedReadme) return true
    return false
  }

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
              Create a Stunning
              <br />
              <span className="bg-gradient-to-r from-wharf-pink to-wharf-pink-dark bg-clip-text text-transparent">
                GitHub Profile README
              </span>
            </h2>
            
            <p className="font-mono text-base md:text-lg text-wharf-text-secondary max-w-2xl mx-auto capitalize">
              Generate a beautiful, professional profile README that stands out in seconds...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => {
                setProfileData(null)
                setGeneratedReadme('')
                setCurrentStep(1)
                setAppState('wizard')
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
              <span className="bg-gradient-to-r from-wharf-cyan to-wharf-cyan-dark bg-clip-text text-transparent">
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
                color: 'bg-wharf-pink'
              },
              { 
                step: '02', 
                title: 'Customize Design', 
                desc: 'Choose template, theme, and sections', 
                icon: Palette,
                color: 'bg-wharf-cyan'
              },
              { 
                step: '03', 
                title: 'Generate & Export', 
                desc: 'Get your profile README in seconds', 
                icon: Sparkles,
                color: 'bg-wharf-green'
              }
            ].map((item, index) => (
              <div key={item.step} className="relative w-full">
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-16 w-16 h-0.75 bg-wharf-border-primary" />
                )}
                
                <Card variant="hard" className="text-center h-full w-full hover:translate-y-[-4px] transition-all duration-300">
                  <div className="flex flex-col items-center p-4 md:p-6 w-full">
                    <div className={`w-12 h-12 ${item.color} border-2 border-wharf-border-primary flex items-center justify-center mb-4 shadow-brutal-sm flex-shrink-0`}>
                      <span className="font-mono font-black text-sm text-wharf-black">
                        {item.step}
                      </span>
                    </div>

                    <div className="w-16 h-16 border-2 border-wharf-border-primary bg-wharf-surface-primary flex items-center justify-center mb-4 shadow-brutal-sm flex-shrink-0">
                      <item.icon className="w-8 h-8 text-wharf-text-primary" />
                    </div>

                    <h3 className="font-display font-black text-xl mb-2 text-center">{item.title}</h3>
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
  )

  if (appState === 'landing') {
    return (
      <main className="min-h-screen">
        <LandingState />
      </main>
    )
  }

  return (
    <PageWrapper title="" description="">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {appState === 'history' && (
          <div className="space-y-6 animate-fadeInUp">
            <button 
              onClick={() => setAppState('landing')} 
              className="flex items-center gap-2 font-mono text-sm font-bold text-wharf-text-secondary hover:text-wharf-pink transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            <div className="bg-wharf-surface-secondary border-4 border-wharf-border-primary p-6 md:p-8">
              <h3 className="font-display font-black text-2xl tracking-tighter flex items-center gap-2 mb-6">
                <History className="w-6 h-6 text-wharf-pink" />
                Profile History
              </h3>
              <ProfileHistoryView 
                onSelect={(content) => {
                  setGeneratedReadme(content)
                  setCurrentStep(4)
                  setAppState('wizard')
                }} 
              />
            </div>
          </div>
        )}

        {appState === 'wizard' && (
          <div className="space-y-6">
            {/* Header With Back Button */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setAppState('landing')} 
                className="flex items-center gap-2 font-mono text-sm font-bold text-wharf-text-secondary hover:text-wharf-pink transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>
              {profileData && (
                <Badge variant="cyan" className="gap-1">
                  <FaGithub className="w-3 h-3" />
                  @{profileData.username}
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
                  const isActive = currentStep === s.step
                  const isCompleted = currentStep > s.step
                  const isAccessible = canProceedToStep(s.step)
                  
                  return (
                    <button
                      key={s.step}
                      onClick={() => {
                        if (canProceedToStep(s.step)) {
                          setCurrentStep(s.step)
                        }
                      }}
                      disabled={!isAccessible}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className={`
                        w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                        ${isActive 
                          ? 'bg-wharf-pink border-wharf-border-primary shadow-brutal-sm' 
                          : isCompleted 
                            ? 'bg-wharf-green border-wharf-border-primary' 
                            : 'bg-wharf-surface-secondary border-wharf-border-secondary'
                        }
                        ${isAccessible && !isActive && !isCompleted ? 'hover:border-wharf-pink hover:bg-wharf-pink/10' : ''}
                        ${!isAccessible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-wharf-black" />
                        ) : (
                          <s.icon className={`w-5 h-5 ${isActive ? 'text-wharf-black' : 'text-wharf-text-tertiary'}`} />
                        )}
                      </div>
                      <span className={`font-mono text-xs font-bold hidden sm:block ${
                        isActive ? 'text-wharf-pink' : 'text-wharf-text-tertiary'
                      }`}>
                        {s.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Main Content Card */}
            <Card variant="hard" className="overflow-hidden">
              <div className="p-6 md:p-8">
                
                {/* Step 1: Enter Profile */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fadeInUp">
                    <div className="text-center mb-4">
                      <h3 className="font-display font-black text-2xl tracking-tighter">Enter Your GitHub Profile</h3>
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
                      <h3 className="font-display font-black text-2xl tracking-tighter">Customize Your Profile</h3>
                      <p className="font-mono text-sm text-wharf-text-secondary mt-2 capitalize">
                        Choose template, theme, and sections for your README
                      </p>
                    </div>
                    
                    {profileData ? (
                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                        
                        {/* Main Customizable Area */}
                        <div className="space-y-6">
                          
                          {/* Tab Buttons */}
                          <div className="flex overflow-x-auto border-b-2 border-wharf-border-secondary gap-2 pb-2">
                            {['layout', 'stack', 'social', 'widgets', 'preview'].map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 font-mono text-sm border-2 transition-all ${activeTab === tab ? 'bg-wharf-pink border-wharf-border-primary font-bold shadow-brutal-sm -translate-y-1 text-black' : 'bg-transparent border-transparent text-wharf-text-secondary hover:bg-wharf-surface-secondary'}`}
                              >
                                {tab.toUpperCase()}
                              </button>
                            ))}
                          </div>

                          {/* Tab Content */}
                          <div className="min-h-[300px]">
                            {activeTab === 'layout' && (
                              <div className="space-y-6">
                                <div>
                                  <h4 className="font-mono font-bold flex items-center gap-2 mb-3"><LayoutTemplate className="w-4 h-4 text-wharf-cyan"/> Core Layout & Theme</h4>
                                  <TemplateSelector 
                                    selected={options.template} 
                                    onChange={(template: any) => setOptions({...options, template})} 
                                  />
                                  <div className="mt-4">
                                    <ThemePicker selected={options.theme} onChange={(t: string) => setOptions({...options, theme: t})} />
                                  </div>
                                </div>
                                <BioGenerator bio={profileData.bio} onGenerate={(newBio: string) => setProfileData({ ...profileData, bio: newBio })} />
                              </div>
                            )}

                            {activeTab === 'stack' && (
                              <div className="space-y-4">
                                <h4 className="font-mono font-bold flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-wharf-purple"/> Your Tech Stack</h4>
                                <p className="font-mono text-xs text-wharf-text-secondary mb-4">Select the technologies you actively use to generate beautiful skill badges.</p>
                                <TechStackSelector 
                                  selected={options.techStack} 
                                  onChange={(stack: string[]) => setOptions({...options, techStack: stack})} 
                                  detectedStack={profileData.techStack}
                                />
                              </div>
                            )}

                            {activeTab === 'social' && (
                              <div className="space-y-4">
                                <h4 className="font-mono font-bold flex items-center gap-2 mb-3"><UserCircle className="w-4 h-4 text-wharf-pink"/> Connect & Social Badges</h4>
                                <p className="font-mono text-xs text-wharf-text-secondary mb-4">Add your handles to display 'Let's Connect' badges on your profile.</p>
                                <SocialBadgesInput 
                                  links={options.social}
                                  onChange={(links: { provider: string; url: string }[]) => setOptions({...options, social: links})}
                                />
                              </div>
                            )}

                            {activeTab === 'widgets' && (
                              <div className="space-y-4">
                                <h4 className="font-mono font-bold flex items-center gap-2 mb-3"><Star className="w-4 h-4 text-wharf-yellow"/> Widgets & Trophies</h4>
                                <p className="font-mono text-xs text-wharf-text-secondary mb-4">Toggle various graphical stats and repo visualizers.</p>
                                <WidgetsCustomizer 
                                  options={options}
                                  onChange={setOptions}
                                />
                              </div>
                            )}

                            {activeTab === 'preview' && (
                              <div className="space-y-4">
                                <h4 className="font-mono font-bold flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-wharf-pink"/> Live Preview</h4>
                                <p className="font-mono text-xs text-wharf-text-secondary mb-4">See how your profile will look immediately.</p>
                                <ReadmePreview content={generatePreviewMarkdown(profileData, options)} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Column - Preview Card */}
                        <div className="space-y-6">
                           <Card variant="hard-sm" className="p-4 sticky top-6">
                            <div className="flex items-center gap-3 mb-3">
                              <img 
                                src={profileData.avatarUrl} 
                                alt={profileData.username}
                                className="w-12 h-12 border-2 border-wharf-border-primary rounded-full"
                              />
                              <div>
                                <h4 className="font-display font-black text-lg tracking-tighter leading-tight">
                                  {profileData.name || profileData.username}
                                </h4>
                                <p className="font-mono text-[10px] text-wharf-text-tertiary">
                                  @{profileData.username} • {profileData.followers} followers
                                </p>
                              </div>
                            </div>
                            
                            <hr className="border-wharf-border-secondary my-3" />
                            
                            <div className="space-y-2">
                              <p className="font-mono text-xs text-wharf-text-secondary">Selected Stack: {options.techStack.length}</p>
                              <p className="font-mono text-xs text-wharf-text-secondary">Social Links: {options.social.length}</p>
                              <p className="font-mono text-xs text-wharf-text-secondary">Widgets Active: {[options.showStats, options.showTopLanguages, options.showTrophies, options.showStreak].filter(Boolean).length}</p>
                            </div>
                          </Card>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="font-mono text-wharf-text-tertiary">Please enter a username first.</p>
                        <Button variant="ghost" onClick={prevStep} className="mt-4">
                          Go Back
                        </Button>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    {profileData && (
                      <div className="flex justify-between mt-6 pt-4 border-t-2 border-wharf-border-secondary">
                        <Button variant="ghost" onClick={prevStep} icon={<ArrowLeft className="w-4 h-4" />}>
                          Back
                        </Button>
                        <Button 
                          variant="primary" 
                          onClick={handleGenerate}
                          icon={<Sparkles className="w-4 h-4" />}
                        >
                          Generate Profile
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Generate */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fadeInUp">
                    <div className="text-center mb-4">
                      <h3 className="font-display font-black text-2xl tracking-tighter">
                        {isGenerating ? 'Generating Your Profile' : 'Preview Your Profile'}
                      </h3>
                      <p className="font-mono text-sm text-wharf-text-tertiary mt-1 mb-8 capitalize">
                        {isGenerating ? 'AI is creating your GitHub profile README...' : 'Review your generated profile'}
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
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wharf-pink opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-wharf-pink" />
                          </span>
                          <span className="font-mono text-xs text-wharf-text-tertiary">
                            Analyzing profile data...
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {generatedReadme && !isGenerating && (
                      <>
                        <ReadmePreview content={generatedReadme} onContentChange={setGeneratedReadme} />
                        <div className="flex justify-between mt-6 pt-4 border-t-2 border-wharf-border-secondary">
                          <Button variant="ghost" onClick={prevStep} icon={<ArrowLeft className="w-4 h-4" />}>
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
                    <div className="text-center mb-4">
                      <h3 className="font-display font-black text-2xl tracking-tighter">Export Your Profile README</h3>
                      <p className="font-mono text-sm text-wharf-text-tertiary mt-1 mb-8 capitalize">
                        Save, download, or deploy your profile README
                      </p>
                    </div>
                    
                    {generatedReadme ? (
                      <>
                        <div className="bg-wharf-surface-secondary border-2 border-wharf-border-primary p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-wharf-pink" />
                            <span className="font-mono font-bold text-sm">{profileData?.username || 'profile'}-README.md</span>
                            <Badge variant="green" size="sm" className="ml-auto">
                              Ready
                            </Badge>
                          </div>
                          <p className="font-mono text-xs text-wharf-text-tertiary capitalize">
                            {generatedReadme.split(' ').length} words | {options.template} template | {options.theme} theme
                          </p>
                        </div>
                        <ProfileExportActions content={generatedReadme} username={profileData?.username} />
                        <div className="flex justify-start mt-6 pt-4 border-t-2 border-wharf-border-secondary">
                          <Button variant="ghost" onClick={prevStep} icon={<ArrowLeft className="w-4 h-4" />}>
                            Back to Preview
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <p className="font-mono text-wharf-text-tertiary">Generate a profile README first.</p>
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
  )
}