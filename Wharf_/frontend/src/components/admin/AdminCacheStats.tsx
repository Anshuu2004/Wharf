import { Badge, Card } from '../ui';
import { Database, Clock, Zap, TrendingUp, TrendingDown, Activity, Shield } from 'lucide-react';

interface AdminCacheStatsProps {
  stats: { hitRate: number; missRate: number; size: number };
}

export const AdminCacheStats = ({ stats }: AdminCacheStatsProps) => {
  const getHitRateColor = (rate: number) => {
    if (rate >= 80) return 'text-wharf-green-darker';
    if (rate >= 60) return 'text-yellow-500';
    return 'text-wharf-orange-dark';
  };

  const getHitRateBarColor = (rate: number) => {
    if (rate >= 80) return 'bg-wharf-green-darker';
    if (rate >= 60) return 'bg-yellow-500';
    return 'bg-wharf-orange-dark';
  };

  const hitRate = stats?.hitRate ?? 0;
  const missRate = stats?.missRate ?? 0;
  const size = stats?.size ?? 0;
  const hitColor = getHitRateColor(hitRate);
  const barColor = getHitRateBarColor(hitRate);
  const efficiency = Math.round((hitRate / 100) * 100);

  return (
    <Card variant="hard" rounded="3xl" className="overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div>
              <h3 className="font-display font-black text-xl tracking-tighter">
                Cache Performance
              </h3>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-wharf-text-secondary capitalize">
                  Redis cache efficiency
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Badge variant="cyan" size="sm" className="gap-1">
            <Shield className="w-3 h-3" />
            {size.toLocaleString()} cached items
          </Badge>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        {/* Hit Rate */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-3.5 h-3.5 ${hitColor}`} />
              <span className="font-mono text-xs font-bold text-wharf-text-secondary">
                Hit Rate
              </span>
            </div>
            <span className={`font-mono text-sm font-bold ${hitColor}`}>{stats.hitRate}%</span>
          </div>
          <div className="h-2.5 rounded-full border border-wharf-border-secondary bg-wharf-surface-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
              style={{ width: `${hitRate}%` }}
            />
          </div>
        </div>

        {/* Miss Rate */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-3.5 h-3.5 text-wharf-error" />
              <span className="font-mono text-xs font-bold text-wharf-text-secondary">
                Miss Rate
              </span>
            </div>
            <span className="font-mono text-sm font-bold text-wharf-error">{stats.missRate}%</span>
          </div>
          <div className="h-2.5 rounded-full border border-wharf-border-secondary bg-wharf-surface-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-wharf-error transition-all duration-1000 ease-out"
              style={{ width: `${missRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cache Details */}
      <div className="mt-8 pt-3 border-t-2 border-wharf-border-secondary">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {/* Entries */}
          <div className="flex items-center gap-3 p-3 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl">
            <div className="p-2 rounded-lg bg-wharf-cyan/20 border border-wharf-cyan-darker">
              <Database className="w-4 h-4 text-wharf-cyan-darker" />
            </div>
            <div>
              <p className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wider">
                Entries
              </p>
              <p className="font-mono text-sm font-bold text-wharf-text-primary">
                {size.toLocaleString()}
              </p>
            </div>
          </div>

          {/* TTL */}
          <div className="flex items-center gap-3 p-3 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl">
            <div className="p-2 rounded-lg bg-wharf-green/20 border border-wharf-green-darker">
              <Clock className="w-4 h-4 text-wharf-green-darker" />
            </div>
            <div>
              <p className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wider">
                TTL
              </p>
              <p className="font-mono text-sm font-bold text-wharf-text-primary">24 hours</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 p-3 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl">
            <div className="p-2 rounded-lg bg-wharf-purple/20 border border-wharf-purple-darker">
              <Activity className="w-4 h-4 text-wharf-purple-darker" />
            </div>
            <div>
              <p className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wider">
                Status
              </p>
              <p className="font-mono text-sm font-bold text-wharf-green-darker">Active</p>
            </div>
          </div>

          {/* Efficiency */}
          <div className="flex items-center gap-3 p-3 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl">
            <div className="p-2 rounded-lg bg-wharf-yellow/20 border border-yellow-500">
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <p className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wider">
                Efficiency
              </p>
              <p className={`font-mono text-sm font-bold ${hitColor}`}>{efficiency}%</p>
            </div>
          </div>

          {/* Hit Rate */}
          <div className="flex items-center gap-3 p-3 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl">
            <div className="p-2 rounded-lg bg-wharf-green/20 border border-wharf-green-darker">
              <TrendingUp className="w-4 h-4 text-wharf-green-darker" />
            </div>
            <div>
              <p className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wider">
                Hit Rate
              </p>
              <p className={`font-mono text-sm font-bold ${hitColor}`}>{hitRate}%</p>
            </div>
          </div>

          {/* Miss Rate */}
          <div className="flex items-center gap-3 p-3 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl">
            <div className="p-2 rounded-lg bg-wharf-error/10 border border-wharf-error">
              <TrendingDown className="w-4 h-4 text-wharf-error" />
            </div>
            <div>
              <p className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wider">
                Miss Rate
              </p>
              <p className="font-mono text-sm font-bold text-wharf-error">{missRate}%</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
