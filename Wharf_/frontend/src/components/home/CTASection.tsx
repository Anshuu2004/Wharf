import { ArrowRight, Zap, Rocket, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-wharf-pink/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <Card
          variant="hard"
          rounded="3xl"
          className="max-w-4xl mx-auto text-center bg-gradient-to-br from-wharf-surface-secondary to-wharf-surface-primary p-8 md:p-12 hover:shadow-brutal-xl transition-all"
        >
          {/* Badge */}
          <div className="my-6">
            <Badge className="gap-2 animate-pulse">
              <Zap className="w-3 h-3" />
              Get Started Free
            </Badge>
          </div>

          {/* Title */}
          <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl tracking-tighter mb-6">
            Ready to Transform Your
            <br />
            <span className="bg-gradient-to-r from-wharf-pink-dark to-wharf-pink-darker bg-clip-text text-transparent">
              Documentation?
            </span>
          </h2>

          {/* Description */}
          <p className="font-mono text-base text-wharf-text-secondary max-w-2xl mx-auto mb-8 capitalize">
            Join thousands of developers who use WHARF to create beautiful, professional
            documentation for their GitHub repositories...
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-8">
            <Button variant="primary" size="lg" rounded="2xl" className="gap-2 group">
              <Rocket className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
              Start Generating Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" rounded="2xl" className="group">
              View Documentation
              <ArrowRight className="w-4 h-4 ml-2 opacity-100 group-hover:translate-x-1 transition-all" />
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-16 py-4 border-t-2 border-wharf-border-primary">
            {['No credit card required', 'Free for open source', 'GitHub integration'].map(
              (text) => (
                <div key={text} className="flex items-center gap-2 group cursor-default">
                  <CheckCircle className="w-4 h-4 text-wharf-green-darker group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-xs text-wharf-text-tertiary group-hover:text-wharf-text-primary transition-colors capitalize">
                    {text}
                  </span>
                </div>
              )
            )}
          </div>
        </Card>
      </div>
    </section>
  );
};
