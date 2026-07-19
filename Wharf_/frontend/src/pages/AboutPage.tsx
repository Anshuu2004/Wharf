import { FaGithub, FaLinkedin, FaDiscord } from 'react-icons/fa';
import {
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiFramer,
  SiNodedotjs,
  SiExpress,
  SiPrisma,
  SiPostgresql,
  SiVercel,
  SiRailway,
  SiSupabase,
  SiGooglegemini,
} from 'react-icons/si';
import {
  ArrowRight,
  Shield,
  Code,
  Heart,
  Star,
  Mail,
  Zap,
  Check,
  User,
  X,
  GitBranch,
  Terminal,
} from 'lucide-react';
import { Badge, Button, Card } from '../components/ui';

export const AboutPage = () => {
  const techStack = [
    {
      category: 'Frontend',
      items: [
        { name: 'React', icon: SiReact },
        { name: 'TypeScript', icon: SiTypescript },
        { name: 'Tailwind CSS', icon: SiTailwindcss },
        { name: 'Framer Motion', icon: SiFramer },
      ],
    },
    {
      category: 'Backend',
      items: [
        { name: 'Node.js', icon: SiNodedotjs },
        { name: 'Express', icon: SiExpress },
        { name: 'Prisma', icon: SiPrisma },
        { name: 'PostgreSQL', icon: SiPostgresql },
      ],
    },
    {
      category: 'AI',
      items: [
        { name: 'Gemini', icon: SiGooglegemini },
        { name: 'Vercel AI SDK', icon: Terminal },
      ],
    },
    {
      category: 'Infrastructure',
      items: [
        { name: 'Vercel', icon: SiVercel },
        { name: 'Railway', icon: SiRailway },
        { name: 'Supabase', icon: SiSupabase },
      ],
    },
  ];

  const socialLinks = [
    {
      icon: FaGithub,
      href: 'https://github.com/FrostByte-49',
      label: 'GitHub',
      color: 'hover:bg-wharf-text-tertiary/50',
    },
    {
      icon: FaLinkedin,
      href: 'https://linkedin.com/in/pranav-kh',
      label: 'LinkedIn',
      color: 'hover:bg-wharf-cyan',
    },
    {
      icon: Mail,
      href: 'mailto:pranav.kh25@gmail.com',
      label: 'Email',
      color: 'hover:bg-wharf-error',
    },
    {
      icon: FaDiscord,
      href: 'https://discord.com/users/1377918872925241375',
      label: 'Discord',
      color: 'hover:bg-wharf-purple',
    },
    {
      icon: User,
      href: 'https://pranavkh.vercel.app/',
      label: 'Portfolio',
      color: 'hover:bg-yellow-500',
    },
  ];

  return (
    <main className="min-h-screen pb-12 w-full overflow-x-hidden">
      {/* Section 1 - What Is Wharf */}
      <section className="py-20 bg-wharf-surface-primary w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-6">
            <Badge variant="pink" className="gap-2 mx-auto w-fit">
              <Zap className="w-3 h-3" />
              About WHARF
            </Badge>

            <h1 className="font-display font-black text-4xl md:text-5xl tracking-tighter leading-[1.1]">
              What is{' '}
              <span className="bg-wharf-pink-dark bg-clip-text text-transparent">WHARF?</span>
            </h1>

            <div className="space-y-6 font-mono text-base md:text-lg text-wharf-text-secondary leading-relaxed max-w-5xl mx-auto">
              <p className="text-justify">
                WHARF is an{' '}
                <span className="text-wharf-pink font-bold">
                  AI-powered documentation workflow platform{' '}
                </span>
                that transforms GitHub repositories into clean, professional, recruiter-ready
                documentation in seconds. It automates the tedious process of writing and
                maintaining documentation, allowing developers to focus on what they do best i.e.
                writing code.
              </p>
              <p className="text-justify">
                The platform analyzes your repository structure, detects your tech stack, and
                generates comprehensive documentation that follows industry best practices. Whether
                you're a student building your portfolio, an open-source maintainer, or a team
                looking for consistent documentation standards, WHARF adapts to your needs with
                multiple tones and customizable sections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Problem & Solution */}
      <section className="py-20 bg-wharf-background-primary border-y-4 border-wharf-border-primary w-full rounded-3xl mt-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="cyan" className="mb-4 gap-2 mx-auto w-fit">
              <Shield className="w-3 h-3" />
              Why WHARF?
            </Badge>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-4">
              The Problem &{' '}
              <span className="bg-wharf-cyan-darker bg-clip-text text-transparent">
                The Solution
              </span>
            </h2>
            <p className="font-mono text-base text-wharf-text-secondary max-w-2xl mx-auto capitalize">
              Why WHARF exists & how it solves the documentation problem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {/* Problem */}
            <Card
              variant="hard"
              rounded="2xl"
              className="p-8 bg-wharf-error/5 border-wharf-error/30 hover:border-wharf-error/60 transition-all"
            >
              <div className="flex items-center gap-3 mb-6">
                <h3 className="font-display font-black text-2xl tracking-tighter">The Problem</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Good code goes unnoticed without proper documentation',
                  'Writing documentation takes hours of manual effort',
                  'No standardized format across different repositories',
                  "Recruiters can't quickly understand your work",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 font-mono text-sm text-wharf-text-secondary"
                  >
                    <div className="w-5 h-5 border-2 border-wharf-error bg-wharf-error/10 flex items-center justify-center rounded flex-shrink-0 mt-0.5">
                      <X className="h-3 w-3 text-wharf-error" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Solution */}
            <Card
              variant="hard"
              rounded="2xl"
              className="p-8 bg-wharf-green/5 border-wharf-green/30 hover:border-wharf-green/60 transition-all"
            >
              <div className="flex items-center gap-3 mb-6">
                <h3 className="font-display font-black text-2xl tracking-tighter">The Solution</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'AI-powered README generation in seconds',
                  'Professional, recruiter-ready documentation',
                  'Consistent, industry-standard formatting',
                  'Multiple tones for different audiences',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 font-mono text-sm text-wharf-text-secondary"
                  >
                    <div className="w-5 h-5 border-2 border-wharf-green-darker bg-wharf-green/10 flex items-center justify-center rounded flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-wharf-green-darker" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 3 - Tech Stack */}
      <section className="py-20 bg-wharf-surface-primary w-full">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="purple" className="mb-4 gap-2 mx-auto w-fit">
              <Code className="w-3 h-3" />
              Tech Stack
            </Badge>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-4">
              Built With{' '}
              <span className="bg-yellow-500 bg-clip-text text-transparent">Modern Tools</span>
            </h2>
            <p className="font-mono text-base text-wharf-text-secondary max-w-2xl mx-auto capitalize">
              The technologies powering the WHARF platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((stack) => (
              <Card
                key={stack.category}
                variant="hard-sm"
                rounded="2xl"
                className="p-6 hover:translate-y-[-4px] transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <h4 className="font-display font-black text-xl tracking-tighter mb-4">
                  {stack.category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {stack.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Badge
                        key={item.name}
                        variant="default"
                        size="sm"
                        className="gap-1.5 py-1.5 px-3"
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {item.name}
                      </Badge>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 - Developer Info */}
      <section className="py-20 bg-wharf-background-primary border-y-4 border-wharf-border-primary w-full rounded-3xl mt-8 mb-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="pink" className="mb-4 gap-2 mx-auto w-fit">
              <Heart className="w-3 h-3" />
              Built by
            </Badge>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-4">
              The Creator{' '}
              <span className="bg-wharf-purple-darker bg-clip-text text-transparent">
                Behind WHARF
              </span>
            </h2>
            <p className="font-mono text-base text-wharf-text-secondary max-w-2xl mx-auto capitalize">
              Passionate developer, 8x hackathon winner & open source contributor
            </p>
          </div>

          <Card
            variant="hard"
            rounded="2xl"
            className="max-w-6xl mx-auto overflow-hidden p-0 bg-wharf-surface-primary group shadow-brutal-lg"
          >
            {/* Flex Container */}
            <div className="flex flex-col lg:flex-row items-stretch w-full h-full">
              {/* Avatar */}
              <div className="relative w-full lg:w-5/12 shrink-0 flex-none h-72 lg:h-auto min-h-[350px] overflow-hidden bg-wharf-surface-secondary rounded-xl">
                <img
                  src="https://res.cloudinary.com/dhn92qb61/image/upload/f_auto,q_auto/v1784448655/Me__ifeufh.webp"
                  alt="Pranav Khalate"
                  className="w-full h-full object-cover object-top transition-all duration-700 hover:scale-105 origin-center"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 p-8 md:pl-10 flex flex-col justify-center text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-black text-3xl md:text-4xl tracking-tighter hover:text-yellow-500 transition-colors cursor-pointer">
                      Pranav Khalate
                    </h3>
                    <p className="font-mono text-sm text-wharf-text-secondary mt-1">
                      Computer Engineering Student @ Mumbai University
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {[
                    { icon: Zap, label: '8x', sub: 'Hackathon Winner', color: 'bg-wharf-pink' },
                    { icon: Code, label: 'Full Stack', sub: 'Developer', color: 'bg-wharf-cyan' },
                    {
                      icon: GitBranch,
                      label: 'Open Source',
                      sub: 'Contributor',
                      color: 'bg-wharf-green',
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className={`${item.color} border-2 border-wharf-border-primary px-3 py-2.5 flex flex-col transition-all hover:scale-105 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="font-mono text-sm font-black">{item.label}</span>
                        </div>
                        <span className="font-mono text-[10px] sm:text-xs text-wharf-black opacity-80 mt-0.5">
                          {item.sub}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Quote */}
                <div className="mt-6 border-l-4 border-yellow-500 px-4 py-2 bg-wharf-yellow/30">
                  <p className="font-mono text-sm text-justify text-wharf-text-secondary leading-relaxed italic">
                    "Passionate about building products that solve real problems. WHARF is the
                    culmination of countless iterations, lessons learned, and a deep belief that
                    great code deserves great documentation. Built to help developers spend less
                    time deciphering code and more time creating what matters."
                  </p>
                </div>
                <div className="mt-6 border-l-4 border-yellow-500 px-4 py-2 bg-wharf-yellow/30">
                  <p className="font-mono text-sm text-justify text-wharf-text-secondary leading-relaxed italic">
                    "WHARF was built to simplify the way developers understand, maintain, and
                    collaborate on code. Every feature is designed with clarity, productivity, and
                    developer experience in mind. The goal is simple: spend less time deciphering
                    code and more time building great software."
                  </p>
                </div>

                {/* Social Links & Contact */}
                <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t-2 border-wharf-border-secondary w-full">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                      group/social relative flex items-center justify-center
                      w-11 h-11 border-2 border-wharf-border-primary 
                      bg-wharf-surface-primary rounded-xl
                      transition-all duration-200
                      hover:-translate-y-0.5 hover:shadow-brutal-sm
                      ${social.color}
                    `}
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5 transition-colors group-hover/social:text-wharf-white" />
                      <span
                        className="
                      absolute top-12.5 px-1.5 py-0.5
                      bg-wharf-black text-wharf-white
                      font-mono text-[10px] font-bold
                      opacity-0 group-hover/social:opacity-100
                      transition-opacity duration-150
                      whitespace-nowrap
                      border border-wharf-border-primary
                      shadow-brutal-sm
                      pointer-events-none
                    "
                      >
                        {social.label}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Section 5 - Star & Support */}
      <section className="py-20 bg-wharf-surface-primary w-full">
        <div className="max-w-5xl mx-auto px-4">
          <Card
            variant="hard"
            rounded="3xl"
            className="max-w-4xl mx-auto p-8 md:p-12 text-center bg-gradient-to-br from-wharf-yellow/10 via-wharf-orange/10 to-wharf-pink/10 border-2 border-wharf-border-primary relative overflow-hidden"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-wharf-yellow/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-wharf-orange/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-wharf-pink/5 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-2xl mx-auto py-4">
              {/* Star Icon Animation */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="relative w-20 h-20 border-2 border-wharf-border-primary bg-gradient-to-br from-wharf-yellow to-wharf-orange flex items-center justify-center rounded-2xl shadow-brutal-sm">
                  <Star className="w-10 h-10 text-wharf-black fill-current" />
                </div>
              </div>

              <h2 className="font-display font-black text-3xl md:text-4xl tracking-tighter mb-4">
                Show Your Support For{' '}
                <span className="bg-yellow-500 bg-clip-text text-transparent">WHARF</span>
              </h2>

              <p className="font-mono text-base text-wharf-text-secondary mb-8 max-w-xl mx-auto capitalize">
                Help us build the future of documentation. Every star, contribution & share makes a
                difference...
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <a
                  href="https://github.com/FrostByte-49/Wharf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    rounded="2xl"
                    className="gap-2 group bg-gradient-to-r from-wharf-yellow to-wharf-orange text-wharf-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <Star className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                    Star on GitHub
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>

                <a
                  href="https://github.com/FrostByte-49/wharf/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="outline" size="lg" rounded="2xl" className="gap-2 group">
                    <GitBranch className="w-4 h-4" />
                    Contribute
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
};
