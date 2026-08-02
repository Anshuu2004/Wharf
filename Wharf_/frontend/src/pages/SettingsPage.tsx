import { useState, useEffect } from 'react';
import {
  SettingsHeader,
  SettingsNav,
  ProfileTab,
  ApiKeysTab,
  UsageTab,
  PreferencesTab,
  DangerTab,
} from '../components/settings';
import { Card } from '../components/ui/Card';
import api from '../lib/api';
import { useAnalytics } from '../hooks/useAnalytics';

interface ProfileData {
  name: string;
  username: string;
  email: string;
  avatar: string;
  githubId: string;
  joined: string;
  bio: string;
  location: string;
  company: string;
  website: string;
  repos: number;
  stars: number;
  followers: number;
  following: number;
  gists: number;
}

interface ApiResponse {
  data: {
    data: {
      name?: string;
      username?: string;
      email?: string;
      avatar?: string;
      id?: string;
      githubJoinedAt?: string;
      bio?: string;
      location?: string;
      company?: string;
      website?: string;
      reposCount?: number;
      starsCount?: number;
      followersCount?: number;
      followingCount?: number;
      gistsCount?: number;
    };
  };
}

export const SettingsPage = () => {
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    return ['profile', 'apikeys', 'usage', 'preferences', 'danger'].includes(hash)
      ? hash
      : 'profile';
  };

  const analytics = useAnalytics();
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    window.location.hash = activeTab;
    analytics.track('Feature Used', { feature: 'Settings', tab: activeTab });
  }, [activeTab]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = (await api.get('/user/profile')) as ApiResponse;
      const data = response.data.data;
      setProfileData({
        name: data.name || '',
        username: data.username || '',
        email: data.email || '',
        avatar: data.avatar || 'https://github.com/github.png',
        githubId: data.id || '',
        joined: data.githubJoinedAt
          ? new Date(data.githubJoinedAt).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })
          : '—',
        bio: data.bio || '',
        location: data.location || '',
        company: data.company || '',
        website: data.website || '',
        repos: data.reposCount || 0,
        stars: data.starsCount || 0,
        followers: data.followersCount || 0,
        following: data.followingCount || 0,
        gists: data.gistsCount || 0,
      });
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileTab
            profileData={profileData}
            isLoading={isLoading}
            onProfileUpdated={fetchProfile}
          />
        );
      case 'apikeys':
        return <ApiKeysTab />;
      case 'usage':
        return <UsageTab />;
      case 'preferences':
        return <PreferencesTab />;
      case 'danger':
        return <DangerTab />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6">
      <SettingsHeader />

      <div className="mb-8">
        <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <Card variant="hard" className="overflow-hidden rounded-3xl mb-12">
        <div className="py-4 px-2 sm:p-6">{renderTabContent()}</div>
      </Card>
    </div>
  );
};
