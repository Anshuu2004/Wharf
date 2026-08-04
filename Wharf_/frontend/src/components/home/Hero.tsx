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
    <section className="relative min-h-[700px] flex items-center justify-center -mt-8 pb-12 pt-4 md:pt-8 md:pb-12 border-b-4 border-wharf-border-primary overflow-hidden bg-[#fafafa]">
      
      {/* Abstract Background Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-25 mix-blend-multiply"
          style={{
            backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
            backgroundSize: '4rem 4rem',
          }}
        />
        <div className="absolute left-0 top-0 w-[40rem] h-[40rem] bg-wharf-pink opacity-20 blur-[120px] rounded-full mix-blend-multiply pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute right-0 bottom-0 w-[40rem] h-[40rem] bg-wharf-cyan opacity-20 blur-[120px] rounded-full mix-blend-multiply pointer-events-none translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container max-w-[1240px] mx-auto px-4 relative z-10 mt-12 lg:mt-0">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 pt-6 pb-12 lg:pt-10 lg:pb-8">
          
          {/* Left Column: Typography, CTAs & Stats */}
          <div className="flex-[1.2] w-full z-10 flex flex-col items-start text-left">
            {/* Badge */}
            <div className="mb-6 lg:mb-8">
              <Badge variant="cyan" className="gap-2 shadow-brutal-sm text-sm py-1.5 px-4 rounded-none border-2 border-wharf-border-primary font-bold">
                <Zap className="w-4 h-4 text-wharf-pink-darker" />
                AI-Powered Documentation
              </Badge>
            </div>

            {/* Main Heading */}
            <h1 className="font-display font-black text-5xl md:text-6xl leading-[1.05] tracking-tight mb-6 lg:mb-8 text-wharf-text-primary uppercase">
              Ship Code <br />
              That <span className="text-wharf-pink-darker pr-4">Speaks...</span>
            </h1>

            {/* Descriptions */}
            <div className="mb-8 lg:mb-10 border-l-4 border-wharf-pink-dark pl-4">
              <p className="font-mono font-bold text-sm md:text-lg text-wharf-text-primary mb-3 tracking-tight capitalize">
                Your code is great, your docs should be too;
              </p>
              <p className="font-mono text-sm md:text-base text-wharf-text-secondary max-w-xl pr-4 leading-relaxed text-justify capitalize">
                WHARF generates professional, recruiter-ready profile & repository documentation in seconds so you can focus on what matters most: building amazing software...
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-row gap-4 w-full mb-8 lg:mb-10">
              <Link to="/generator" className="flex-1 sm:flex-none min-w-0">
                <Button 
                  variant="outline" 
                  size="lg" 
                  rounded="xl" 
                  className="w-full !bg-wharf-pink hover:!bg-wharf-pink-dark hover:!text-wharf-text-primary !shadow-brutal-sm gap-2 text-xs sm:text-sm lg:text-base px-3 sm:px-6 whitespace-nowrap transition-colors duration-200"
                >
                  <span className="sm:hidden">Repo README</span>
                  <span className="hidden sm:inline">Generate Repository README</span>
                </Button>
              </Link>
              <Link to="/profile" className="flex-1 sm:flex-none min-w-0">
                <Button 
                  variant="outline" 
                  size="lg" 
                  rounded="2xl" 
                  className="w-full gap-2 text-xs sm:text-sm lg:text-base px-3 sm:px-6 whitespace-nowrap transition-colors duration-200"
                >
                  <span className="sm:hidden">Profile README</span>
                  <span className="hidden sm:inline">Generate Profile README</span>
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 w-full">
              <div className="group cursor-pointer flex-1 min-w-[120px] max-w-[48%] lg:max-w-[180px] px-2 sm:px-4 py-3 flex flex-col items-center justify-center text-center border-2 border-wharf-border-primary hover:border-wharf-border-primary bg-wharf-surface-primary/80 rounded-2xl shadow-sm hover:shadow-brutal-sm transition-all">
                <div className="flex items-center justify-center gap-1">
                  <span className="font-display font-black text-xl sm:text-2xl group-hover:text-wharf-cyan-darker transition-colors tracking-tighter">
                    {statsLoading ? '0' : <CountUp end={stats.totalGenerations} />}
                  </span>
                </div>
                <p className="font-mono font-bold text-[9px] sm:text-[10px] text-wharf-text-secondary uppercase tracking-wider mt-1 text-center">Repos Documented</p>
              </div>
              
              <div className="group cursor-pointer flex-1 min-w-[120px] max-w-[48%] lg:max-w-[180px] px-2 sm:px-4 py-3 flex flex-col items-center justify-center text-center border-2 border-wharf-border-primary hover:border-wharf-border-primary bg-wharf-surface-primary/80 rounded-2xl shadow-sm hover:shadow-brutal-sm transition-all">
                <div className="flex items-center justify-center gap-1">
                  <span className="font-display font-black text-xl sm:text-2xl group-hover:text-red-600 transition-colors tracking-tighter">
                    {statsLoading ? '0' : <CountUp end={stats.totalTokens} />}
                  </span>
                </div>
                <p className="font-mono font-bold text-[9px] sm:text-[10px] text-wharf-text-secondary uppercase tracking-wider mt-1 text-center">Tokens Burned</p>
              </div>

              <div className="hidden sm:flex group cursor-pointer flex-1 min-w-[120px] max-w-[48%] lg:max-w-[180px] px-2 sm:px-4 py-3 flex-col items-center justify-center text-center border-2 border-wharf-border-primary hover:border-wharf-border-primary bg-wharf-surface-primary/80 rounded-2xl shadow-sm hover:shadow-brutal-sm transition-all">
                <div className="flex items-center justify-center gap-1">
                  <span className="font-display font-black text-xl sm:text-2xl group-hover:text-wharf-green-darker transition-colors tracking-tighter text-black">
                    &lt;30s
                  </span>
                </div>
                <p className="font-mono font-bold text-[9px] sm:text-[10px] text-wharf-text-secondary uppercase tracking-wider mt-1 text-center">Avg Gen Time</p>
              </div>
            </div>
          </div>

          {/* Right Column: Graphic */}
          <div className="flex flex-[0.8] w-full min-h-[350px] relative items-center justify-center lg:justify-end -mt-24 sm:-mt-8 lg:-mt-32 xl:-mt-32">
            <div className="relative w-full max-w-[500px] lg:max-w-none lg:w-[120%] aspect-square lg:aspect-[4/3] flex items-center justify-center lg:justify-end xl:translate-x-12 2xl:translate-x-20">
              
              {/* Overlapping README Mockup Graphic */}
              <div className="absolute inset-x-0 mx-auto lg:inset-auto lg:mx-0 lg:-left-[30%] top-[70%] lg:top-[70%] z-30 w-[100%] sm:w-[110%] lg:w-[120%] bg-[#fafafa] border-2 border-wharf-border-primary rounded-xl shadow-brutal p-3 lg:p-5 transform hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden">
                {/* Shimmer Effect Overlay */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                      
                <div className="flex gap-1.5 lg:gap-2 mb-3 lg:mb-5">
                  <div className="w-2.5 lg:w-3.5 h-2.5 lg:h-3.5 rounded-full bg-wharf-pink"></div>
                  <div className="w-2.5 lg:w-3.5 h-2.5 lg:h-3.5 rounded-full bg-wharf-cyan"></div>
                  <div className="w-2.5 lg:w-3.5 h-2.5 lg:h-3.5 rounded-full bg-wharf-purple"></div>
                </div>
                <div className="space-y-2 lg:space-y-3.5">
                  <div className="h-2.5 lg:h-3.5 w-3/4 bg-wharf-border-primary/20 rounded"></div>
                  <div className="h-2 lg:h-3 w-full bg-wharf-border-primary/10 rounded"></div>
                  <div className="h-2 lg:h-3 w-5/6 bg-wharf-border-primary/10 rounded"></div>
                  <div className="h-2 lg:h-3 w-full bg-wharf-border-primary/10 rounded"></div>
                      
                  <div className="mt-3 lg:mt-5 pt-3 lg:pt-5 border-t-2 border-wharf-border-primary/5">
                    <div className="h-8 lg:h-12 w-full rounded-md bg-gradient-to-r from-wharf-pink-darker/20 to-wharf-purple/20 border border-wharf-border-primary/10 flex items-center px-3 lg:px-5">
                      <div className="h-2 lg:h-3 w-1/2 bg-black/20 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Illustration */}
              <img
                src="https://res.cloudinary.com/dhn92qb61/image/upload/f_auto,q_auto/v1785674284/hero_img__ofc8fz.webp"
                alt="Wharf Isometric Graphic"
                className={`w-[120%] lg:w-[150%] max-w-[150%] h-auto object-contain lg:object-right transition-opacity duration-1000 transform lg:translate-x-8 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};