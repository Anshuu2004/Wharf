import { FileText, GitBranch, Activity, BarChart3, Settings, Zap, Shield } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const features = [
  {
    icon: FileText,
    title: 'README Generator',
    description:
      'Generate professional README.md with auto-detected tech stack and install commands',
    gradient: 'from-wharf-pink to-wharf-pink-dark',
    iconGradient: 'text-wharf-pink',
  },
  {
    icon: GitBranch,
    title: 'Tree Map',
    description: 'Visualize your repository structure with beautiful ASCII folder trees',
    gradient: 'from-wharf-cyan to-wharf-cyan-darker',
    iconGradient: 'text-wharf-cyan',
  },
  {
    icon: Activity,
    title: 'Health Score',
    description: 'Get instant 0-100 score with actionable suggestions for improvement',
    gradient: 'from-wharf-green to-wharf-green-dark',
    iconGradient: 'text-wharf-green',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track documentation quality & contribution readiness over time',
    gradient: 'from-wharf-yellow to-wharf-yellow-dark',
    iconGradient: 'text-wharf-yellow',
  },
  {
    icon: Settings,
    title: 'CHANGELOG Generator',
    description: 'Auto-generate changelogs from commit history',
    gradient: 'from-wharf-purple to-wharf-purple-dark',
    iconGradient: 'text-wharf-purple',
  },
  {
    icon: Shield,
    title: 'Contribution Score',
    description: 'Rate how welcoming your repo is to open-source contributors',
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
            <span className="bg-gradient-to-r from-wharf-green-dark to-wharf-green-darker bg-clip-text text-transparent">
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
              hoverable
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
