import { useState, useEffect, useCallback } from 'react';
import { ApiKeyCard, ApiKeyModal } from '../settings';
import { useToast } from '../ui/useToast';
import api from '../../lib/api';
import { Key, Activity, Lock } from 'lucide-react';
import { SiOpenai, SiAnthropic, SiX, SiGo } from 'react-icons/si';
import { FaGoogle } from 'react-icons/fa';
import { GiWhaleTail } from 'react-icons/gi';

interface ApiKey {
  id: string;
  provider: string;
  label: string;
  isVerified: boolean;
  hasKey: boolean;
  keyPrefix: string | null;
  isActive: boolean;
  usageCount: number;
  lastUsed: string | null;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const PROVIDERS = [
  { id: 'gemini', name: 'Gemini', icon: FaGoogle },
  { id: 'openai', name: 'OpenAI', icon: SiOpenai },
  { id: 'anthropic', name: 'Anthropic', icon: SiAnthropic },
  { id: 'groq', name: 'Groq', icon: SiGo },
  { id: 'grok', name: 'Grok', icon: SiX },
  { id: 'deepseek', name: 'DeepSeek', icon: GiWhaleTail },
];

export const ApiKeysTab = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchApiKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/user/apikeys');
      setApiKeys(response.data.data || []);
    } catch {
      showToast('Failed To Load API Keys', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleAddKey = (providerId: string) => {
    setEditingProvider(providerId);
    setModalOpen(true);
  };

  const handleEditKey = (providerId: string) => {
    setEditingProvider(providerId);
    setModalOpen(true);
  };

  const getKeyForProvider = (providerId: string) => {
    return apiKeys.find((k) => k.provider.toLowerCase() === providerId.toLowerCase());
  };

  const getProviderName = (providerId: string): string => {
    return PROVIDERS.find((p) => p.id === providerId)?.name || providerId;
  };

  const handleDeleteKey = async (providerId: string) => {
    const key = getKeyForProvider(providerId);
    if (!key) return;

    const providerName = getProviderName(providerId);

    try {
      await api.delete(`/user/apikey/${key.id}`);
      showToast(`${providerName} API Key Deleted Successfully`, 'success');
      fetchApiKeys();
    } catch {
      showToast(`Failed To Delete ${providerName} API Key`, 'error');
    }
  };

  const handleSaveKey = async (providerId: string, key: string) => {
    const providerName = getProviderName(providerId);

    try {
      await api.post('/user/apikey', { provider: providerId, key });
      showToast(`${providerName} API Key Saved Successfully!`, 'success');
      setModalOpen(false);
      setEditingProvider(null);
      fetchApiKeys();
    } catch (err) {
      let errorMsg = `Invalid ${providerName} API Key. Please Check & Try Again.`;

      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as ApiErrorResponse;
        if (errorResponse.response?.data?.error) {
          errorMsg = errorResponse.response.data.error;
        }
      }

      showToast(errorMsg, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-6 animate-pulse">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-wharf-border-secondary rounded" />
              <div className="h-6 bg-wharf-border-secondary rounded w-48" />
            </div>
            <div className="h-4 bg-wharf-border-secondary rounded w-64" />
          </div>
        </div>

        {/* Provider Cards Skeleton */}
        <div className="space-y-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-lg">
                <div className="flex items-center justify-between h-full px-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-wharf-border-secondary rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-4 bg-wharf-border-secondary rounded w-20" />
                      <div className="h-3 bg-wharf-border-secondary rounded w-32" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 bg-wharf-border-secondary rounded w-16" />
                    <div className="h-8 bg-wharf-border-secondary rounded w-20" />
                    <div className="h-8 bg-wharf-border-secondary rounded w-20" />
                    <div className="h-8 w-8 bg-wharf-border-secondary rounded" />
                  </div>
                </div>
              </div>
              {/* Usage Stats Skeleton */}
              <div className="flex items-center gap-4 px-4 py-2 bg-wharf-surface-secondary border-x-2 border-b-2 border-wharf-border-secondary rounded-md">
                <div className="w-3 h-3 bg-wharf-border-secondary rounded" />
                <div className="h-3 bg-wharf-border-secondary rounded w-24" />
                <div className="h-3 bg-wharf-border-secondary rounded w-1" />
                <div className="h-3 bg-wharf-border-secondary rounded w-32" />
              </div>
            </div>
          ))}
        </div>

        {/* Info Box Skeleton */}
        <div className="p-4 border-2 border-wharf-border-secondary bg-wharf-surface-secondary rounded-2xl animate-pulse">
          <div className="flex items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-wharf-border-secondary rounded" />
                <div className="h-4 bg-wharf-border-secondary rounded w-40" />
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-wharf-border-secondary rounded w-full" />
                <div className="h-3 bg-wharf-border-secondary rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-wharf-pink-dark" />
            <h3 className="font-display font-black text-lg tracking-tighter">API Keys (BYOK)</h3>
          </div>
          <p className="font-mono text-sm text-wharf-text-secondary mt-1 capitalize">
            Manage your API keys for AI providers. Keys are encrypted with AES-256.
          </p>
        </div>
      </div>

      {/* Provider List */}
      <div className="space-y-5">
        {PROVIDERS.map((provider) => {
          const key = getKeyForProvider(provider.id);
          const hasKey = !!key;
          const isVerified = key?.isVerified || false;
          const keyPrefix = key?.keyPrefix || null;
          const IconComponent = provider.icon;

          return (
            <div key={provider.id}>
              <ApiKeyCard
                provider={{
                  ...provider,
                  icon: IconComponent,
                  color: '', // Empty Color Since We're Not Using It
                }}
                hasKey={hasKey}
                isVerified={isVerified}
                keyPrefix={keyPrefix}
                usageCount={key?.usageCount}
                lastUsed={key?.lastUsed}
                onAdd={() => handleAddKey(provider.id)}
                onEdit={() => handleEditKey(provider.id)}
                onDelete={() => handleDeleteKey(provider.id)}
              />
              {/* Usage Stats Row */}
              {key && (
                <div className="flex items-center gap-4 px-4 py-2 bg-wharf-surface-secondary border-x-2 border-b-2 border-wharf-border-secondary text-xs font-mono text-wharf-text-tertiary rounded-md">
                  <Activity className="w-3 h-3" />
                  <span>
                    Used <strong className="text-wharf-text-secondary">{key.usageCount}</strong>{' '}
                    Times
                  </span>
                  <span className="text-wharf-text-secondary">|</span>
                  {key.lastUsed && (
                    <span>Last Used On {new Date(key.lastUsed).toLocaleDateString()}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="p-4 border-2 border-wharf-border-secondary bg-wharf-surface-secondary rounded-2xl">
        <div className="flex items-start">
          <div>
            <p className="flex gap-2 font-mono text-sm font-bold text-wharf-text-primary mb-1">
              <Lock className="w-4 h-4" /> Secure & Encrypted
            </p>
            <p className="font-mono text-xs text-wharf-text-secondary capitalize">
              Your API keys are encrypted with AES-256-GCM. If a key is invalid or missing, WHARF
              automatically falls back to the free tier.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ApiKeyModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProvider(null);
        }}
        onSave={handleSaveKey}
        provider={editingProvider}
        providerName={editingProvider ? getProviderName(editingProvider) : ''}
      />
    </div>
  );
};
