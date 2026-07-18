import { Card } from '../ui/Card';
import { TrendingUp } from 'lucide-react';

interface AdminHeatmapProps {
  data: { date: string; count: number }[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

// GitHub-Style Green Colors
const getGitHubColor = (count: number, maxCount: number) => {
  if (count === 0) return 'bg-wharf-surface-secondary border-wharf-border-secondary/30';

  const intensity = count / maxCount;
  if (intensity < 0.25) return 'bg-green-800/40 border-green-800/50 hover:bg-green-800/60';
  if (intensity < 0.5) return 'bg-green-600/50 border-green-600/60 hover:bg-green-600/70';
  if (intensity < 0.75) return 'bg-green-500/70 border-green-500/80 hover:bg-green-500/90';
  return 'bg-green-400 border-green-400/90 hover:bg-green-300';
};

export const AdminHeatmap = ({ data }: AdminHeatmapProps) => {
  // Build Lookup Map: "YYYY-MM-DD" -> Count
  const countMap = new Map<string, number>();
  data.forEach((d) => countMap.set(d.date, d.count));

  // Build An Array Of 52 Weeks Worth Of Days (364 Days Back From Today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start From The Nearest Sunday ~52 Weeks Ago
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364 - startDate.getDay());

  const weeks: Date[][] = [];
  const cursor = new Date(startDate);

  while (cursor <= today) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const formatDate = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

  // Calculate Which Weeks Have Month Label Changes
  const monthLabels: { index: number; label: string }[] = [];
  weeks.forEach((week, i) => {
    const firstDay = week[0];
    if (i === 0 || firstDay.getDate() <= 7) {
      monthLabels.push({ index: i, label: MONTHS[firstDay.getMonth()] });
    }
  });

  const totalContributions = data.reduce((sum, d) => sum + d.count, 0);
  const totalDays = data.filter((d) => d.count > 0).length;
  const avgPerDay = totalDays > 0 ? Math.round(totalContributions / totalDays) : 0;

  return (
    <Card variant="hard" rounded="3xl" className="overflow-hidden p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-black text-lg sm:text-xl tracking-tighter">
              Generation Activity
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
            <p className="font-mono text-xs sm:text-sm text-wharf-text-secondary">
              <span className="font-bold text-wharf-text-primary">
                {totalContributions.toLocaleString()}
              </span>{' '}
              Generations
            </p>
            <div className="hidden sm:block w-px h-4 bg-wharf-border-secondary" />
            <p className="font-mono text-xs sm:text-sm text-wharf-text-secondary">
              <span className="font-bold text-wharf-text-primary">{totalDays}</span> Active Days
            </p>
            <div className="hidden sm:block w-px h-4 bg-wharf-border-secondary" />
            <p className="font-mono text-xs sm:text-sm text-wharf-text-secondary">
              <span className="font-bold text-wharf-text-primary">{avgPerDay}</span> Avg/Day
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-mono text-[8px] sm:text-[10px] text-wharf-text-secondary">
            Less
          </span>
          {[0, 0.25, 0.5, 0.75, 1].map((v, i) => {
            const count = Math.round(v * maxCount);
            return (
              <div
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm border transition-all ${getGitHubColor(count, maxCount)}`}
              />
            );
          })}
          <span className="font-mono text-[8px] sm:text-[10px] text-wharf-text-secondary">
            More
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="w-full">
        <div className="w-full">
          {/* Month labels */}
          <div className="flex mb-1 ml-6 sm:ml-8 gap-0.5 sm:gap-1">
            {weeks.map((_, i) => {
              const label = monthLabels.find((m) => m.index === i);
              return (
                <div key={i} className="flex-1 text-center">
                  {label ? (
                    <span className="font-mono text-[8px] sm:text-[10px] text-wharf-text-secondary">
                      {label.label}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex gap-1 sm:gap-2 w-full">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 sm:gap-1 w-5 sm:w-8 shrink-0">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="flex-1 flex items-center justify-end pr-1">
                  <span className="font-mono text-[8px] sm:text-[10px] text-wharf-text-secondary leading-none">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex flex-1 gap-0.5 sm:gap-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex-1 flex flex-col gap-0.5 sm:gap-1">
                  {week.map((day, di) => {
                    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                    const count = countMap.get(key) || 0;
                    const isFuture = day > today;
                    const color = getGitHubColor(count, maxCount);

                    return (
                      <div
                        key={di}
                        className={`relative w-full aspect-square rounded-[1px] sm:rounded-sm border transition-all duration-200 ${
                          isFuture ? 'opacity-0 pointer-events-none' : color
                        } ${!isFuture && count > 0 ? 'cursor-pointer hover:scale-110 hover:z-10' : ''}`}
                        title={
                          isFuture
                            ? ''
                            : `${formatDate(day)} - ${count} Generation${count !== 1 ? 's' : ''}`
                        }
                      ></div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t-2 border-wharf-border-secondary flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-mono text-[8px] sm:text-[10px] text-wharf-text-secondary capitalize">
              {totalDays} days with activity
            </span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-wharf-border-secondary" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <TrendingUp className="w-3 h-3 text-wharf-green-darker" />
            <span className="font-mono text-[8px] sm:text-[10px] text-wharf-text-secondary capitalize">
              {avgPerDay} avg per active day
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[8px] sm:text-[10px] text-wharf-text-secondary">
            {weeks.length} Weeks
          </span>
        </div>
      </div>
    </Card>
  );
};
