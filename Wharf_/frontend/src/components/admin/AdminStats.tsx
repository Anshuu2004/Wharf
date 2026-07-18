import { TrendingUp, Users, CheckCircle, Zap, Database, DollarSign } from 'lucide-react';
import { Card } from '../ui/Card';

interface AdminStatsProps {
  stats: {
    totalGenerations: number;
    activeUsers: number;
    successRate: number;
    avgResponseTime: number;
    cacheHitRate: number;
    estimatedCost: number;
  };
}

const statConfigs = [
  {
    key: 'totalGenerations',
    label: 'Total Generations',
    icon: TrendingUp,
    color: 'bg-wharf-pink',
    suffix: '',
  },
  { key: 'activeUsers', label: 'Active Users', icon: Users, color: 'bg-wharf-cyan', suffix: '' },
  {
    key: 'successRate',
    label: 'Success Rate',
    icon: CheckCircle,
    color: 'bg-wharf-green',
    suffix: '%',
  },
  {
    key: 'avgResponseTime',
    label: 'Avg Response Time',
    icon: Zap,
    color: 'bg-wharf-purple',
    suffix: 's',
  },
  {
    key: 'cacheHitRate',
    label: 'Cache Hit Rate',
    icon: Database,
    color: 'bg-wharf-yellow',
    suffix: '%',
  },
  {
    key: 'estimatedCost',
    label: 'Estimated Cost',
    icon: DollarSign,
    color: 'bg-wharf-orange',
    suffix: '',
  },
];

export const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {statConfigs.map((config) => {
        const value = stats[config.key as keyof typeof stats];
        const displayValue =
          config.key === 'estimatedCost'
            ? `$${value.toFixed(2)}`
            : config.key === 'avgResponseTime'
              ? `${value.toFixed(1)}`
              : value.toLocaleString();

        return (
          <Card key={config.key} variant="hard-sm" rounded="2xl" className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[10px] text-wharf-text-primary uppercase tracking-wider">
                {config.label}
              </span>
              <div
                className={`w-8 h-8 ${config.color} border border-wharf-border-primary flex items-center justify-center`}
              >
                <config.icon className="w-4 h-4 text-wharf-black" />
              </div>
            </div>
            <div className="font-display font-black text-2xl tracking-tighter mt-2">
              {displayValue}
              {config.suffix}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
