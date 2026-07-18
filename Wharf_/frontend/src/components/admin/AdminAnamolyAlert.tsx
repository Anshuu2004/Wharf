import { Badge, Card } from '../ui';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Bell,
  Shield,
  Clock,
  Activity,
  Zap,
} from 'lucide-react';

interface AdminAnomalyAlertProps {
  alerts: { level: string; message: string; timestamp: string }[];
}

export const AdminAnomalyAlert = ({ alerts }: AdminAnomalyAlertProps) => {
  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'critical':
        return {
          color: 'text-wharf-error',
          bg: 'bg-wharf-error/10',
          border: 'border-wharf-error',
          hover: 'hover:border-wharf-error/40',
          icon: XCircle,
          label: 'Critical',
          badgeVariant: 'pink' as const,
        };
      case 'warning':
        return {
          color: 'text-wharf-yellow-darker',
          bg: 'bg-wharf-yellow/10',
          border: 'border-wharf-yellow-darker',
          hover: 'hover:border-wharf-yellow/40',
          icon: AlertCircle,
          label: 'Warning',
          badgeVariant: 'yellow' as const,
        };
      default:
        return {
          color: 'text-wharf-cyan-darker',
          bg: 'bg-wharf-cyan/10',
          border: 'border-wharf-cyan-darker',
          hover: 'hover:border-wharf-cyan/40',
          icon: CheckCircle,
          label: 'Info',
          badgeVariant: 'cyan' as const,
        };
    }
  };

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
    if (minutes < 5) return 'text-wharf-green-darker';
    if (minutes < 30) return 'text-yellow-500';
    return 'text-wharf-text-secondary';
  };

  return (
    <Card variant="hard" rounded="3xl" className="overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div>
              <h3 className="font-display font-black text-xl tracking-tighter">Anomaly Alerts</h3>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-wharf-text-secondary capitalize">
                  System health & error alerts
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={alerts.length > 0 ? 'pink' : 'cyan'} size="sm" className="gap-1">
            {alerts.length > 0 ? (
              <>
                <Bell className="w-3 h-3" />
                {alerts.length} alerts
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                All clear
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-hidden">
        {alerts.length === 0 ? (
          <div className="col-span-1 md:col-span-2 py-16 text-center border-2 border-wharf-border-secondary rounded-2xl bg-wharf-surface-secondary">
            <div className="w-12 h-12 mx-auto bg-wharf-surface-primary border-2 border-wharf-border-primary flex items-center justify-center rounded-xl mb-3">
              <Shield className="w-6 h-6 text-wharf-green" />
            </div>
            <p className="font-display font-black text-lg tracking-tighter text-wharf-text-secondary">
              All Systems Operational
            </p>
            <p className="font-mono text-sm text-wharf-text-secondary mt-1 capitalize">
              No anomalies detected in the system
            </p>
          </div>
        ) : (
          alerts.map((alert, index) => {
            const config = getLevelConfig(alert.level);
            const Icon = config.icon;
            const timeColor = getTimeColor(alert.timestamp);
            const isRecent = Date.now() - new Date(alert.timestamp).getTime() < 300000; // 5 Minutes

            return (
              <div
                key={index}
                className={`
                  group relative flex items-start gap-3 p-3 rounded-xl border-2 transition-all duration-200
                  ${config.bg} ${config.border} ${config.hover}
                `}
              >
                {/* Badge */}
                <Badge
                  variant={config.badgeVariant}
                  size="sm"
                  className="absolute top-2 right-2 text-[8px]"
                >
                  {config.label}
                </Badge>

                {/* Icon Container */}
                <div
                  className={`p-2 rounded-lg border-2 flex-shrink-0 ${config.bg} ${config.border}`}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>

                {/* Alert Details */}
                <div className="flex-1 min-w-0 pr-16">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-wharf-text-primary capitalize">
                      {alert.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="font-mono text-xs text-wharf-text-secondary capitalize">
                      {alert.message}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span
                      className={`font-mono text-[10px] ${timeColor} flex items-center gap-1 capitalize`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      {getRelativeTime(alert.timestamp)}
                    </span>
                    {isRecent && (
                      <span className="flex items-center gap-1 font-mono text-[10px] text-wharf-green-darker">
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
      {alerts.length > 0 && (
        <div className="mt-4 pt-3 border-t-2 border-wharf-border-secondary flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
                {alerts.filter((a) => Date.now() - new Date(a.timestamp).getTime() < 300000).length}{' '}
                new alerts
              </span>
            </div>
            <div className="w-px h-4 bg-wharf-border-secondary" />
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
                Last update: {getRelativeTime(alerts[0]?.timestamp || new Date().toISOString())}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-wharf-cyan-darker" />
            <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
              {alerts.length} total alerts
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
