import { Card } from '../ui/Card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap } from 'lucide-react';

interface AdminProviderChartProps {
  data: { name: string; value: number }[];
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

// Custom Tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { name: string; value: number };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = payload.reduce((sum, p) => sum + p.value, 0);
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0.0';

    return (
      <div className="bg-wharf-surface-primary border-2 border-wharf-border-primary p-3 rounded-xl shadow-brutal-sm min-w-[140px]">
        <p className="font-mono text-xs font-bold text-wharf-text-primary mb-1">{data.name}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-xs text-wharf-text-secondary">Requests:</span>
          <span className="font-mono text-sm font-bold text-wharf-text-primary">{data.value}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-xs text-wharf-text-secondary">Share:</span>
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

  // Handle Case Where Props Might Be Undefined
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

export const AdminProviderChart = ({ data }: AdminProviderChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const topProvider = data.length > 0 ? data.reduce((a, b) => (a.value > b.value ? a : b)) : null;
  // Ensure we always have valid data
  const chartData = data.length > 0 ? data : [{ name: 'No Data', value: 1 }];
  const chartTotal = Math.max(total, 1);

  return (
    <Card variant="hard" rounded="3xl" className="overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-black text-xl tracking-tighter">AI Provider Usage</h3>
          </div>
          <p className="font-mono text-sm text-wharf-text-secondary mt-0.5 capitalize">
            Breakdown of AI provider usage across all generations
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center w-full gap-6">
        {/* Chart */}
        <div className="flex-1 w-full min-w-[200px] overflow-hidden">
          <ResponsiveContainer width="100%" height={390}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={150}
                paddingAngle={2}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={false}
                strokeWidth={0}
              >
                {chartData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length].main}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth={2}
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Summary */}
        <div className="w-full lg:w-48 space-y-3">
          <div className="p-3 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl">
            <p className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wider">
              Total Usage
            </p>
            <p className="font-display font-black text-xl text-wharf-text-primary">{total} Reqs</p>
          </div>

          <div className="space-y-1.5">
            {data.slice(0, 3).map((item, index) => {
              const color = COLORS[index % COLORS.length];
              const percentage = chartTotal > 0 ? ((item.value / chartTotal) * 100).toFixed(1) : '0.0';
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2 bg-wharf-surface-secondary border border-wharf-border-secondary rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color.label }}
                    />
                    <span className="font-mono text-xs text-wharf-text-secondary">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-wharf-text-primary">
                      {percentage}%
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
              {data.length} providers active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-wharf-green-darker" />
          <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
            {topProvider ? `${topProvider.name} is most used` : 'No data'}
          </span>
        </div>
      </div>
    </Card>
  );
};
