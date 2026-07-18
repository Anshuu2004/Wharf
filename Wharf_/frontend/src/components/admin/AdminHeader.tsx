import { Shield, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface AdminHeaderProps {
  onRefresh?: () => void;
  isRefetching?: boolean;
}

export const AdminHeader = ({ onRefresh, isRefetching }: AdminHeaderProps) => {
  return (
    <div className="space-y-2 mb-8">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-display font-black text-3xl md:text-4xl mb-3 tracking-tighter text-wharf-text-primary">
            Admin Dashboard
          </h1>
          <p className="font-mono text-md text-wharf-text-secondary capitalize">
            Manage system metrics & observability
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefetching}
              className={`p-1.5 rounded-lg border-2 border-wharf-border-secondary bg-wharf-surface-secondary hover:bg-wharf-surface-tertiary transition-all ${
                isRefetching
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:border-wharf-border-primary'
              }`}
              title="Refresh Dashboard Data"
            >
              <RefreshCw
                className={`w-4 h-4 text-wharf-text-secondary ${isRefetching ? 'animate-spin' : ''}`}
              />
            </button>
          )}
          <Badge variant="pink" size="sm">
            <Shield className="w-3 h-3" />
            Super Admin
          </Badge>
        </div>
      </div>
    </div>
  );
};
