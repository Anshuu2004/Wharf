import { Card } from '../ui/Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminUsageChartProps {
  data: { date: string; generations: number; users: number }[];
  period: 'week' | 'month';
  onPeriodChange: (period: 'week' | 'month') => void;
  isRefetching?: boolean;
}

// Colors
const COLORS = {
  generations: {
    stroke: '#C04AA8',
    fill: 'rgba(254, 144, 232, 0.15)',
    gradientStart: 'rgba(254, 144, 232, 0.4)',
    gradientEnd: 'rgba(254, 144, 232, 0.0)',
  },
  users: {
    stroke: '#5AB3C4',
    fill: 'rgba(192, 247, 254, 0.15)',
    gradientStart: 'rgba(192, 247, 254, 0.4)',
    gradientEnd: 'rgba(192, 247, 254, 0.0)',
  },
  axis: '#666666',
  grid: 'rgba(255, 255, 255, 0.05)',
  tooltip: {
    bg: '#1a1a1a',
    border: '#333333',
    text: '#ffffff',
  },
};

// Type For Tooltip Payload
interface TooltipPayload {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

// Type For Tooltip Props
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-wharf-surface-primary border-2 border-wharf-border-primary p-3 rounded-xl shadow-brutal-sm">
        <p className="font-mono text-xs font-bold text-wharf-text-secondary mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs font-mono">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-wharf-text-tertiary">{entry.name}:</span>
            <span className="text-wharf-text-primary font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AdminUsageChart = ({
  data,
  period,
  onPeriodChange,
  isRefetching = false,
}: AdminUsageChartProps) => {
  // Calculate Totals
  const totalGenerations = data.reduce((sum, d) => sum + d.generations, 0);
  const peakUsers = data.reduce((max, d) => Math.max(max, d.users), 0); // Peak Daily Unique Users
  const avgGenerations = Math.round(
    totalGenerations / Math.max(data.filter((d) => d.generations > 0).length, 1)
  );
  const avgUsers = Math.round(
    data.reduce((sum, d) => sum + d.users, 0) / Math.max(data.filter((d) => d.users > 0).length, 1)
  );

  return (
    <Card variant="hard" rounded="3xl" className="overflow-hidden p-6 relative">
      {/* Refetching Overlay */}
      {isRefetching && (
        <div className="absolute inset-0 bg-wharf-black/40 backdrop-blur-sm z-50 flex items-center justify-center transition-all">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-wharf-pink border-t-transparent rounded-full animate-spin mb-3 shadow-[0_0_15px_rgba(254,144,232,0.3)]" />
            <p className="font-mono text-xs font-bold text-wharf-pink-darker bg-wharf-pink/10 px-3 py-1 rounded-full border border-wharf-pink/20">
              Updating Graph...
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-black text-xl tracking-tighter">Usage Trends</h3>
          </div>
          <p className="font-mono text-sm text-wharf-text-secondary mt-0.5 capitalize">
            Generations & active users over time
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Toggle */}
          <div className="flex gap-1 p-1 border-2 border-wharf-border-secondary rounded-xl">
            {['week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p as 'week' | 'month')}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all duration-200 cursor-pointer ${
                  period === p
                    ? 'bg-wharf-pink text-wharf-black border-2 border-wharf-border-primary shadow-brutal-sm'
                    : 'text-wharf-text-tertiary hover:text-wharf-text-primary hover:bg-wharf-surface-secondary'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl">
          <p className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wider">
            Total Generations
          </p>
          <p className="font-display font-black text-xl text-wharf-pink-darker">
            {totalGenerations}
          </p>
        </div>
        <div className="p-3 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl">
          <p className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wider">
            Peak Daily Users
          </p>
          <p className="font-display font-black text-xl text-wharf-cyan-darker">{peakUsers}</p>
        </div>
        <div className="p-3 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl">
          <p className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wider">
            Avg Generations
          </p>
          <p className="font-display font-black text-xl text-wharf-text-primary">
            {avgGenerations}
          </p>
        </div>
        <div className="p-3 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl">
          <p className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wider">
            Avg Users
          </p>
          <p className="font-display font-black text-xl text-wharf-text-primary">{avgUsers}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="generationsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.generations.stroke} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.generations.stroke} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.users.stroke} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.users.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              stroke={COLORS.axis}
              fontSize={10}
              fontFamily="monospace"
              axisLine={{ stroke: '#000000', strokeWidth: 2 }}
              tickLine={false}
              dy={10}
            />
            <YAxis
              stroke={COLORS.axis}
              fontSize={10}
              fontFamily="monospace"
              axisLine={{ stroke: '#000000', strokeWidth: 2 }}
              tickLine={false}
              dx={-10}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="generations"
              stroke={COLORS.generations.stroke}
              strokeWidth={3}
              fill="url(#generationsGradient)"
              name="Generations"
              dot={{
                fill: COLORS.generations.stroke,
                stroke: COLORS.generations.stroke,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                fill: COLORS.generations.stroke,
                stroke: '#ffffff',
                strokeWidth: 2,
                r: 6,
              }}
            />

            <Area
              type="monotone"
              dataKey="users"
              stroke={COLORS.users.stroke}
              strokeWidth={3}
              fill="url(#usersGradient)"
              name="Active Users"
              dot={{
                fill: COLORS.users.stroke,
                stroke: COLORS.users.stroke,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                fill: COLORS.users.stroke,
                stroke: '#ffffff',
                strokeWidth: 2,
                r: 6,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-7 pt-3 border-t-2 border-wharf-border-secondary flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS.generations.stroke }}
            />
            <span className="font-mono text-[10px] text-wharf-text-secondary">Generations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS.users.stroke }}
            />
            <span className="font-mono text-[10px] text-wharf-text-secondary">Active Users</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
            {period === 'week' ? '7 days' : '30 days'} of data
          </span>
        </div>
      </div>
    </Card>
  );
};
