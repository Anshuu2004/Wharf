import { FileText, GitBranch, Download, Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const steps = [
  {
    id: 1,
    icon: FileText,
    title: 'Paste URL',
    description: 'Enter any public GitHub repository URL',
    color: 'bg-wharf-pink',
    step: '01',
  },
  {
    id: 2,
    icon: GitBranch,
    title: 'AI Analysis',
    description: 'Our AI analyzes your code structure & stack',
    color: 'bg-wharf-cyan',
    step: '02',
  },
  {
    id: 3,
    icon: Download,
    title: 'Get Documentation',
    description: 'Download professional README, CHANGELOG & more',
    color: 'bg-wharf-green',
    step: '03',
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-wharf-surface-secondary border-y-4 border-wharf-border-primary">
      <div className="container mx-auto px-4">
        {/* Header */}
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
            Three simple steps to transform your repository into beautiful documentation
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-12 w-12 h-0.75 bg-wharf-border-primary" />
              )}

              <Card
                variant="hard"
                className="text-center h-full hover:translate-y-[-4px] transition-all"
              >
                <div className="flex flex-col items-center">
                  {/* Step Number */}
                  <div
                    className={`w-12 h-12 ${step.color} border-2 border-wharf-border-primary flex items-center justify-center mb-4 shadow-brutal-sm`}
                  >
                    <span className="font-mono font-black text-sm text-wharf-black">
                      {step.step}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 border-2 border-wharf-border-primary bg-wharf-surface-primary flex items-center justify-center mb-4 shadow-brutal-sm">
                    <step.icon className="w-8 h-8 text-wharf-text-primary" />
                  </div>

                  {/* Text */}
                  <h3 className="font-display font-black text-xl mb-2">{step.title}</h3>
                  <p className="font-mono text-sm text-wharf-text-secondary capitalize">
                    {step.description}
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
