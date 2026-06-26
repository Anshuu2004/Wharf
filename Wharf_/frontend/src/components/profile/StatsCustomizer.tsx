import { BarChart3, Star, GitFork, Users } from 'lucide-react'

interface StatsCustomizerProps {
  profileData: {
    followers: number
    following: number
    repos: number
    totalStars: number
    totalForks: number
  }
  onChange: (stats: any) => void
}

export const StatsCustomizer = ({ profileData }: StatsCustomizerProps) => {
  const statOptions = [
    { id: 'followers', label: 'Followers', icon: Users, value: profileData.followers },
    { id: 'following', label: 'Following', icon: Users, value: profileData.following },
    { id: 'repos', label: 'Repositories', icon: GitFork, value: profileData.repos },
    { id: 'stars', label: 'Total Stars', icon: Star, value: profileData.totalStars },
    { id: 'forks', label: 'Total Forks', icon: GitFork, value: profileData.totalForks },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-3.5 h-3.5 text-wharf-cyan" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider">Stats Display</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {statOptions.map((stat) => (
          <div key={stat.id} className="flex items-center gap-2 p-2 border border-wharf-border-secondary bg-wharf-surface-secondary">
            <stat.icon className="w-3 h-3 text-wharf-text-tertiary" />
            <div>
              <span className="font-mono text-[10px] font-bold">{stat.value}</span>
              <span className="font-mono text-[8px] text-wharf-text-tertiary ml-1">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}