import { Zap } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const SettingsHeader = () => {
  return (
    <div className="space-y-2 mb-8  ">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-display font-black text-3xl md:text-4xl mb-3 tracking-tighter">
            User Profile & Settings
          </h1>
          <p className="font-mono text-md text-wharf-text-secondary capitalize">
            Manage your account settings & preferences
          </p>
        </div>
        <Badge variant="cyan" size="sm" className="ml-auto">
          <Zap className="w-3 h-3" />
          v1.0.0
        </Badge>
      </div>
    </div>
  );
};
