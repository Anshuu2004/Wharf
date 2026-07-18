import { Card } from '../ui/Card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap } from 'lucide-react';

interface AdminTokenUsageProps {
  data: { provider: string; tokens: number; color: string }[];
}

// Colors
const COLORS = [
  { main: '#E06EC8', light: 'rgba(254, 144, 232, 0.2)', label: '#C04AA8' },
  { main: '#8EDDE8', light: 'rgba(192, 247, 254, 0.2)', label: '#5AB3C4' },
  { main: '#6EC858', light: 'rgba(153, 232, 133, 0.2)', label: '#4A9E38' },
  { main: '#F7CB46', light: 'rgba(247, 203, 70, 0.2)', label: '#F7CB46' },
  { main: '#8B72E0', light: 'rgba(184, 169, 255, 0.2)', label: '#6B4FC4' },
  { main: '#FFDC8B', light: 'rgba(255, 220, 139, 0.2)', label: '#FFDC8B' },
];

// Format Tokens
const formatTokens = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
};

const formatTokensFull = (n: number) => {
  return n.toLocaleString();
};

// Custom Tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { provider: string; tokens: number };
  }>;
  totalTokens?: number;
}

const CustomTooltip = ({ active, payload, totalTokens }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = totalTokens || 0;
    const percentage = total > 0 ? ((data.tokens / total) * 100).toFixed(1) : '0';

    return (
      <div className="bg-wharf-surface-primary border-2 border-wharf-border-primary p-3 rounded-xl shadow-brutal-sm min-w-[180px]">
        <p className="font-mono text-xs font-bold text-wharf-text-primary mb-1">{data.provider}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-xs text-wharf-text-secondary">Tokens:</span>
          <span className="font-mono text-sm font-bold text-wharf-text-primary">
            {formatTokensFull(data.tokens)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-xs text-wharf-text-secondary">Percentage:</span>
          <span className="font-mono text-sm font-bold text-wharf-cyan-darker">{percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Label
interface PieLabelRenderProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  name?: string;
  value?: number;
  index?: number;
}

const renderCustomLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

  if (
    typeof cx === 'undefined' ||
    typeof cy === 'undefined' ||
    typeof midAngle === 'undefined' ||
    typeof innerRadius === 'undefined' ||
    typeof outerRadius === 'undefined' ||
    typeof percent === 'undefined'
  ) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
  const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      className="font-mono text-xs font-bold text-wharf-text-primary"
      textAnchor="middle"
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const AdminTokenUsage = ({ data }: AdminTokenUsageProps) => {
  const total = data.reduce((sum, item) => sum + item.tokens, 0);
  const topProvider = data.length > 0 ? data.reduce((a, b) => (a.tokens > b.tokens ? a : b)) : null;

  // Prepare Data For Pie Chart
  const pieData = data
    .filter((d) => d.tokens > 0)
    .map((d) => ({
      name: d.provider,
      value: d.tokens,
      provider: d.provider,
      tokens: d.tokens,
    }));

  return (
    <Card variant="hard" rounded="3xl" className="overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-black text-xl tracking-tighter">Token Usage</h3>
          </div>
          <p className="font-mono text-sm text-wharf-text-secondary mt-0.5 capitalize">
            Token consumption by AI provider across all generations
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Chart */}
        <div className="flex-1 min-w-[200px]">
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={160}
                paddingAngle={2}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={false}
                strokeWidth={0}
              >
                {pieData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length].main}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth={2}
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip totalTokens={total} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Summary */}
        <div className="lg:w-48 space-y-3">
          <div className="p-3 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl">
            <p className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wider">
              Total Tokens
            </p>
            <p className="font-display font-black text-2xl text-wharf-text-primary">
              {formatTokens(total)}
            </p>
          </div>

          <div className="space-y-1.5">
            {data.slice(0, 3).map((item, index) => {
              const color = COLORS[index % COLORS.length];
              const percentage = total > 0 ? ((item.tokens / total) * 100).toFixed(1) : '0';
              return (
                <div
                  key={item.provider}
                  className="flex items-center justify-between p-2 bg-wharf-surface-secondary border border-wharf-border-secondary rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color.label }}
                    />
                    <span className="font-mono text-xs text-wharf-text-secondary">
                      {item.provider}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-wharf-text-primary">
                      {formatTokens(item.tokens)}
                    </span>
                    <span className="font-mono text-[10px] text-wharf-text-tertiary">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
            {data.length > 3 && (
              <div className="text-center font-mono text-[10px] text-wharf-text-secondary capitalize">
                +{data.length - 3} more providers
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-3 border-t-2 border-wharf-border-secondary flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
              {data.filter((d) => d.tokens > 0).length} providers active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-wharf-green-darker" />
          <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
            {topProvider ? `${topProvider.provider} consumes most tokens` : 'No data'}
          </span>
        </div>
      </div>
    </Card>
  );
};
