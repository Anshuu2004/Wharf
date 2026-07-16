import { useState } from 'react';
import { Badge, Button } from '../ui';
import { CheckCircle, AlertCircle, Plus, Edit2, Trash2, Eye, EyeOff, Key } from 'lucide-react';
import { SiOpenai, SiAnthropic, SiX, SiGo } from 'react-icons/si';
import { GiWhaleTail } from 'react-icons/gi';
import { FaGoogle } from 'react-icons/fa';

interface ApiKeyCardProps {
  provider: {
    id: string;
    name: string;
    icon: string | React.ComponentType<{ className?: string }>;
    color: string;
  };
  hasKey: boolean;
  isVerified: boolean;
  keyPrefix: string | null;
  usageCount?: number;
  lastUsed?: string | null;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Map Provider IDs To Their Respective Icons
const getProviderIcon = (providerId: string): React.ComponentType<{ className?: string }> => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    gemini: FaGoogle,
    openai: SiOpenai,
    anthropic: SiAnthropic,
    groq: SiGo,
    grok: SiX,
    deepseek: GiWhaleTail,
  };
  return iconMap[providerId.toLowerCase()] || Key;
};

export const ApiKeyCard = ({
  provider,
  hasKey,
  isVerified,
  keyPrefix,
  onAdd,
  onEdit,
  onDelete,
}: ApiKeyCardProps) => {
  const [showKey, setShowKey] = useState(false);
  const IconComponent =
    typeof provider.icon === 'string' ? getProviderIcon(provider.id) : provider.icon || Key;

  const getStatusBadge = () => {
    if (!hasKey) {
      return {
        variant: 'ghost' as const,
        icon: <Key className="w-3 h-3" />,
        label: 'Not Set',
        className: 'gap-1',
      };
    }
    if (isVerified) {
      return {
        variant: 'green' as const,
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Active',
        className: 'gap-1',
      };
    }
    return {
      variant: 'peach' as const,
      icon: <AlertCircle className="w-3 h-3" />,
      label: 'Invalid',
      className: 'gap-1',
    };
  };

  const status = getStatusBadge();

  return (
    <div
      className={`group p-4 border-2 rounded-lg transition-all duration-200 border-wharf-border-secondary hover:border-wharf-border-primary ${
        hasKey && isVerified ? 'hover:border-wharf-green/30' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Provider Info */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Icon Container */}
          <div className="w-10 h-10 border-2 border-wharf-border-primary flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-5 h-5 text-wharf-text-secondary" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono font-bold text-sm uppercase text-wharf-text-secondary">
                {provider.name}
              </span>
              <Badge variant={status.variant} size="sm" className="gap-1.5">
                {status.icon}
                {status.label}
              </Badge>
            </div>

            {/* Key Display */}
            {hasKey && keyPrefix && (
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-2 px-2 py-0.25 bg-wharf-surface-secondary border border-wharf-border-secondary rounded-md">
                  <Key className="w-3 h-3 text-wharf-text-secondary" />
                  <span className="font-mono text-xs text-wharf-text-secondary">
                    {showKey ? keyPrefix : '••••••••••••••••'}
                  </span>
                </div>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 rounded-md hover:bg-wharf-surface-secondary transition-colors cursor-pointer"
                  aria-label={showKey ? 'Hide API key' : 'Show API key'}
                >
                  {showKey ? (
                    <EyeOff className="w-3.5 h-3.5 text-wharf-text-secondary hover:text-wharf-text-primary transition-colors" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-wharf-text-secondary hover:text-wharf-text-primary transition-colors" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasKey ? (
            <>
              <Button variant="ghost" size="sm" onClick={onEdit} className="min-w-[70px]">
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="min-w-[70px] text-wharf-error hover:bg-wharf-error/10 hover:text-wharf-error"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </>
          ) : (
            <Button variant="yellow" size="sm" onClick={onAdd} className="min-w-[100px]">
              <Plus className="w-3.5 h-3.5" />
              Add Key
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
