import { Card } from '../ui/Card';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminFeatureChartProps {
  data: { name: string; value: number }[];
}

// Colors
const COLORS = [
  { main: '#FE90E8', light: 'rgba(254, 144, 232, 0.2)', hover: '#FF6FD8' },
  { main: '#C0F7FE', light: 'rgba(192, 247, 254, 0.2)', hover: '#8FF0FE' },
  { main: '#99E885', light: 'rgba(153, 232, 133, 0.2)', hover: '#72E05A' },
  { main: '#F7CB46', light: 'rgba(247, 203, 70, 0.2)', hover: '#F5BE1A' },
  { main: '#B8A9FF', light: 'rgba(184, 169, 255, 0.2)', hover: '#9A85FF' },
  { main: '#FFDC8B', light: 'rgba(255, 220, 139, 0.2)', hover: '#FFCF68' },
];

// Custom Tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { name: string; value: number };
  }>;
  totalGenerations?: number;
}

const CustomTooltip = ({ active, payload, totalGenerations }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = totalGenerations || 0;
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';

    return (
      <div className="bg-wharf-surface-primary border-2 border-wharf-border-primary p-3 rounded-xl shadow-brutal-sm min-w-[180px]">
        <p className="font-mono text-xs font-bold text-wharf-text-primary mb-1">{data.name}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-xs text-wharf-text-secondary">Generations:</span>
          <span className="font-mono text-sm font-bold text-wharf-text-primary">
            {data.value.toLocaleString()}
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

export const AdminFeatureChart = ({ data }: AdminFeatureChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const topFeature = data.length > 0 ? data.reduce((a, b) => (a.value > b.value ? a : b)) : null;

  // Format Large Numbers
  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  // Calculate Percentage
  const getPercentage = (value: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  };

  return (
    <Card variant="hard" rounded="3xl" className="overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-black text-xl tracking-tighter">Feature Usage</h3>
          </div>
          <p className="font-mono text-sm text-wharf-text-secondary mt-0.5 capitalize">
            Breakdown of feature usage across all users
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
          >
            <XAxis
              type="number"
              stroke="#000000"
              fontSize={10}
              fontFamily="monospace"
              axisLine={{ stroke: '#000000', strokeWidth: 2 }}
              tickLine={false}
              tickFormatter={(value) => formatValue(value)}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#000000"
              fontSize={10}
              fontFamily="monospace"
              width={80}
              axisLine={{ stroke: '#000000', strokeWidth: 2 }}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip totalGenerations={total} />} cursor={false} />

            <Bar
              dataKey="value"
              fill="#FE90E8"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={1}
              radius={[0, 4, 4, 0]}
              barSize={28}
              activeBar={false}
            >
              {data.map((entry, index) => {
                const color = COLORS[index % COLORS.length];
                const isTop = entry.value === topFeature?.value;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isTop ? color.hover : color.main}
                    stroke="rgba(0,0,0,0.2)"
                    strokeWidth={1}
                    className="transition-all duration-300 cursor-pointer"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Total Usage Badge */}
        <div className="absolute top-0 right-0 flex items-center gap-1.5 px-2.5 py-1 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-lg">
          <span className="font-mono text-[10px] text-wharf-text-secondary">Total:</span>
          <span className="font-mono text-xs font-bold text-wharf-text-primary">
            {formatValue(total)}
          </span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-4 pt-3 border-t-2 border-wharf-border-secondary">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2 bg-wharf-surface-secondary border border-wharf-border-secondary rounded-lg text-center">
            <p className="font-mono text-[10px] text-wharf-text-secondary">Total Features</p>
            <p className="font-display font-black text-lg text-wharf-text-primary">{data.length}</p>
          </div>
          <div className="p-2 bg-wharf-surface-secondary border border-wharf-border-secondary rounded-lg text-center">
            <p className="font-mono text-[10px] text-wharf-text-secondary">Top Feature</p>
            <p className="font-display font-black text-lg text-wharf-green-darker">
              {topFeature?.name || 'N/A'}
            </p>
          </div>
          <div className="p-2 bg-wharf-surface-secondary border border-wharf-border-secondary rounded-lg text-center">
            <p className="font-mono text-[10px] text-wharf-text-secondary">Max Usage</p>
            <p className="font-display font-black text-lg text-wharf-cyan-darker">
              {formatValue(topFeature?.value || 0)}
            </p>
          </div>
          <div className="p-2 bg-wharf-surface-secondary border border-wharf-border-secondary rounded-lg text-center">
            <p className="font-mono text-[10px] text-wharf-text-secondary">Avg Usage</p>
            <p className="font-display font-black text-lg text-wharf-text-primary">
              {data.length > 0 ? formatValue(Math.round(total / data.length)) : '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2 border-t-2 border-wharf-border-secondary flex flex-wrap items-center justify-between gap-2">
        {data.slice(0, 5).map((item, index) => {
          const color = COLORS[index % COLORS.length];
          const percentage = getPercentage(item.value);
          return (
            <div key={item.name} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.hover }} />
              <span className="font-mono text-[10px] text-wharf-text-secondary">{item.name}</span>
              <span className="font-mono text-[10px] text-wharf-cyan-darker font-bold">
                ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
