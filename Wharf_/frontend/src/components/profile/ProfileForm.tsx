import { useState } from 'react';
import { ArrowRight, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge, Button, Card, Input } from '../ui';
import { FaGithub } from 'react-icons/fa';

// Define The User Type
interface GitHubUser {
  id?: string | number;
  login?: string;
  username?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
}

interface ProfileFormProps {
  user: GitHubUser | null;
  onFetch: (username: string) => void;
  isLoading: boolean;
}

export const ProfileForm = ({ user, onFetch, isLoading }: ProfileFormProps) => {
  const [username, setUsername] = useState('');
  const [touched, setTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [networkValid, setNetworkValid] = useState<boolean | null>(null);

  const validateUsername = (username: string) => {
    if (!username.trim()) {
      return { isValid: false, message: 'Please enter a GitHub username' };
    }

    // GitHub Username Rules: Alphanumeric & Hyphens, 1-39 Characters
    // Cannot Start Or End With Hyphen, Cannot Have Consecutive Hyphens
    const usernamePattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
    if (!usernamePattern.test(username.trim())) {
      return {
        isValid: false,
        message: 'Invalid username format. Use 1-39 characters (letters, numbers, hyphens)',
      };
    }

    return { isValid: true, message: 'Valid GitHub username' };
  };

  // Network Validation - Check If User Exists On GitHub
  const validateUserExists = async (username: string) => {
    const validation = validateUsername(username);
    if (!validation.isValid) return;

    setIsValidating(true);
    setNetworkValid(null);

    try {
      const apiUrl = `https://api.github.com/users/${username.trim()}`;

      const response = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (response.status === 200) {
        setNetworkValid(true);
      } else if (response.status === 404) {
        setNetworkValid(false);
      } else {
        // Rate Limited Error
        setNetworkValid(null);
      }
    } catch {
      // Network Error
      setNetworkValid(null);
    } finally {
      setIsValidating(false);
    }
  };

  const isValidUsername = () => {
    const result = validateUsername(username);
    return result.isValid;
  };

  const getValidationStatus = () => {
    if (!touched || !username) return null;
    return validateUsername(username);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateUsername(username);

    if (!validation.isValid) {
      setTouched(true);
      return;
    }

    if (username.trim()) {
      onFetch(username.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setTouched(true);
    setNetworkValid(null); // Reset Network Validation On Change
  };

  const handleExampleClick = (example: string) => {
    setUsername(example);
    setTouched(true);
    setTimeout(() => validateUserExists(example), 500);
  };

  const validation = getValidationStatus();
  const isValid = isValidUsername();
  const isButtonDisabled =
    isLoading || (touched && !isValid) || isValidating || networkValid === false;

  return (
    <Card variant="hard" rounded="3xl" className="overflow-visible">
      <div className="flex items-center gap-2 border-b-2 border-wharf-border-primary pb-3 mb-4">
        <FaGithub className="w-5 h-5 text-wharf-yellow-dark" />
        <span className="font-mono font-bold text-sm uppercase tracking-wider">GitHub Profile</span>
        {user && (
          <Badge variant="cyan" size="sm" className="ml-auto">
            Logged in
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <User
                className={`w-4 h-4 transition-colors ${
                  touched && username
                    ? isValid
                      ? 'text-wharf-green'
                      : 'text-wharf-error'
                    : 'text-wharf-text-tertiary'
                }`}
              />
            </div>
            <Input
              placeholder="Enter GitHub Username"
              value={username}
              onChange={handleUsernameChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setTouched(true)}
              onBlur={() => {
                if (isValid) {
                  validateUserExists(username);
                }
              }}
              className={`pl-9 font-mono text-sm rounded-2xl transition-all duration-300 ${
                touched && username
                  ? isValid
                    ? 'border-wharf-green/50'
                    : 'border-wharf-error/50'
                  : ''
              }`}
            />

            {/* Validation Indicator */}
            {touched && username && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValidating ? (
                  <div className="w-4 h-4 border-2 border-wharf-cyan border-t-transparent rounded-full animate-spin" />
                ) : isValid ? (
                  networkValid === false ? (
                    <AlertCircle className="w-4 h-4 text-wharf-error" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-wharf-green-darker" />
                  )
                ) : (
                  <AlertCircle className="w-4 h-4 text-wharf-error" />
                )}
              </div>
            )}
          </div>
          <Button
            variant="yellow"
            rounded="2xl"
            type="submit"
            loading={isLoading}
            disabled={isButtonDisabled}
            className="min-w-[120px]"
          >
            {isLoading ? 'Fetching...' : 'Fetch Profile'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Validation Message */}
        {touched && username && !isValid && validation && (
          <div className="flex items-center gap-2 p-2 bg-wharf-error/5 border border-wharf-error/50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-wharf-error flex-shrink-0" />
            <span className="font-mono text-xs text-wharf-error capitalize">
              {validation.message}
            </span>
          </div>
        )}

        {touched && username && isValid && networkValid === false && (
          <div className="flex items-center gap-2 p-2 bg-wharf-error/5 border border-wharf-error/50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-wharf-error flex-shrink-0" />
            <span className="font-mono text-xs text-wharf-error capitalize">
              GitHub user not found. Please check the username & try again.
            </span>
          </div>
        )}

        {touched && username && isValid && networkValid === true && (
          <div className="flex items-center gap-2 p-2 bg-wharf-green/15 border border-wharf-green-dark rounded-lg">
            <CheckCircle className="w-4 h-4 text-wharf-green-darker flex-shrink-0" />
            <span className="font-mono text-xs text-wharf-green-darker capitalize">
              Valid GitHub user - Ready to fetch profile
            </span>
          </div>
        )}

        {/* Quick Examples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-wharf-text-secondary">Examples:</span>
          {['octocat', 'torvalds'].map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="px-2 py-1 border border-wharf-border-secondary font-mono text-xs hover:border-wharf-yellow hover:bg-wharf-yellow/10 transition-colors cursor-pointer"
            >
              {example}
            </button>
          ))}
        </div>

        {user && (
          <div className="flex items-center gap-3 p-3 border border-wharf-border-secondary bg-wharf-surface-secondary">
            <FaGithub className="w-4 h-4 text-wharf-text-secondary" />
            <span className="font-mono text-xs text-wharf-text-tertiary">
              Use Your Own Profile:{' '}
              <button
                type="button"
                onClick={() => {
                  setUsername(user.login || user.username || '');
                  onFetch(user.login || user.username || '');
                }}
                className="text-wharf-yellow-dark cursor-pointer hover:font-bold"
              >
                {user.login || user.username}
              </button>
            </span>
          </div>
        )}
      </form>
    </Card>
  );
};

