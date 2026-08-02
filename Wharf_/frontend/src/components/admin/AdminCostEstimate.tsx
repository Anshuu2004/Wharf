import { Badge, Card } from '../ui';
import { Calendar, AlertCircle, CreditCard, Zap } from 'lucide-react';

interface AdminCostEstimateProps {
  cost: number;
  trend?: number;
  period?: string;
}

export const AdminCostEstimate = ({ cost }: AdminCostEstimateProps) => {
  const monthlyEstimate = cost * 30;
  const weeklyEstimate = cost * 7;
  const yearlyEstimate = cost * 365;

  return (
    <Card variant="hard" rounded="3xl" className="overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div>
              <h3 className="font-display font-black text-xl tracking-tighter">Cost Estimation</h3>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-wharf-text-secondary capitalize">
                  API usage cost analysis
                </p>
              </div>
            </div>
          </div>
        </div>
        <Badge variant="cyan" size="sm" className="hidden md:flex gap-1">
          <Calendar className="w-3 h-3" />
          Updated Today
        </Badge>
      </div>

      {/* Main Cost Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Today's Cost */}
        <div className="p-4 bg-gradient-to-r from-wharf-surface-secondary to-wharf-green/5 border-2 border-wharf-border-secondary rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-wharf-green/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-wharf-green/30 border border-wharf-green-darker">
                <CreditCard className="w-3.5 h-3.5 text-wharf-green-darker" />
              </div>
              <span className="font-mono text-xs text-wharf-text-primary uppercase tracking-wider">
                Today's Estimate
              </span>
            </div>
            <div className="font-display font-black text-3xl tracking-tighter text-wharf-text-primary">
              ${cost.toFixed(2)}
            </div>
            <p className="font-mono text-[10px] text-wharf-text-secondary mt-0.5 capitalize">
              Based on current token usage
            </p>
          </div>
        </div>

        {/* Monthly Projection */}
        <div className="p-4 bg-gradient-to-r from-wharf-surface-secondary to-wharf-purple/5 border-2 border-wharf-border-secondary rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-wharf-purple/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-wharf-purple/30 border border-wharf-purple-darker">
                <Calendar className="w-3.5 h-3.5 text-wharf-purple-darker" />
              </div>
              <span className="font-mono text-xs text-wharf-text-primary uppercase tracking-wider">
                Monthly Projection
              </span>
            </div>
            <div className="font-display font-black text-3xl tracking-tighter text-wharf-text-primary">
              ${monthlyEstimate.toFixed(2)}
            </div>
            <p className="font-mono text-[10px] text-wharf-text-secondary mt-0.5 capitalize">
              30-day projection at current rate
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl text-center">
          <p className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wider">
            Weekly
          </p>
          <p className="font-display font-black text-lg text-wharf-text-primary">
            ${weeklyEstimate.toFixed(2)}
          </p>
        </div>
        <div className="p-3 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl text-center">
          <p className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wider">
            Monthly
          </p>
          <p className="font-display font-black text-lg text-wharf-text-primary">
            ${monthlyEstimate.toFixed(2)}
          </p>
        </div>
        <div className="p-3 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl text-center">
          <p className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wider">
            Yearly
          </p>
          <p className="font-display font-black text-lg text-wharf-text-primary">
            ${yearlyEstimate.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-2 border-t-2 border-wharf-border-secondary flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3 h-3 text-wharf-text-secondary" />
          <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
            Costs are estimated based on current usage patterns
          </span>
        </div>
        <Badge variant="pink" size="sm" className="hidden md:flex gap-1">
          <Zap className="w-3 h-3" />
          Live
        </Badge>
      </div>
    </Card>
  );
};
