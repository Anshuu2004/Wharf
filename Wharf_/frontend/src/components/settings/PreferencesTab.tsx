import { useState, useEffect, useCallback } from 'react';
import { Mail, Save, Database, Zap, Settings } from 'lucide-react';
import { useToast } from '../ui/useToast';
import api from '../../lib/api';

interface Preferences {
  darkMode: boolean;
  emailNotifications: boolean;
  autoSave: boolean;
  betaFeatures: boolean;
  language: string;
}

export const PreferencesTab = () => {
  const [preferences, setPreferences] = useState<Preferences>({
    darkMode: true,
    emailNotifications: false,
    autoSave: true,
    betaFeatures: false,
    language: 'en',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchPreferences = useCallback(async () => {
    try {
      const response = await api.get('/user/preferences');
      if (response.data.success && response.data.data) {
        setPreferences((prev) => ({ ...prev, ...response.data.data }));
      }
    } catch {
      showToast('Failed To Load Preferences', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleToggle = (key: keyof Preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/user/preferences', preferences);
      showToast('Preferences Saved Successfully!', 'success');
    } catch {
      showToast('Failed To Save Preferences', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between animate-pulse">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-wharf-border-secondary rounded" />
              <div className="h-6 bg-wharf-border-secondary rounded w-32" />
            </div>
            <div className="h-4 bg-wharf-border-secondary rounded w-48" />
          </div>
        </div>

        {/* Preferences Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border-2 border-wharf-border-secondary bg-wharf-surface-secondary rounded-2xl animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-wharf-border-secondary rounded" />
                <div className="space-y-1">
                  <div className="h-4 bg-wharf-border-secondary rounded w-32" />
                  <div className="h-3 bg-wharf-border-secondary rounded w-20" />
                </div>
              </div>
              <div className="relative w-12 h-6 bg-wharf-border-secondary rounded-2xl">
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-wharf-border-secondary rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Save Button Skeleton */}
        <div className="flex justify-end pt-2">
          <div className="h-10 w-48 bg-wharf-border-secondary rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-wharf-pink-dark" />
            <h3 className="font-display font-black text-lg tracking-tighter">Preferences</h3>
          </div>
          <p className="font-mono text-sm text-wharf-text-secondary mt-1">
            Customize Your WHARF Experience
          </p>
        </div>
      </div>

      {/* Preferences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 border-2 border-wharf-border-secondary hover:border-wharf-border-primary transition-colors rounded-2xl">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-wharf-cyan-darker" />
            <div>
              <p className="font-mono font-bold text-sm">Email Notifications</p>
              <p className="font-mono text-xs text-wharf-text-tertiary">
                {preferences.emailNotifications ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('emailNotifications')}
            className={`relative w-12 h-6 border-2 transition-colors rounded-2xl cursor-pointer ${
              preferences.emailNotifications
                ? 'border-wharf-border-primary bg-wharf-yellow'
                : 'border-wharf-border-secondary bg-wharf-surface-secondary'
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 border border-wharf-border-primary bg-wharf-surface-primary transition-all rounded-2xl ${
                preferences.emailNotifications ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Auto-Save */}
        <div className="flex items-center justify-between p-4 border-2 border-wharf-border-secondary hover:border-wharf-border-primary transition-colors rounded-2xl">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-wharf-green-darker" />
            <div>
              <p className="font-mono font-bold text-sm">Auto-Save</p>
              <p className="font-mono text-xs text-wharf-text-tertiary">
                {preferences.autoSave ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('autoSave')}
            className={`relative w-12 h-6 border-2 transition-colors rounded-2xl cursor-pointer ${
              preferences.autoSave
                ? 'border-wharf-border-primary bg-wharf-yellow'
                : 'border-wharf-border-secondary bg-wharf-surface-secondary'
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 border border-wharf-border-primary bg-wharf-surface-primary transition-all rounded-2xl ${
                preferences.autoSave ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Beta Features */}
        <div className="flex items-center justify-between p-4 border-2 border-wharf-border-secondary hover:border-wharf-border-primary transition-colors rounded-2xl">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-wharf-yellow" />
            <div>
              <p className="font-mono font-bold text-sm">Beta Features</p>
              <p className="font-mono text-xs text-wharf-text-tertiary">
                {preferences.betaFeatures ? 'Opted In' : 'Opted Out'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('betaFeatures')}
            className={`relative w-12 h-6 border-2 transition-colors rounded-2xl cursor-pointer ${
              preferences.betaFeatures
                ? 'border-wharf-border-primary bg-wharf-yellow'
                : 'border-wharf-border-secondary bg-wharf-surface-secondary'
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 border border-wharf-border-primary bg-wharf-surface-primary transition-all rounded-2xl ${
                preferences.betaFeatures ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>


      </div>
      
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 border-2 border-wharf-border-primary bg-wharf-yellow/80 font-mono font-bold text-sm hover:bg-wharf-yellow transition-colors disabled:opacity-50 rounded-2xl cursor-pointer"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-wharf-black border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
};
