import { useState } from 'react';
import { Button, Input } from '../ui';
import {
  Trash2,
  Plus,
  Link2,
  Globe,
  Mail,
  AtSign,
  Check,
  ChevronDown,
  AlertCircle,
  MessageCircle,
  Briefcase,
  Code2,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import { FaGithub, FaInstagram, FaLinkedin, FaTwitch, FaTwitter, FaYoutube } from 'react-icons/fa';

export interface SocialLink {
  provider: string;
  url: string;
}

interface SocialBadgesInputProps {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

// Provider-Specific URL Patterns For Validation
const PROVIDER_PATTERNS: Record<string, RegExp> = {
  LinkedIn: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9\-_%/]+\/?$/,
  Twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/,
  GitHub: /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9\-_]+\/?$/,
  YouTube:
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(channel\/|c\/|@)?[a-zA-Z0-9\-_]+(\?.*)?$/,
  Medium: /^https?:\/\/(www\.)?medium\.com\/@?[a-zA-Z0-9\-_]+\/?$/,
  'Dev.to': /^https?:\/\/(www\.)?dev\.to\/[a-zA-Z0-9\-_]+\/?$/,
  Instagram: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/,
  Twitch: /^https?:\/\/(www\.)?twitch\.tv\/[a-zA-Z0-9_]+\/?$/,
  Gmail: /^[a-zA-Z0-9](\.?[a-zA-Z0-9_-]){5,29}@gmail\.com$/,
  Discord: /^https?:\/\/(www\.)?discord\.(com|gg)\/[a-zA-Z0-9\-_]+\/?$/,
  'Stack Overflow': /^https?:\/\/(www\.)?stackoverflow\.com\/users\/\d+\/?$/,
  Portfolio: /^https?:\/\/[a-zA-Z0-9\-_.]+\.[a-zA-Z]{2,}(\/.*)?$/,
};

const COMMON_PROVIDERS = [
  { id: 'LinkedIn', icon: FaLinkedin, color: 'text-wharf-cyan-darker' },
  { id: 'Twitter', icon: FaTwitter, color: 'text-wharf-cyan-darker' },
  { id: 'GitHub', icon: FaGithub, color: 'text-wharf-text-primary' },
  { id: 'YouTube', icon: FaYoutube, color: 'text-wharf-error' },
  { id: 'Portfolio', icon: Briefcase, color: 'text-wharf-purple-darker' },
  { id: 'Gmail', icon: Mail, color: 'text-wharf-error' },
  { id: 'Discord', icon: MessageCircle, color: 'text-wharf-purple-dark' },
  { id: 'Medium', icon: AtSign, color: 'text-wharf-green-dark' },
  { id: 'Dev.to', icon: Code2, color: 'text-wharf-orange-dark' },
  { id: 'Stack Overflow', icon: Globe, color: 'text-wharf-orange-dark' },
  { id: 'Instagram', icon: FaInstagram, color: 'text-wharf-yellow-darker' },
  { id: 'Twitch', icon: FaTwitch, color: 'text-wharf-purple-dark' },
];

const getProviderIcon = (providerName: string) => {
  const provider = COMMON_PROVIDERS.find((p) => p.id === providerName);
  return provider ? provider.icon : Globe;
};

const getProviderColor = (providerName: string) => {
  const provider = COMMON_PROVIDERS.find((p) => p.id === providerName);
  return provider ? provider.color : 'text-wharf-text-tertiary';
};

const getProviderPattern = (providerName: string): RegExp | null => {
  return PROVIDER_PATTERNS[providerName] || null;
};

export const SocialBadgesInput = ({ links, onChange }: SocialBadgesInputProps) => {
  const [provider, setProvider] = useState('LinkedIn');
  const [url, setUrl] = useState('');
  const [customProvider, setCustomProvider] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (url: string, providerName: string): boolean => {
    if (!url.trim()) return false;

    // For Custom Provider, Just Check If It's A Valid URL
    if (providerName === 'Custom') {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }

    // Check Against Provider-Specific Pattern
    const pattern = getProviderPattern(providerName);
    if (pattern) {
      return pattern.test(url);
    }

    // Fallback: Check If It's A Valid URL
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getProviderExample = (providerName: string): string => {
    const examples: Record<string, string> = {
      LinkedIn: 'https://linkedin.com/in/username',
      Twitter: 'https://twitter.com/username',
      GitHub: 'https://github.com/username',
      YouTube: 'https://youtube.com/@channel',
      Medium: 'https://medium.com/@username',
      'Dev.to': 'https://dev.to/username',
      Instagram: 'https://instagram.com/username',
      Twitch: 'https://twitch.tv/username',
      Gmail: 'username@gmail.com',
      Discord: 'https://discord.gg/invite',
      'Stack Overflow': 'https://stackoverflow.com/users/12345',
      Portfolio: 'https://yourdomain.com',
    };
    return examples[providerName] || 'https://example.com';
  };

  const handleAdd = () => {
    const finalProvider = provider === 'Custom' ? customProvider.trim() : provider;
    if (!url.trim() || !finalProvider) {
      setError('Please Fill In All Fields');
      return;
    }

    if (!validateUrl(url, provider)) {
      setError(`Invalid URL Format For ${finalProvider}. Example: ${getProviderExample(provider)}`);
      return;
    }

    // Check For Duplicate
    if (links.some((link) => link.provider === finalProvider)) {
      setError(`${finalProvider} Is Already Added`);
      return;
    }

    onChange([...links, { provider: finalProvider, url }]);
    setUrl('');
    setCustomProvider('');
    setError('');
  };

  const handleRemove = (index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    onChange(newLinks);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const isValidUrl = (url: string, providerName: string) => {
    if (providerName === 'Gmail') {
      return getProviderPattern('Gmail')?.test(url) || false;
    }
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Form */}
      <div className="p-4 bg-wharf-surface-secondary border-2 border-wharf-border-primary shadow-brutal-sm rounded-xl">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Provider Select */}
            <div className="relative w-full sm:w-44">
              <select
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value);
                  setError('');
                }}
                className="w-full h-10 bg-wharf-surface-primary border-2 border-wharf-border-primary text-wharf-text-primary px-3 py-2 pr-8 font-mono text-sm focus:outline-none focus:border-wharf-yellow appearance-none cursor-pointer"
              >
                {COMMON_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id}
                  </option>
                ))}
                <option value="Custom">Custom</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wharf-text-tertiary pointer-events-none" />
            </div>

            {/* Custom Provider Input */}
            {provider === 'Custom' && (
              <Input
                placeholder="Provider name..."
                value={customProvider}
                onChange={(e) => {
                  setCustomProvider(e.target.value);
                  setError('');
                }}
                className="w-full sm:w-40 h-10 font-mono text-sm"
              />
            )}

            {/* URL Input */}
            <Input
              placeholder={provider === 'Custom' ? 'https://...' : getProviderExample(provider)}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 font-mono text-sm min-w-[300px] h-10"
            />

            <Button
              onClick={handleAdd}
              variant="yellow"
              rounded="2xl"
              disabled={!url.trim() || (provider === 'Custom' && !customProvider.trim())}
              className="px-4 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          {/* Validation Feedback */}
          {url && !error && (
            <div className="flex items-center gap-2 mt-2 text-[10px] font-mono capitalize">
              <span className="text-wharf-text-tertiary">Format:</span>
              {isValidUrl(url, provider) ? (
                <span className="flex items-center gap-1 text-wharf-green-darker">
                  <CheckCircle className="w-3 h-3" />
                  Valid {provider === 'Gmail' ? 'email' : 'URL'} format
                </span>
              ) : (
                <span className="flex items-center gap-1 text-wharf-error">
                  <XCircle className="w-3 h-3" />
                  Invalid {provider === 'Gmail' ? 'email' : 'URL'} format
                </span>
              )}
              {provider !== 'Custom' &&
                isValidUrl(url, provider) &&
                !validateUrl(url, provider) && (
                  <span className="flex items-center gap-1 text-wharf-error">
                    <span className="text-wharf-text-secondary">|</span>
                    <XCircle className="w-3 h-3" />
                    Does not match {provider} format
                  </span>
                )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-2 mt-2 border-2 border-wharf-error bg-wharf-error/5 text-[10px] font-mono text-wharf-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Social Links List  */}
      <div className="space-y-3 min-h-0">
        {links.map((link, idx) => {
          const Icon = getProviderIcon(link.provider);
          const color = getProviderColor(link.provider);

          return (
            <div
              key={idx}
              className="group flex items-center justify-between p-3 bg-wharf-surface-secondary border-2 border-wharf-border-primary shadow-brutal-sm hover:border-wharf-border-primary transition-colors rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 bg-wharf-surface-primary border border-wharf-border-secondary flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-wharf-text-primary">
                      {link.provider}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-wharf-text-tertiary truncate">{link.url}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(idx)}
                className="ml-2 p-1.5 text-wharf-text-tertiary hover:text-wharf-error hover:bg-wharf-error/10 rounded transition-all group-hover:scale-105 cursor-pointer"
                title="Remove link"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {links.length === 0 && (
          <div className="p-8 text-center border-2 border-dashed border-wharf-border-secondary capitalize min-h-[96px] flex flex-col items-center justify-center">
            <Link2 className="w-8 h-8 text-wharf-text-secondary mx-auto mb-2" />
            <p className="font-mono text-sm text-wharf-text-secondary">No social links added yet</p>
            <p className="font-mono text-xs text-wharf-text-tertiary mt-1">
              Add your social profiles to let people connect with you
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {links.length > 0 && (
        <div className="flex items-center justify-between mt-8 pt-2 border-t-2 border-wharf-border-secondary text-[10px] font-mono text-wharf-text-tertiary capitalize">
          <span>
            {links.length} link{links.length !== 1 ? 's' : ''} connected
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3 text-wharf-green" />
            Ready to display
          </span>
        </div>
      )}
    </div>
  );
};

