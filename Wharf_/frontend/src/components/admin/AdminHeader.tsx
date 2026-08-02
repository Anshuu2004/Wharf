import { RefreshCw } from 'lucide-react';

interface AdminHeaderProps {
  onRefresh?: () => void;
  isRefetching?: boolean;
}

export const AdminHeader = ({ onRefresh, isRefetching }: AdminHeaderProps) => {
  return (
    <div className="space-y-2 mt-0 mb-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-display font-black text-2xl md:text-4xl mb-2 tracking-tighter text-wharf-text-primary">
            Admin Dashboard
          </h1>
          <p className="font-mono text-md text-wharf-text-secondary capitalize">
            Manage system metrics & observability
          </p>
        </div>
        <div className="flex ml-auto flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefetching}
              className={`flex items-center gap-2 p-1.5 md:px-3 md:py-1.5 rounded-lg border-2 border-wharf-border-secondary bg-wharf-surface-secondary hover:bg-wharf-surface-tertiary transition-all ${
                isRefetching
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:border-wharf-border-primary'
              }`}
              title="Refresh Dashboard Data"
            >
              <RefreshCw
                className={`w-4 h-4 text-wharf-text-secondary ${isRefetching ? 'animate-spin' : ''}`}
              />
              <span className="hidden md:inline font-mono text-xs font-bold text-wharf-text-secondary uppercase tracking-wider">
                Refresh
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
