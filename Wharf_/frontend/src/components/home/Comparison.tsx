import { Check, X, Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const comparisons = [
  { feature: 'GitHub URL → README', wharf: true, others: true },
  { feature: 'GitHub-styled Preview', wharf: true, others: false },
  { feature: 'Smart Install Commands', wharf: true, others: false },
  { feature: 'Tree Map Generator', wharf: true, others: false },
  { feature: 'README Health Score', wharf: true, others: false },
  { feature: 'Tone Variants (3)', wharf: true, others: false },
  { feature: 'CHANGELOG Generator', wharf: true, others: false },
  { feature: 'Repo Passport Page', wharf: true, others: false },
  { feature: 'Stale Doc Alerts', wharf: true, others: false },
];

export const Comparison = () => {
  return (
    <section className="py-20 bg-wharf-surface-secondary border-y-4 border-wharf-border-primary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="purple" className="mb-4 gap-2">
            <Zap className="w-3 h-3" />
            Why Choose WHARF
          </Badge>
          <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-4">
            Better Than{' '}
            <span className="bg-gradient-to-r from-wharf-purple-dark to-wharf-purple-darker bg-clip-text text-transparent">
              Alternatives
            </span>
          </h2>
          <p className="font-mono text-base text-wharf-text-secondary max-w-2xl mx-auto capitalize">
            See how WHARF compares to other documentation tools
          </p>
        </div>

        {/* Comparison Table */}
        <Card variant="hard" className="max-w-4xl mx-auto overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-wharf-border-primary bg-wharf-surface-tertiary">
                  <th className="text-left p-4 font-mono font-bold text-sm">Feature</th>
                  <th className="text-center p-4 font-mono font-bold text-sm bg-wharf-pink">
                    WHARF
                  </th>
                  <th className="text-center p-4 font-mono font-bold text-sm">Others</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((item, index) => (
                  <tr
                    key={item.feature}
                    className={`border-b border-wharf-border-secondary ${
                      index % 2 === 0 ? 'bg-wharf-surface-primary' : 'bg-wharf-surface-secondary'
                    }`}
                  >
                    <td className="p-4 font-mono text-sm">{item.feature}</td>
                    <td className="text-center p-4">
                      {item.wharf ? (
                        <Check className="w-5 h-5 text-wharf-green-darker mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-wharf-orange-darker mx-auto" />
                      )}
                    </td>
                    <td className="text-center p-4">
                      {item.others ? (
                        <Check className="w-5 h-5 text-wharf-green-darker mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-wharf-orange-darker mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Note */}
        <p className="text-center font-mono text-xs text-wharf-text-tertiary mt-6">
          * Based On Comparison With readme-ai, GitDocify & Other README Generators
        </p>
      </div>
    </section>
  );
};
