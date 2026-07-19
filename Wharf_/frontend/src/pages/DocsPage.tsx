import {
  BookOpen,
  Terminal,
  User,
  MessageSquare,
  Activity,
  ArrowRight,
  Settings,
  Zap,
  Sparkles,
  Shield,
  Code,
  Database,
  Layout,
  GitBranch,
  AlertCircle,
  FileText,
  Network,
  Lock,
  Key,
  RefreshCw,
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { Badge, Card } from '../components/ui';

export const DocsPage = () => {
  const tableOfContents = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Zap,
      color: 'text-wharf-pink-darker',
      desc: 'Connect your GitHub account & set up WHARF',
      bg: 'bg-wharf-pink/5',
    },
    {
      id: 'readme-generator',
      title: 'README Generator',
      icon: Terminal,
      color: 'text-wharf-cyan-darker',
      desc: 'Generate professional documentation for your projects',
      bg: 'bg-wharf-cyan/5',
    },
    {
      id: 'profile-generator',
      title: 'Profile Generator',
      icon: User,
      color: 'text-wharf-green-darker',
      desc: 'Create a standout GitHub profile README',
      bg: 'bg-wharf-green/5',
    },
    {
      id: 'codebase-chat',
      title: 'Codebase Chat',
      icon: MessageSquare,
      color: 'text-wharf-purple-darker',
      desc: 'Chat with your codebase using AI assistance',
      bg: 'bg-wharf-purple/5',
    },
    {
      id: 'health-changelog',
      title: 'Health & Changelogs',
      icon: Activity,
      color: 'text-wharf-error',
      desc: 'Monitor code health & automate changelogs',
      bg: 'bg-wharf-error/5',
    },
    {
      id: 'settings-byok',
      title: 'Settings & BYOK',
      icon: Settings,
      color: 'text-yellow-500',
      desc: 'Configure WHARF & bring your own API keys',
      bg: 'bg-yellow-500/5',
    },
  ];

  return (
    <main className="min-h-screen pb-12 w-full overflow-x-hidden bg-wharf-surface-primary">
      {/* Header Section */}
      <section className="pt-20 pb-14 w-full relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10 border-b-2 pb-10 border-wharf-border-secondary">
          <div className="text-center space-y-6">
            <Badge variant="pink" className="gap-2 mx-auto w-fit">
              <BookOpen className="w-3 h-3" />
              Documentation
            </Badge>

            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl tracking-tighter leading-[1.1]">
              Master Your <br />
              <span className="bg-yellow-500 bg-clip-text text-transparent">
                Documentation Workflow
              </span>
            </h1>

            <p className="font-mono text-base md:text-lg text-wharf-text-secondary max-w-3xl mx-auto capitalize">
              Everything you need to transform your repositories into professional, recruiter-ready
              documentation with WHARF's powerful AI-driven toolkit...
            </p>
          </div>
        </div>
      </section>

      {/* Table Of Contents Grid */}
      <section className="pb-16 w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tableOfContents.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block animate-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Card
                    variant="hard"
                    rounded="xl"
                    className={`p-6 h-full min-h-[150px] flex flex-col justify-between transition-all duration-300 group cursor-pointer ${item.bg} hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 border-2 border-wharf-border-primary relative overflow-hidden`}
                  >
                    {/* Number Badge */}
                    <div className="absolute top-3 right-3 font-mono text-xs font-black text-wharf-text-secondary opacity-70 group-hover:opacity-100 transition-opacity">
                      {(index + 1).toString().padStart(2, '0')}
                    </div>

                    <div className="relative z-10">
                      <div className={`flex items-start gap-4 mb-3`}>
                        <div
                          className={`w-12 h-12 border-2 border-wharf-border-primary bg-wharf-surface-secondary flex items-center justify-center rounded-xl shadow-brutal-sm shrink-0 ${item.bg}`}
                        >
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <h3
                            className={`font-display font-black text-lg transition-colors duration-300 uppercase ${item.color}`}
                          >
                            {item.title}
                          </h3>
                          <p className="font-mono text-sm text-wharf-text-secondary mt-1 leading-relaxed capitalize">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-center justify-end mt-2 relative z-10 pt-2 border-t-2 border-wharf-border-secondary">
                      <div className="flex items-center gap-1 text-wharf-text-secondary group-hover:text-wharf-pink-darker transition-all duration-300">
                        <span className="font-mono text-xs font-medium">Jump To</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Details Sections */}
      {/* 1. Getting Started */}
      <section
        id="getting-started"
        className="py-20 bg-wharf-background-primary border-y-4 border-wharf-border-primary w-full rounded-3xl scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="pink" className="mb-4 gap-2 mx-auto w-fit">
              <Zap className="w-3 h-3" />
              Getting Started
            </Badge>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-4">
              Set Up <span className="text-wharf-pink-darker">WHARF</span>
            </h2>
            <p className="font-mono text-base text-wharf-text-secondary max-w-2xl mx-auto capitalize">
              Connect your GitHub account & set up WHARF
            </p>
          </div>
          <Card
            variant="hard"
            rounded="2xl"
            className="p-8 md:p-10 bg-wharf-background-primary border-wharf-pink/30 hover:border-wharf-pink/50 transition-all max-w-5xl mx-auto"
          >
            <div className="space-y-8 font-mono text-sm text-wharf-text-secondary leading-relaxed">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 border-2 border-wharf-border-primary bg-wharf-pink/5 flex items-center justify-center rounded-lg">
                  <FaGithub className="w-5 h-5 text-wharf-pink-darker" />
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-wharf-text-primary text-base">
                    GitHub OAuth Integration
                  </h4>
                  <p>
                    WHARF operates exclusively by authorizing standard public metadata via the
                    official <strong className="text-wharf-pink-darker">GitHub OAuth</strong>{' '}
                    pipeline. Before you can generate documentation, evaluate codebase health, or
                    utilize AI architecture chats, you must connect your developer account.
                  </p>
                </div>
              </div>

              <div className="pl-6 border-l-4 border-wharf-pink-darker bg-wharf-pink/10 p-6 rounded-r-2xl">
                <h4 className="font-bold text-wharf-text-primary mb-4 flex items-center gap-2">
                  <FaGithub className="w-4 h-4 text-wharf-pink-darker" />
                  Quick Setup Guide
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-pink-darker rounded bg-wharf-pink/10 flex items-center justify-center font-black text-xs text-wharf-pink-darker">
                      1
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Login with GitHub:</span>{' '}
                      Click the "Login with GitHub" button on the global sidebar or mobile menu.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-pink-darker rounded bg-wharf-pink/10 flex items-center justify-center font-black text-xs text-wharf-pink-darker">
                      2
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Authorize Access:</span>{' '}
                      Grant WHARF the necessary read permissions for your public repositories and
                      profile data.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-pink-darker rounded bg-wharf-pink/10 flex items-center justify-center font-black text-xs text-wharf-pink-darker">
                      3
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Access Dashboard:</span>{' '}
                      Upon return, your comprehensive metadata cascades into your primary Dashboard.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-pink-darker rounded bg-wharf-pink/10 flex items-center justify-center font-black text-xs text-wharf-pink-darker">
                      4
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Navigate Platform:</span>{' '}
                      Use the persistent Bottom Navigation Bar (Mobile) or Sidebar (Desktop) to
                      transition across core features.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 2. README Generator */}
      <section id="readme-generator" className="py-20 bg-wharf-surface-primary scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="cyan" className="mb-4 gap-2 mx-auto w-fit">
              <Terminal className="w-3 h-3" />
              Documentation
            </Badge>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-4">
              README{' '}
              <span className="bg-wharf-cyan-darker bg-clip-text text-transparent">Generator</span>
            </h2>
            <p className="font-mono text-base text-wharf-text-secondary max-w-2xl mx-auto capitalize">
              Generate professional documentation in seconds
            </p>
          </div>
          <Card
            variant="hard"
            rounded="2xl"
            className="p-8 md:p-10 bg-wharf-surface-primary border-wharf-cyan/30 hover:border-wharf-cyan/50 transition-all max-w-5xl mx-auto"
          >
            <div className="space-y-8 font-mono text-sm text-wharf-text-secondary leading-relaxed">
              <p>
                The cornerstone feature of WHARF is interpreting complex repositories intuitively
                and returning standardized, top-tier instructional READMEs mapping architectural
                flow, installation routines, and tech stacks automatically.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 border-2 border-wharf-border-primary bg-wharf-cyan/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="w-4 h-4 text-wharf-cyan-darker" />
                    <h5 className="font-black text-wharf-text-primary">Tech Stack Detection</h5>
                  </div>
                  <p className="text-xs">
                    Automatically identifies and documents all technologies used in your repository.
                  </p>
                </div>
                <div className="p-5 border-2 border-wharf-border-primary bg-wharf-cyan/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-wharf-cyan-darker" />
                    <h5 className="font-black text-wharf-text-primary">Installation Guides</h5>
                  </div>
                  <p className="text-xs">
                    Generates step-by-step setup instructions based on your package.json or
                    requirements.
                  </p>
                </div>
              </div>

              <div className="pl-6 border-l-4 border-wharf-cyan-darker bg-wharf-cyan/10 p-6 rounded-r-2xl mt-8">
                <h4 className="font-bold text-wharf-text-primary mb-4 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-wharf-cyan-darker" />
                  Step-by-Step Workflow
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-cyan-darker rounded bg-wharf-cyan/10 flex items-center justify-center font-black text-xs text-wharf-cyan-darker">
                      1
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Select Repository:</span>{' '}
                      Enter any valid GitHub Repository URL or select from your pre-fetched projects
                      immediately on the home page.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-cyan-darker rounded bg-wharf-cyan/10 flex items-center justify-center font-black text-xs text-wharf-cyan-darker">
                      2
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">
                        Customize Parameters:
                      </span>{' '}
                      Choose which sections to include: architecture grids, API endpoints, usage
                      loops, or contribution rules.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-cyan-darker rounded bg-wharf-cyan/10 flex items-center justify-center font-black text-xs text-wharf-cyan-darker">
                      3
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Select Tone:</span> Pick
                      between Professional, Casual, or Marketing syntax tones to explicitly target
                      your audience.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-cyan-darker rounded bg-wharf-cyan/10 flex items-center justify-center font-black text-xs text-wharf-cyan-darker">
                      4
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Generate & Export:</span>{' '}
                      Let the AI construct the components natively. Review within the parsed
                      markdown window internally.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. Profile Generator */}
      <section
        id="profile-generator"
        className="py-20 bg-wharf-background-primary border-y-4 border-wharf-border-primary w-full rounded-3xl scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="green" className="mb-4 gap-2 mx-auto w-fit">
              <User className="w-3 h-3" />
              Profiles
            </Badge>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-4">
              Profile{' '}
              <span className="bg-wharf-green-darker bg-clip-text text-transparent">Generator</span>
            </h2>
            <p className="font-mono text-base text-wharf-text-secondary max-w-2xl mx-auto capitalize">
              Create a standout GitHub profile README
            </p>
          </div>
          <Card
            variant="hard"
            rounded="2xl"
            className="p-8 md:p-10 bg-wharf-background-primary border-wharf-green/30 hover:border-wharf-green/50 transition-all max-w-5xl mx-auto"
          >
            <div className="space-y-8 font-mono text-sm text-wharf-text-secondary leading-relaxed">
              <p>
                A powerful developer portfolio lives right on your GitHub homepage. WHARF introduces
                a highly specialized engine capable of assembling complex, data-rich personal
                landing states directly mapping your active statistical datasets.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 border-2 border-wharf-border-primary bg-wharf-green/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="w-4 h-4 text-wharf-green-darker" />
                    <h5 className="font-black text-wharf-text-primary">Metadata Hooking</h5>
                  </div>
                  <p className="text-xs">
                    Automatically queries your global follower metrics, aggregate star count, and
                    total PR integrations.
                  </p>
                </div>
                <div className="p-5 border-2 border-wharf-border-primary bg-wharf-green/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-wharf-green-darker" />
                    <h5 className="font-black text-wharf-text-primary">Automated Bio</h5>
                  </div>
                  <p className="text-xs">
                    Input a single summary sentence and WHARF expands it into recruiter-verified,
                    compelling prose.
                  </p>
                </div>
                <div className="p-5 border-2 border-wharf-border-primary bg-wharf-green/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Layout className="w-4 h-4 text-wharf-green-darker" />
                    <h5 className="font-black text-wharf-text-primary">Dynamic Layouts</h5>
                  </div>
                  <p className="text-xs">
                    Choose from multiple design templates optimized for different professional
                    audiences.
                  </p>
                </div>
              </div>

              <div className="pl-6 border-l-4 border-wharf-green-darker bg-wharf-green/10 p-6 rounded-r-2xl mt-8">
                <h4 className="font-bold text-wharf-text-primary mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-wharf-green-darker" />
                  Profile Creation Loop
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-green-darker rounded bg-wharf-green/10 flex items-center justify-center font-black text-xs text-wharf-green-darker">
                      1
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Navigate to Tool:</span>{' '}
                      Open the "Profile Generator" natively from the universal sidebar grid.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-green-darker rounded bg-wharf-green/10 flex items-center justify-center font-black text-xs text-wharf-green-darker">
                      2
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Insert Metadata:</span>{' '}
                      Provide a rapid single-sentence summary of your current learning capabilities.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-green-darker rounded bg-wharf-green/10 flex items-center justify-center font-black text-xs text-wharf-green-darker">
                      3
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Extract Statistics:</span>{' '}
                      WHARF dynamically constructs metric cards directly binding to your globally
                      recognized endpoints.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-green-darker rounded bg-wharf-green/10 flex items-center justify-center font-black text-xs text-wharf-green-darker">
                      4
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Export Data:</span> Copy
                      the resulting markdown blocks into a repository explicitly matching your
                      standard GitHub handle to expose it beautifully!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 4. Codebase Chat */}
      <section id="codebase-chat" className="py-20 bg-wharf-surface-primary scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="purple" className="mb-4 gap-2 mx-auto w-fit">
              <MessageSquare className="w-3 h-3" />
              AI Assistant
            </Badge>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-4">
              Codebase{' '}
              <span className="bg-wharf-purple-darker bg-clip-text text-transparent">Chat</span>
            </h2>
            <p className="font-mono text-base text-wharf-text-secondary max-w-2xl mx-auto capitalize">
              Chat with your codebase using AI
            </p>
          </div>
          <Card
            variant="hard"
            rounded="2xl"
            className="p-8 md:p-10 bg-wharf-surface-primary border-wharf-purple/30 hover:border-wharf-purple/50 transition-all max-w-5xl mx-auto"
          >
            <div className="space-y-6 font-mono text-sm text-wharf-text-secondary leading-relaxed">
              <p>
                Transition seamlessly beyond static documentation and interrogate your architecture
                continuously. The Codebase Chat system clones your targeted repository context
                safely into active application memory.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 border-2 border-wharf-border-primary bg-wharf-purple/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Network className="w-4 h-4 text-wharf-purple-darker" />
                    <h5 className="font-black text-wharf-text-primary">Architecture Exploration</h5>
                  </div>
                  <p className="text-xs">
                    Ask questions about routing, dependencies, and architectural patterns in
                    real-time.
                  </p>
                </div>
                <div className="p-5 border-2 border-wharf-border-primary bg-wharf-purple/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-wharf-purple-darker" />
                    <h5 className="font-black text-wharf-text-primary">Security Analysis</h5>
                  </div>
                  <p className="text-xs">
                    Identify potential vulnerabilities and security liabilities through AI-powered
                    analysis.
                  </p>
                </div>
              </div>

              <div className="pl-6 border-l-4 border-wharf-purple-darker bg-wharf-purple/10 p-6 rounded-r-2xl mt-8">
                <h4 className="font-bold text-wharf-text-primary mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-wharf-purple-darker" />
                  Interaction Process
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-purple-darker rounded bg-wharf-purple/10 flex items-center justify-center font-black text-xs text-wharf-purple-darker">
                      1
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Select Component:</span>{' '}
                      Enter into standard codebase conversation states natively from the chat hub
                      globally on WHARF.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-purple-darker rounded bg-wharf-purple/10 flex items-center justify-center font-black text-xs text-wharf-purple-darker">
                      2
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Target Repository:</span>{' '}
                      Anchor a particular target codebase mapping into semantic AI logic frames
                      dynamically.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-purple-darker rounded bg-wharf-purple/10 flex items-center justify-center font-black text-xs text-wharf-purple-darker">
                      3
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">
                        Request Code Arrays:
                      </span>{' '}
                      Prompt standard instructions ("How is authorization handled?" or "Find
                      inefficient loops here").
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-purple-darker rounded bg-wharf-purple/10 flex items-center justify-center font-black text-xs text-wharf-purple-darker">
                      4
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">
                        Draw Visuals (Pro-tip):
                      </span>{' '}
                      Specifically ask the AI array: "Generate a Mermaid diagram for this component
                      structure" and view the immediate interactive maps naturally!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 5. Health & Changelogs */}
      <section
        id="health-changelog"
        className="py-20 bg-wharf-background-primary border-y-4 border-wharf-border-primary w-full rounded-3xl scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="default" className="mb-4 gap-2 mx-auto w-fit text-wharf-text-primary">
              <Activity className="w-3 h-3" />
              Analytics
            </Badge>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-4">
              Health & <span className="text-wharf-error">Changelogs</span>
            </h2>
            <p className="font-mono text-base text-wharf-text-secondary max-w-2xl mx-auto capitalize">
              Monitor code health & automate changelogs
            </p>
          </div>
          <Card
            variant="hard"
            rounded="2xl"
            className="p-8 md:p-10 bg-wharf-background-primary border-wharf-error/30 hover:border-wharf-error/50 transition-all max-w-5xl mx-auto"
          >
            <div className="space-y-8 font-mono text-sm text-wharf-text-secondary leading-relaxed">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 border-2 border-wharf-border-primary bg-wharf-error/5 flex items-center justify-center rounded-lg">
                  <Shield className="w-5 h-5 text-wharf-error" />
                </div>
                <div className="space-y-4 flex-1">
                  <h4 className="font-bold text-wharf-text-primary text-base">
                    Architecture Health Score
                  </h4>
                  <p>
                    Ensure your legacy repositories aren't slowly accumulating technical debt. Run
                    the standard Health Check to scan existing README configurations and receive a
                    grade (A-F), alongside targeted remediation flags detecting absent installations
                    headers, broken routing URLs, and ambiguous usage semantics.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Badge
                      variant="default"
                      className="bg-wharf-green/20 text-wharf-green-darker border-wharf-green"
                    >
                      A - Excellent
                    </Badge>
                    <Badge
                      variant="default"
                      className="bg-wharf-yellow/20 text-yellow-400 border-yellow-500"
                    >
                      B - Good
                    </Badge>
                    <Badge
                      variant="default"
                      className="bg-wharf-orange/20 text-orange-400 border-orange-500"
                    >
                      C - Needs Work
                    </Badge>
                    <Badge
                      variant="default"
                      className="bg-wharf-error/20 text-wharf-error border-wharf-error"
                    >
                      D/F - Critical
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-6 border-t-2 border-wharf-border-secondary">
                <div className="shrink-0 w-10 h-10 border-2 border-wharf-border-primary bg-wharf-error/5 flex items-center justify-center rounded-lg">
                  <GitBranch className="w-5 h-5 text-wharf-error" />
                </div>
                <div className="space-y-4 flex-1">
                  <h4 className="font-bold text-wharf-text-primary text-base">
                    Automated Changelogs
                  </h4>
                  <p>
                    Tether the WHARF Changelog agent securely to your latest GitHub commits
                    pipeline. Through sophisticated semantic grouping, WHARF groups mundane commits
                    into standardized, publish-ready{' '}
                    <code className="bg-wharf-surface-secondary px-2 py-1 border border-wharf-border-secondary">
                      CHANGELOG.md
                    </code>{' '}
                    version releases formatted for professional community broadcasts.
                  </p>
                </div>
              </div>

              <div className="pl-6 border-l-4 border-wharf-error bg-wharf-error/10 p-6 rounded-r-2xl mt-8">
                <h4 className="font-bold text-wharf-text-primary mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-wharf-error" />
                  Changelog Execution
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-error rounded bg-wharf-error/10 flex items-center justify-center font-black text-xs text-wharf-error">
                      1
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Commit Tracking:</span>{' '}
                      Access the native "Changelogs" tab interface via your authenticated dashboard.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-error rounded bg-wharf-error/10 flex items-center justify-center font-black text-xs text-wharf-error">
                      2
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Pull Metadata:</span>{' '}
                      Select targets and automatically drag recent PR logic and commits efficiently.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-error rounded bg-wharf-error/10 flex items-center justify-center font-black text-xs text-wharf-error">
                      3
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">
                        Intelligent Grouping:
                      </span>{' '}
                      WHARF scans semantic keys ("feat:", "fix:", "chore:") explicitly.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-wharf-error rounded bg-wharf-error/10 flex items-center justify-center font-black text-xs text-wharf-error">
                      4
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Generate Report:</span>{' '}
                      Copy exactly rendered markdown outputs categorizing your explicit engineering
                      achievements intuitively.
                      <br />
                      <span className="text-xs text-wharf-text-tertiary">
                        (Ex: "fix: auth typo" → "### Bugs Squashed - Authentication Typo Resolved")
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 6. Settings & BYOK */}
      <section id="settings-byok" className="py-20 bg-wharf-surface-primary scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge
              variant="default"
              className="mb-4 gap-2 mx-auto w-fit text-wharf-text-primary"
            >
              <Settings className="w-3 h-3" />
              Configuration
            </Badge>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-4">
              Settings & <span className="text-yellow-600">BYOK</span>
            </h2>
            <p className="font-mono text-base text-wharf-text-secondary max-w-2xl mx-auto capitalize">
              Configure WHARF and bring your own API keys
            </p>
          </div>
          <Card
            variant="hard"
            rounded="2xl"
            className="p-8 md:p-10 bg-wharf-surface-primary border-yellow-500/30 hover:border-yellow-500/50 transition-all max-w-5xl mx-auto"
          >
            <div className="space-y-8 font-mono text-sm text-wharf-text-secondary leading-relaxed">
              <p>
                WHARF implements strict token thresholds specifically to combat unauthorized
                scraping and infrastructure depreciation. When default limits conclude rapidly, you
                are systematically empowered to integrate native API routing safely via{' '}
                <strong className="text-yellow-600">BYOK (Bring Your Own Key)</strong> systems.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 border-2 border-wharf-border-primary bg-yellow-500/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Key className="w-4 h-4 text-yellow-600" />
                    <h5 className="font-black text-wharf-text-primary">Provider Support</h5>
                  </div>
                  <p className="text-xs">
                    Supports Google Gemini, Groq, OpenAI, and more. Choose the provider that fits
                    your needs.
                  </p>
                </div>
                <div className="p-5 border-2 border-wharf-border-primary bg-yellow-500/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-4 h-4 text-yellow-600" />
                    <h5 className="font-black text-wharf-text-primary">Secure Storage</h5>
                  </div>
                  <p className="text-xs">
                    Your API keys are encrypted and stored securely. Never shared with third
                    parties.
                  </p>
                </div>
              </div>

              <div className="pl-6 border-l-4 border-yellow-600 bg-yellow-500/10 p-6 rounded-r-2xl">
                <h4 className="font-bold text-wharf-text-primary mb-4 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-yellow-600" />
                  Configuration Steps
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-yellow-600 rounded bg-yellow-500/10 flex items-center justify-center font-black text-xs text-yellow-600">
                      1
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">
                        Navigate to Settings:
                      </span>{' '}
                      Access the universal Settings page via the sidebar navigation.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-yellow-600 rounded bg-yellow-500/10 flex items-center justify-center font-black text-xs text-yellow-600">
                      2
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">API Key Management:</span>{' '}
                      Expand the robust API Keys dropdown modal framework.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-yellow-600 rounded bg-yellow-500/10 flex items-center justify-center font-black text-xs text-yellow-600">
                      3
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Select Provider:</span>{' '}
                      Choose from Google Gemini, Groq, OpenAI, or other supported providers.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 border-2 border-yellow-600 rounded bg-yellow-500/10 flex items-center justify-center font-black text-xs text-yellow-600">
                      4
                    </div>
                    <div>
                      <span className="font-bold text-wharf-text-primary">Activate:</span> Paste
                      your key and click Activate. WHARF will instantaneously override default
                      global limits.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border-2 border-wharf-border-primary bg-wharf-background-primary rounded-xl">
                <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-xs text-wharf-text-secondary">
                  <strong className="text-yellow-500">Note:</strong> Your API key is stored locally
                  and never transmitted to our servers. You retain full control over your data and
                  API usage.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
};
