import { Badge, Card } from '../ui';
import { TrendingUp, TrendingDown, Crown, Medal, Trophy, Zap, Activity } from 'lucide-react';

interface AdminTopUsersProps {
  users: { username: string; generations: number; change: number }[];
}

const getRankIcon = (index: number) => {
  switch (index) {
    case 0:
      return <Crown className="w-4 h-4 text-yellow-500" />;
    case 1:
      return <Medal className="w-4 h-4 text-wharf-cyan-darker" />;
    case 2:
      return <Medal className="w-4 h-4 text-wharf-orange" />;
    default:
      return (
        <span className="font-mono text-xs font-bold text-wharf-text-tertiary">#{index + 1}</span>
      );
  }
};

const getRankBadge = (index: number) => {
  switch (index) {
    case 0:
      return { variant: 'pink' as const, label: 'Top', icon: Crown };
    case 1:
      return { variant: 'cyan' as const, label: '2nd', icon: Medal };
    case 2:
      return { variant: 'peach' as const, label: '3rd', icon: Medal };
    default:
      return { variant: 'ghost' as const, label: `#${index + 1}`, icon: null };
  }
};

const getChangeColor = (change: number) => {
  if (change > 0) return 'text-wharf-green';
  if (change < 0) return 'text-wharf-error';
  return 'text-wharf-text-tertiary';
};

const getChangeIcon = (change: number) => {
  if (change > 0) return <TrendingUp className="w-3 h-3" />;
  if (change < 0) return <TrendingDown className="w-3 h-3" />;
  return null;
};

export const AdminTopUsers = ({ users }: AdminTopUsersProps) => {
  const totalGenerations = users.reduce((sum, user) => sum + user.generations, 0);

  return (
    <Card variant="hard" rounded="3xl" className="overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div>
              <h3 className="font-display font-black text-xl tracking-tighter">Top Users</h3>
              <p className="font-mono text-sm text-wharf-text-secondary capitalize">
                Most active users by generations
              </p>
            </div>
          </div>
        </div>
        <Badge variant="cyan" size="sm" className="gap-1">
          <Activity className="w-3 h-3" />
          {totalGenerations.toLocaleString()} total gens
        </Badge>
      </div>

      {/* Users List */}
      <div className="space-y-2">
        {users.map((user, index) => {
          const rank = getRankBadge(index);
          const changeIcon = getChangeIcon(user.change);
          const changeColor = getChangeColor(user.change);
          const isTop3 = index < 3;
          const isFirst = index === 0;

          return (
            <div
              key={user.username}
              className={`
                group flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200
                ${
                  isFirst
                    ? 'border-wharf-orange bg-wharf-orange/10 hover:border-wharf-orange/50'
                    : isTop3
                      ? 'border-wharf-border-secondary hover:border-wharf-border-primary bg-wharf-surface-secondary'
                      : 'border-wharf-border-secondary hover:border-wharf-border-primary'
                }
              `}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Rank */}
                <div className="flex-shrink-0 w-8 text-center">
                  {isTop3 ? (
                    <div
                      className={`
                      w-8 h-8 rounded-full border-2 flex items-center justify-center
                      ${isFirst ? 'border-wharf-orange-dark' : 'border-wharf-border-secondary bg-wharf-surface-primary'}
                    `}
                    >
                      {getRankIcon(index)}
                    </div>
                  ) : (
                    <span className="font-mono text-xs font-bold text-wharf-text-tertiary">
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold text-sm truncate ${
                        isFirst ? 'text-wharf-orange-darker' : 'text-wharf-text-primary'
                      }`}
                    >
                      {user.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="cyan" size="sm" className="gap-1">
                      <Zap className="w-2.5 h-2.5" />
                      {user.generations} generations
                    </Badge>
                    {user.change !== 0 && (
                      <span
                        className={`flex items-center gap-0.5 font-mono text-[10px] font-bold ${changeColor}`}
                      >
                        {changeIcon}
                        {Math.abs(user.change)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rank Badge */}
              {isTop3 && (
                <Badge variant={rank.variant} size="sm" className="flex-shrink-0 gap-1">
                  {rank.icon && <rank.icon className="w-3 h-3" />}
                  {rank.label}
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-3 border-t-2 border-wharf-border-secondary flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
              {users.length} users ranked
            </span>
          </div>
          <div className="w-px h-4 bg-wharf-border-secondary" />
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
              Avg: {Math.round(totalGenerations / users.length)} gens/user
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3 h-3 text-yellow-500" />
          <span className="font-mono text-[10px] text-wharf-text-secondary">
            {users[0]?.username || 'No data'} Leading
          </span>
        </div>
      </div>
    </Card>
  );
};
