import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Badge, Button } from '../ui';

const CountUp = ({ end, duration = 2000 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      setCount(Math.floor(end * easeOut));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    if (end > 0) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      setCount(0);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  const formatNumber = (num: number) => {
    // Determine The Suffix Based On The *final* Target Value So It Doesn't Jump Aggressively
    // Wait, If We Always Format The Current Tick, It Naturally Transitions!
    return num > 999 ? (num / 1000).toFixed(1).replace('.0', '') + ' K+' : num.toString();
  };

  return <>{formatNumber(count)}</>;
};

export const Hero = () => {
  const [, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [stats, setStats] = useState({ totalGenerations: 0, totalTokens: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/public-stats')
      .then(res => {
        if (res.data?.success && res.data?.stats) {
          setStats(res.data.stats);
        }
      })
      .catch(err => console.error("Failed to load hero stats:", err))
      .finally(() => setStatsLoading(false));
  }, []);

  const fullText = 'Paste any GitHub URL...';

  useEffect(() => {
    let i = 0;
    if (isTyping && i <= fullText.length) {
      const timer = setInterval(() => {
        setTypedText(fullText.slice(0, i));
        i++;
        if (i > fullText.length) {
          clearInterval(timer);
          setIsTyping(false);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isTyping, fullText]);

  return (
    <section className="relative min-h-screen flex items-center justify-center -mt-3 border-b-4 border-wharf-border-primary overflow-hidden">
      {/* Image Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src="https://res.cloudinary.com/dhn92qb61/image/upload/f_auto,q_auto/v1785065871/hero_img_gc2zeo.webp"
          alt="Wharf Hero Background"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/10 z-[1]" />
      </div>

      {/* Loading Placeholder */}
      {!imageLoaded && <div className="absolute inset-0 bg-wharf-surface-primary z-0" />}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Card with Custom Clip-Path */}
          <div className="relative">
            {/* Border Layer */}
            <div
              className="absolute inset-0 bg-wharf-border-primary shadow-brutal"
              style={{
                clipPath: 'polygon(10% 0, 100% 0, 100% 85%, 90% 100%, 0 100%, 0 15%)',
              }}
            />

            {/* Background Layer with Dotted Grid */}
            <div
              className="absolute inset-[4px] bg-wharf-surface-secondary overflow-hidden"
              style={{
                clipPath: 'polygon(10% 0, 100% 0, 100% 85%, 90% 100%, 0 100%, 0 15%)',
              }}
            >
              {/* Dotted Grid Pattern */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'radial-gradient(circle, #000000 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
            </div>

            {/* Content Layer */}
            <div className="relative p-8 md:p-12 transition-all duration-300">
              <div className="text-center">
                {/* Badge */}
                <div className="mb-6 mt-4">
                  <Badge variant="pink" className="gap-2">
                    <Zap className="w-3 h-3" />
                    AI-Powered Documentation
                  </Badge>
                </div>

                {/* Main Heading */}
                <h1 className="font-display font-black text-4xl md:text-6xl lg:text-7xl tracking-tighter mb-6">
                  Ship Code That
                  <br />
                  <span className="text-wharf-pink-darker">Speaks For Itself</span>
                </h1>

                {/* Description */}
                <p className="font-mono text-sm md:text-base text-wharf-text-secondary max-w-2xl mx-auto mb-8 capitalize">
                  Your code is great, Your docs should be too ; <br />
                  WHARF generates professional, recruiter-ready documentation in seconds ; <br />
                  So you can focus on what matters: building amazing software ;
                </p>

                {/* CTA Buttons */}
                <div className="max-w-2xl mx-auto mb-8">
                  <div className="flex flex-col sm:flex-row gap-8 justify-center">
                    <Link to="/generator" className="w-full sm:w-auto">
                      <Button variant="primary" size="lg" rounded="2xl" className="gap-2 group w-full">
                        Generate Repository README
                      </Button>
                    </Link>
                    <Link to="/profile" className="w-full sm:w-auto">
                      <Button variant="outline" size="lg" rounded="2xl" className="group w-full">
                        Generate Profile README
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Stats - visible to ALL users, auth or not */}
                <div className="hidden md:flex flex-wrap justify-center gap-6 md:gap-20 pt-8 border-t-2 border-wharf-border-secondary max-w-2xl mx-auto">
                  <div className="text-center group cursor-pointer">
                    <div className="flex items-center gap-1 justify-center">
                      <span className="font-display font-black text-2xl group-hover:text-wharf-pink-darker transition-colors w-[120px]">
                        {statsLoading ? '0' : <CountUp end={stats.totalGenerations} />}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-wharf-text-secondary">Repos Documented</p>
                  </div>
                  <div className="text-center group cursor-pointer">
                    <div className="flex items-center gap-1 justify-center">
                      <span className="font-display font-black text-2xl group-hover:text-wharf-pink-darker transition-colors w-[120px]">
                        {statsLoading ? '0' : <CountUp end={stats.totalTokens} />}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-wharf-text-secondary">Tokens Burned</p>
                  </div>
                  <div className="text-center group cursor-pointer">
                    <div className="flex items-center gap-1 justify-center">
                      <span className="font-display font-black text-2xl group-hover:text-wharf-pink-darker transition-colors">
                        &lt;30s
                      </span>
                    </div>
                    <p className="font-mono text-xs text-wharf-text-secondary">
                      Avg Gen Time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
