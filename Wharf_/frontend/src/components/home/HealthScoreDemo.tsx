import { useState } from 'react';
import {
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Zap,
  FileText,
  Users,
  Eye,
  BookOpen,
  Download,
  GitBranch,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const HealthScoreDemo = () => {
  const [score, setScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const animateScore = () => {
    setShowReport(false);
    setScore(0);
    setIsAnimating(true);

    setTimeout(() => {
      let current = 0;
      const target = 87;
      const increment = target / 35;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setScore(target);
          clearInterval(timer);
          setIsAnimating(false);
          setShowReport(true);
        } else {
          setScore(Math.floor(current));
        }
      }, 25);
    }, 100);
  };

  const categories = [
    {
      name: 'Description',
      score: 18,
      max: 20,
      percentage: 90,
      color: 'bg-wharf-green-dark',
      icon: FileText,
    },
    {
      name: 'Installation',
      score: 20,
      max: 20,
      percentage: 100,
      color: 'bg-wharf-green-dark',
      icon: Download,
    },
    {
      name: 'Usage',
      score: 12,
      max: 15,
      percentage: 80,
      color: 'bg-wharf-yellow-dark',
      icon: BookOpen,
    },
    {
      name: 'Tech Stack',
      score: 15,
      max: 15,
      percentage: 100,
      color: 'bg-wharf-green-dark',
      icon: GitBranch,
    },
    {
      name: 'Contributing',
      score: 10,
      max: 15,
      percentage: 67,
      color: 'bg-wharf-orange-dark',
      icon: Users,
    },
    { name: 'Visuals', score: 2, max: 5, percentage: 40, color: 'bg-wharf-orange-dark', icon: Eye },
  ];

  const suggestions = [
    {
      text: 'Add screenshots or GIFs to improve visual appeal',
      points: '+3',
      priority: 'high',
      icon: Eye,
    },
    {
      text: 'Create a CONTRIBUTING.md guide for contributors',
      points: '+5',
      priority: 'medium',
      icon: Users,
    },
    {
      text: 'Add usage examples with code snippets',
      points: '+3',
      priority: 'medium',
      icon: BookOpen,
    },
  ];

  const getScoreColor = () => {
    if (score >= 80) return 'text-wharf-green-dark';
    if (score >= 60) return 'text-wharf-yellow-dark';
    return 'text-wharf-orange-dark';
  };

  const getScoreGrade = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <section className="py-20 bg-wharf-surface-primary relative border-b-4 border-wharf-border-primary overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-grid opacity-5" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-wharf-pink/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-wharf-cyan/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 gap-2">
            <Zap className="w-3 h-3" />
            Interactive Demo
          </Badge>
          <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-4">
            Check Your Repo{' '}
            <span className="bg-gradient-to-r from-wharf-yellow-dark to-wharf-yellow-darker bg-clip-text text-transparent">
              Health
            </span>
          </h2>
          <p className="font-mono text-base text-wharf-text-secondary max-w-2xl md:max-w-lg mx-auto capitalize">
            Get instant feedback on your documentation quality with our AI-powered health score
          </p>
        </div>

        {/* Main Content  */}
        <div className="max-w-5xl mx-auto">
          {/* Score Display Card */}
          <div className={`transition-all duration-500 ${showReport ? 'mb-8' : ''}`}>
            <Card
              variant="hard"
              className={`text-center transition-all duration-500 ${showReport ? 'transform scale-95' : 'mx-auto max-w-md'}`}
            >
              <div className="flex flex-col items-center py-6">
                {/* Animated Score Circle */}
                <div className="relative mb-6">
                  <svg className="w-44 h-44 transform -rotate-90">
                    <circle
                      cx="88"
                      cy="88"
                      r="80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-wharf-border-secondary"
                    />
                    <circle
                      cx="88"
                      cy="88"
                      r="80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 80}`}
                      strokeDashoffset={`${2 * Math.PI * 80 * (1 - (isAnimating ? score / 100 : (showReport ? score : 0) / 100))}`}
                      className={`transition-all duration-1000 ease-out ${
                        isAnimating || showReport ? 'text-wharf-green-darker' : 'text-transparent'
                      }`}
                      style={{
                        strokeDashoffset:
                          2 *
                          Math.PI *
                          80 *
                          (1 - (isAnimating ? score : showReport ? score : 0) / 100),
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`font-display font-black text-5xl transition-all duration-300 ${getScoreColor()}`}
                    >
                      {isAnimating ? score : showReport ? score : '?'}
                    </span>
                    {showReport && (
                      <span className="font-mono text-[10px] text-wharf-text-tertiary mt-1">
                        out of 100
                      </span>
                    )}
                  </div>
                </div>

                {/* Score Label */}
                {!showReport && !isAnimating && (
                  <>
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-wharf-surface-secondary border border-wharf-border-primary">
                      <Activity className="w-4 h-4 text-wharf-pink-darker animate-pulse" />
                      <span className="font-mono text-xs font-bold">Ready To Analyze</span>
                    </div>
                    <button
                      onClick={animateScore}
                      className="group relative px-8 py-3 border-2 border-wharf-border-primary bg-wharf-pink font-mono font-bold text-sm hover:bg-wharf-pink-dark transition-all hover:translate-y-0.5 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Check Health Score
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="absolute inset-0 bg-wharf-pink-dark transform translate-y-full group-hover:translate-y-0 transition-transform" />
                    </button>
                  </>
                )}

                {/* Loading Animation */}
                {isAnimating && (
                  <div className="mt-4 flex items-center gap-2">
                    <div
                      className="w-2 h-2 bg-wharf-pink rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-wharf-pink rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-wharf-pink rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                    <span className="font-mono text-xs text-wharf-text-tertiary ml-2">
                      Analyzing Documentation...
                    </span>
                  </div>
                )}

                {/* Score Result Badge */}
                {showReport && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <Badge
                      variant={score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'peach'}
                      className="gap-1"
                    >
                      {getScoreGrade()}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-wharf-green" />
                      <span className="font-mono text-[10px] text-wharf-text-tertiary">
                        Better than 72% of repositories
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Detailed Report */}
          <div
            className={`transition-all duration-500 overflow-hidden ${showReport ? 'max-h-[2000px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Categories Breakdown */}
              <Card variant="hard" className="hover:shadow-brutal-lg transition-all">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-wharf-border-primary">
                  <Activity className="w-5 h-5 text-wharf-pink" />
                  <h3 className="font-display font-black text-xl">Score Breakdown</h3>
                </div>
                <div className="space-y-5">
                  {categories.map((cat) => (
                    <div key={cat.name} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-3 h-3 text-wharf-text-tertiary group-hover:text-wharf-pink transition-colors" />
                          <span className="font-mono text-sm font-medium group-hover:text-wharf-pink-dark transition-colors">
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold">
                            {cat.score}/{cat.max}
                          </span>
                          <Badge
                            size="sm"
                            variant={
                              cat.score === cat.max
                                ? 'green'
                                : cat.percentage >= 80
                                  ? 'teal'
                                  : 'yellow'
                            }
                          >
                            {cat.percentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="relative h-3 border border-wharf-border-primary bg-wharf-surface-secondary overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full ${cat.color} transition-all duration-1000 ease-out group-hover:shadow-brutal-sm`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      {cat.score < cat.max && (
                        <p className="font-mono text-[10px] text-wharf-text-tertiary mt-1">
                          Missing {cat.max - cat.score} point{cat.max - cat.score !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Suggestions & Improvements */}
              <Card variant="hard" className="hover:shadow-brutal-lg transition-all">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-wharf-border-primary">
                  <AlertCircle className="w-5 h-5 text-wharf-orange-dark" />
                  <h3 className="font-display font-black text-xl">Smart Suggestions</h3>
                </div>

                <div className="space-y-4">
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="group p-3 border-l-4 border-wharf-border-secondary hover:border-wharf-pink transition-all hover:bg-wharf-pink/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <suggestion.icon className="w-4 h-4 text-wharf-text-tertiary group-hover:text-wharf-pink transition-colors" />
                        </div>
                        <div className="flex-1">
                          <p className="font-mono text-sm group-hover:text-wharf-pink-dark transition-colors">
                            {suggestion.text}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              size="sm"
                              variant={suggestion.priority === 'high' ? 'peach' : 'cyan'}
                            >
                              {suggestion.points} points
                            </Badge>
                            <Badge size="sm" variant="default">
                              {suggestion.priority === 'high' ? 'Recommended' : 'Optional'}
                            </Badge>
                          </div>
                        </div>
                        <CheckCircle className="w-4 h-4 text-wharf-text-tertiary opacity-0 group-hover:opacity-100 transition-all group-hover:text-wharf-green" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Potential Score */}
                <div className="mt-6 pt-4 border-t-2 border-dashed border-wharf-border-primary">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold">Potential Score</span>
                    <span className="font-display font-black text-2xl bg-gradient-to-r from-wharf-green-dark to-wharf-green-darker bg-clip-text text-transparent">
                      {score + 11}/100
                    </span>
                  </div>
                  <div className="mt-2 h-2 border border-wharf-border-primary bg-wharf-surface-secondary">
                    <div className="h-full w-[98%] bg-gradient-to-r from-wharf-green-dark to-wharf-green-darker transition-all duration-500" />
                  </div>
                  <p className="font-mono text-[10px] text-wharf-text-tertiary mt-2">
                    Implement all suggestions to reach an excellent score
                  </p>
                </div>
              </Card>
            </div>

            {/* Reset Button */}
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setShowReport(false);
                  setScore(0);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-wharf-border-secondary font-mono text-xs hover:bg-wharf-surface-secondary transition-colors"
              >
                <ArrowRight className="w-3 h-3 rotate-180" />
                Analyze Another Repository
              </button>
            </div>
          </div>
        </div>

        {/* Try Your Own Repo Section */}
        <div className="max-w-2xl mx-auto mt-16 pt-8 border-t-2 border-wharf-border-primary">
          <div className="text-center">
            <p className="font-mono text-sm text-wharf-text-tertiary mb-4 flex items-center justify-center gap-2 capitalize">
              <GitBranch className="w-4 h-4" />
              Try with your own repository
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="github.com/username/repo"
                className="flex-1 px-4 py-3 font-mono text-sm border-2 border-wharf-border-primary bg-wharf-surface-primary focus:outline-none focus:shadow-brutal-sm focus:border-wharf-pink transition-all"
              />
              <button className="px-6 py-3 border-2 border-wharf-border-primary font-mono font-bold text-sm bg-wharf-cyan hover:bg-wharf-cyan-dark transition-all group">
                Analyze Now
                <ArrowRight className="w-4 h-4 inline ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
