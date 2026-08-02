import { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Edit2,
  Check,
  X,
  MapPin,
  Building,
  Globe,
  Users,
  Award,
  Star,
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { Badge, Button, Card, Input, useToast } from '../ui';
import api from '../../lib/api';

interface ProfileTabProps {
  profileData: {
    name: string;
    username: string;
    email: string;
    avatar: string;
    githubId: string;
    joined: string;
    bio?: string;
    location?: string;
    company?: string;
    website?: string;
    repos?: number;
    stars?: number;
    followers?: number;
    following?: number;
    gists?: number;
    accountType?: string;
  } | null;
  isLoading: boolean;
  onProfileUpdated?: () => void;
}

export const ProfileTab = ({ profileData, isLoading, onProfileUpdated }: ProfileTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profileData?.name || '');
  const [bio, setBio] = useState(profileData?.bio || '');
  const [location, setLocation] = useState(profileData?.location || '');
  const [company, setCompany] = useState(profileData?.company || '');
  const [website, setWebsite] = useState(profileData?.website || '');
  const { showToast } = useToast();

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-start gap-6 pb-6 border-b-2 border-wharf-border-secondary animate-pulse">
          <div className="w-24 h-24 bg-wharf-border-secondary rounded-lg relative"></div>
          <div className="flex-1 space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <div className="h-8 bg-wharf-border-secondary rounded w-1/3" />
              <div className="h-5 bg-wharf-border-secondary rounded w-16" />
            </div>
            <div className="h-4 bg-wharf-border-secondary rounded w-1/4" />
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-wharf-border-secondary rounded" />
                <div className="h-3 bg-wharf-border-secondary rounded w-16" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-wharf-border-secondary rounded" />
                <div className="h-3 bg-wharf-border-secondary rounded w-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-2xl p-6 text-center animate-pulse"
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-wharf-border-secondary rounded-lg mb-2" />
                <div className="h-8 bg-wharf-border-secondary rounded w-16 mb-1" />
                <div className="h-3 bg-wharf-border-secondary rounded w-20" />
              </div>
            </div>
          ))}
        </div>

        {/* Details Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-7 bg-wharf-border-secondary rounded w-40 animate-pulse" />
            <div className="h-8 bg-wharf-border-secondary rounded w-20 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={`l-${i}`} className="space-y-1 animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-wharf-border-secondary rounded" />
                    <div className="h-3 bg-wharf-border-secondary rounded w-24" />
                  </div>
                  <div className="p-3 border-2 border-wharf-border-secondary bg-wharf-surface-secondary rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-wharf-border-secondary rounded" />
                      <div className="h-4 bg-wharf-border-secondary rounded flex-1" />
                      <div className="h-5 bg-wharf-border-secondary rounded w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Bio Skeleton */}
              <div className="space-y-1 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-wharf-border-secondary rounded" />
                  <div className="h-3 bg-wharf-border-secondary rounded w-16" />
                </div>
                <div className="p-3 border-2 border-wharf-border-secondary rounded-lg min-h-36">
                  <div className="space-y-2">
                    <div className="h-3 bg-wharf-border-secondary rounded w-full" />
                    <div className="h-3 bg-wharf-border-secondary rounded w-3/4" />
                    <div className="h-3 bg-wharf-border-secondary rounded w-1/2" />
                  </div>
                </div>
              </div>

              {/* Company & Website Skeletons */}
              {[1, 2].map((i) => (
                <div key={`r-${i}`} className="space-y-1 animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-wharf-border-secondary rounded" />
                    <div className="h-3 bg-wharf-border-secondary rounded w-20" />
                  </div>
                  <div className="p-3 border-2 border-wharf-border-secondary rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-wharf-border-secondary rounded" />
                      <div className="h-4 bg-wharf-border-secondary rounded flex-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <p className="font-mono text-wharf-text-secondary capitalize">
          No profile data available...
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await api.put('/user/profile', { name, bio, location, company, website });
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
      onProfileUpdated?.();
    } catch {
      showToast('Failed to update profile', 'error');
    }
  };

  const stats = [
    {
      label: 'Repositories',
      value: profileData.repos || 0,
      icon: FaGithub,
      color: 'bg-wharf-purple',
    },
    { label: 'Stars', value: profileData.stars || 0, icon: Star, color: 'bg-wharf-yellow' },
    { label: 'Followers', value: profileData.followers || 0, icon: Users, color: 'bg-wharf-cyan' },
    { label: 'Following', value: profileData.following || 0, icon: Users, color: 'bg-wharf-pink' },
    { label: 'Gists', value: profileData.gists || 0, icon: Award, color: 'bg-wharf-green' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-start gap-3 sm:gap-6 pb-6 border-b-2 border-wharf-border-secondary">
        <div className="relative flex-shrink-0">
          <img
            src={profileData.avatar}
            alt={profileData.username}
            className="w-24 h-24 border-2 border-wharf-border-primary object-cover rounded-lg"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-wharf-green border-2 border-wharf-border-primary rounded-full flex items-center justify-center">
            <FaGithub className="w-3 h-3 text-wharf-black" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-display font-black text-2xl tracking-tighter">
              {profileData.name}
            </span>
            {profileData.accountType && (
              <Badge variant="ghost" size="sm" className="flex-shrink-0">
                {profileData.accountType}
              </Badge>
            )}
          </div>
          <p className="font-mono text-sm text-wharf-text-secondary mt-1">
            @ {profileData.username}
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-3">
            <span className="font-mono text-xs text-wharf-text-tertiary flex items-center gap-1">
              <FaGithub className="w-3 h-3" />
              ID: {profileData.githubId.slice(0, 8)}
            </span>
            <span className="font-mono text-xs text-wharf-text-tertiary flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span className="sm:hidden">Join: {profileData.joined}</span>
              <span className="hidden md:inline">Joined: {profileData.joined}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 md:gap-8 mb-8 md:mb-12">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            variant="hard-sm"
            rounded="2xl"
            className="text-center group hover:translate-y-[-2px] transition-all duration-300"
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 ${stat.color} border-2 border-wharf-border-primary flex items-center justify-center mb-2 shadow-brutal-sm group-hover:shadow-brutal transition-all rounded-lg`}
              >
                <stat.icon className="w-5 h-5 text-wharf-black" />
              </div>
              <div className="font-display font-black text-xl md:text-2xl tracking-tighter">
                {stat.value.toLocaleString()}
              </div>
              <div className="font-mono text-xs text-wharf-text-secondary mt-1 capitalize">
                {stat.label}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Profile Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-xl tracking-tighter">Profile Details</h3>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              icon={<Edit2 className="w-3 h-3" />}
            >
              Edit
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Username */}
            <div className="space-y-1">
              <label className="font-mono text-xs font-bold text-wharf-text-secondary uppercase tracking-wider flex items-center gap-2">
                <User className="w-3 h-3" />
                Username
              </label>
              <div className="flex items-center gap-2 p-3 border-2 border-wharf-border-secondary bg-wharf-surface-secondary rounded-lg">
                <span className="font-mono text-sm">{profileData.username}</span>
                <Badge variant="ghost" size="sm" className="ml-auto">
                  GitHub Verified
                </Badge>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label className="font-mono text-xs font-bold text-wharf-text-secondary uppercase tracking-wider flex items-center gap-2">
                <User className="w-3 h-3" />
                Display Name
              </label>
              {isEditing ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="font-mono text-sm rounded-lg"
                  placeholder="Your full name"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 border-2 border-wharf-border-secondary rounded-lg">
                  <User className="w-4 h-4 text-wharf-text-tertiary" />
                  <span className="font-mono text-sm">{profileData.name}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-mono text-xs font-bold text-wharf-text-secondary uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3 h-3" />
                Email Address
              </label>
              <div className="flex items-center gap-2 p-3 border-2 border-wharf-border-secondary bg-wharf-surface-secondary rounded-lg">
                <Mail className="w-4 h-4 text-wharf-text-tertiary" />
                <span className="font-mono text-sm">{profileData.email || '—'}</span>
                <Badge variant="ghost" size="sm" className="ml-auto">
                  GitHub Synced
                </Badge>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="font-mono text-xs font-bold text-wharf-text-secondary uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                Location
              </label>
              {isEditing ? (
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="font-mono text-sm rounded-lg"
                  placeholder="City, Country"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 border-2 border-wharf-border-secondary rounded-lg">
                  <MapPin className="w-4 h-4 text-wharf-text-tertiary" />
                  <span className="font-mono text-sm">
                    {profileData.location || 'Not Specified'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Bio */}
            <div className="space-y-1">
              <label className="font-mono text-xs font-bold text-wharf-text-secondary uppercase tracking-wider flex items-center gap-2">
                <User className="w-3 h-3" />
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full min-h-34 p-3 font-mono text-sm border-2 border-wharf-border-secondary rounded-lg focus:border-wharf-pink focus:outline-none transition-colors bg-wharf-background-primary"
                  rows={3}
                  placeholder="Tell Us About Yourself..."
                />
              ) : (
                <div className="p-3 border-2 border-wharf-border-secondary rounded-lg min-h-36">
                  <p className="font-mono text-sm text-wharf-text-secondary">
                    {profileData.bio || 'No Bio Provided Yet...'}
                  </p>
                </div>
              )}
            </div>

            {/* Company */}
            <div className="space-y-1">
              <label className="font-mono text-xs font-bold text-wharf-text-secondary uppercase tracking-wider flex items-center gap-2">
                <Building className="w-3 h-3" />
                Company
              </label>
              {isEditing ? (
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="font-mono text-sm rounded-lg"
                  placeholder="Your Company"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 border-2 border-wharf-border-secondary rounded-lg">
                  <Building className="w-4 h-4 text-wharf-text-tertiary" />
                  <span className="font-mono text-sm">
                    {profileData.company || 'Not Specified'}
                  </span>
                </div>
              )}
            </div>

            {/* Website */}
            <div className="space-y-1">
              <label className="font-mono text-xs font-bold text-wharf-text-secondary uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-3 h-3" />
                Website
              </label>
              {isEditing ? (
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="font-mono text-sm rounded-lg"
                  placeholder="https://your-website.com"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 border-2 border-wharf-border-secondary rounded-lg">
                  <Globe className="w-4 h-4 text-wharf-text-tertiary" />
                  {profileData.website ? (
                    <a
                      href={profileData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-wharf-pink hover:underline"
                    >
                      {profileData.website}
                    </a>
                  ) : (
                    <span className="font-mono text-sm">Not Specified</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons (Edit Mode) */}
        {isEditing && (
          <div className="flex justify-end gap-6 mt-8 pt-6 border-t-2 border-wharf-border-secondary">
            <Button
              variant="primary"
              rounded="2xl"
              onClick={handleSave}
              icon={<Check className="w-4 h-4" />}
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              rounded="2xl"
              onClick={() => {
                setIsEditing(false);
                setName(profileData.name);
                setBio(profileData.bio || '');
                setLocation(profileData.location || '');
                setCompany(profileData.company || '');
                setWebsite(profileData.website || '');
              }}
              icon={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
