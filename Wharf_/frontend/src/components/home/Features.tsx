import { FileText, User, MessageSquare, Activity, Settings, Zap, Key } from 'lucide-react';
import { Badge, Card } from '../ui';

const features = [
  {
    icon: FileText,
    title: 'README Generator',
    description:
      'Generate professional README.md with auto-detected tech stack & install commands',
    gradient: 'from-wharf-pink to-wharf-pink-dark',
    iconGradient: 'text-wharf-pink',
  },
  {
    icon: User,
    title: 'Profile README',
    description: 'Create stunning, recruiter-ready GitHub profile pages tailored to your tech stack',
    gradient: 'from-wharf-cyan to-wharf-cyan-darker',
    iconGradient: 'text-wharf-cyan',
  },
  {
    icon: MessageSquare,
    title: 'AI Chat Assistant',
    description: 'Ask questions about any repository codebase & get contextual answers instantly',
    gradient: 'from-wharf-green to-wharf-green-dark',
    iconGradient: 'text-wharf-green',
  },
  {
    icon: Activity,
    title: 'Repository Health',
    description: 'Get instant 0-100 scores with actionable suggestions to improve your repo quality',
    gradient: 'from-wharf-yellow to-wharf-yellow-dark',
    iconGradient: 'text-wharf-yellow',
  },
  {
    icon: Settings,
    title: 'CHANGELOG Generator',
    description:
      'Turn your git commit history into structured, release-ready changelogs automatically',
    gradient: 'from-wharf-purple to-wharf-purple-dark',
    iconGradient: 'text-wharf-purple',
  },
  {
    icon: Key,
    title: 'Bring Your Own Key',
    description: 'Add your own AI API keys to generate unlimited documentation securely',
    gradient: 'from-wharf-orange to-wharf-orange-dark',
    iconGradient: 'text-wharf-orange',
  },
];

export const Features = () => {
  return (
    <section className="py-20 bg-wharf-surface-primary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="green" className="mb-4 gap-2">
            <Zap className="w-3 h-3" />
            Powerful Features
          </Badge>
          <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-4">
            Everything You{' '}
            <span className="bg-wharf-green-darker bg-clip-text text-transparent">
              Need
            </span>
          </h2>
          <p className="font-mono text-base text-wharf-text-secondary max-w-2xl mx-auto capitalize">
            Professional documentation tools that save hours of manual work
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <Card
              key={feature.title}
              variant="hard-sm"
              rounded="3xl"
              className="group transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 border-2 border-wharf-border-primary bg-gradient-to-br ${feature.gradient} bg-wharf-surface-secondary flex items-center justify-center flex-shrink-0 group-hover:shadow-brutal-sm transition-all`}
                >
                  <feature.icon
                    className={`w-6 h-6 text-white transition-colors ${feature.iconGradient}`}
                  />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg mb-2 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="font-mono text-sm text-wharf-text-secondary capitalize">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Badge className="gap-1">... And so much more ...</Badge>
        </div>
      </div>
    </section>
  );
};
