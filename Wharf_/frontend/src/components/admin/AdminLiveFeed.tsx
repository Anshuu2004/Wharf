import { Badge, Card } from '../ui';
import {
  Activity,
  FileText,
  MessageSquare,
  User as UserIcon,
  Heart,
  GitBranch,
  Clock,
  Zap,
  Users,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

interface AdminLiveFeedProps {
  activities: { user: string; action: string; repo: string; timestamp: string }[];
}

type ActionIconMap = Record<string, LucideIcon>;
type ActionColorMap = Record<string, string>;
type ActionBadgeMap = Record<
  string,
  { variant: 'pink' | 'cyan' | 'purple' | 'green' | 'yellow'; label: string }
>;

const actionIcons: ActionIconMap = {
  'generated repo README': FileText,
  'generated profile README': UserIcon,
  'chatted about': MessageSquare,
  'checked health': Heart,
  'generated changelog': GitBranch,
};

const actionColors: ActionColorMap = {
  'generated repo README': 'text-wharf-pink-darker',
  'chatted about': 'text-wharf-cyan-darker',
  'generated profile README': 'text-wharf-purple-darker',
  'checked health': 'text-wharf-green-darker',
  'generated changelog': 'text-yellow-500',
};

const actionBadges: ActionBadgeMap = {
  'generated repo README': { variant: 'pink', label: 'README' },
  'chatted about': { variant: 'cyan', label: 'Chat' },
  'generated profile README': { variant: 'purple', label: 'Profile' },
  'checked health': { variant: 'green', label: 'Health' },
  'generated changelog': { variant: 'yellow', label: 'Changelog' },
};

export const AdminLiveFeed = ({ activities }: AdminLiveFeedProps) => {
  const getRelativeTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const getTimeColor = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 5) return 'text-wharf-green';
    if (minutes < 30) return 'text-wharf-yellow';
    return 'text-wharf-text-tertiary';
  };

  return (
    <Card variant="hard" rounded="3xl" className="overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div>
              <h3 className="font-display font-black text-xl tracking-tighter">
                Live Activity Feed
              </h3>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-wharf-text-secondary capitalize">
                  Recent user activity from the database
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Badge variant="cyan" size="sm" className="gap-1">
            <Users className="w-3 h-3" />
            {activities.length} activities
          </Badge>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-hidden">
        {activities.length === 0 ? (
          <div className="col-span-1 md:col-span-2 py-16 text-center border-2 border-wharf-border-secondary rounded-2xl bg-wharf-surface-secondary">
            <div className="w-12 h-12 mx-auto bg-wharf-surface-primary border-2 border-wharf-border-primary flex items-center justify-center rounded-xl mb-3">
              <Activity className="w-6 h-6 text-wharf-text-tertiary opacity-40" />
            </div>
            <p className="font-display font-black text-lg tracking-tighter text-wharf-text-secondary">
              No Recent Activity
            </p>
            <p className="font-mono text-sm text-wharf-text-tertiary mt-1 capitalize">
              Activity will appear here as users interact
            </p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const Icon = actionIcons[activity.action] || Activity;
            const color = actionColors[activity.action] || 'text-wharf-text-secondary';
            const badge = actionBadges[activity.action];
            const timeColor = getTimeColor(activity.timestamp);
            const isRecent = Date.now() - new Date(activity.timestamp).getTime() < 300000; // 5 Minutes

            return (
              <div
                key={index}
                className={`
                  group relative flex items-start gap-3 p-3 rounded-xl border-2 transition-all duration-200
                  ${
                    isRecent
                      ? 'border-wharf-green/20 bg-wharf-green/5 hover:border-wharf-green/40'
                      : 'border-wharf-border-secondary hover:border-wharf-border-primary bg-wharf-surface-secondary'
                  }
                `}
              >
                {/* Badge */}
                {badge && (
                  <Badge
                    variant={badge.variant}
                    size="sm"
                    className="absolute top-4 right-4 text-[8px]"
                  >
                    {badge.label}
                  </Badge>
                )}

                {/* Icon Container */}
                <div
                  className={`p-2 rounded-lg border-2 flex-shrink-0 ${
                    isRecent
                      ? 'bg-wharf-green/10 border-wharf-green/20'
                      : 'bg-wharf-surface-primary border-wharf-border-secondary'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>

                {/* Activity Details */}
                <div className="flex-1 min-w-0 pr-16">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-wharf-text-primary">
                      @{activity.user}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="font-mono text-xs text-wharf-text-secondary capitalize">
                      {activity.action}
                    </span>
                    <span className="font-mono font-bold text-xs text-wharf-pink-dark truncate">
                      {activity.repo}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={`font-mono text-[10px] ${timeColor} flex items-center gap-1 capitalize`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      {getRelativeTime(activity.timestamp)}
                    </span>
                    {isRecent && (
                      <span className="flex items-center gap-1 font-mono text-[10px] text-wharf-green">
                        <Zap className="w-2.5 h-2.5" />
                        New
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {activities.length > 0 && (
        <div className="hidden md:block mt-4 pt-3 border-t-2 border-wharf-border-secondary flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-wharf-text-secondary">
                {
                  activities.filter((a) => Date.now() - new Date(a.timestamp).getTime() < 300000)
                    .length
                }{' '}
                New Activities
              </span>
            </div>
            <div className="w-px h-4 bg-wharf-border-secondary" />
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
                Last update: {getRelativeTime(activities[0]?.timestamp || new Date().toISOString())}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-wharf-cyan-darker" />
            <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
              {activities.length} total events
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
