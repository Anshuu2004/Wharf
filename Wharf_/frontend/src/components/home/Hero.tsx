import { useState, useEffect } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Hero = () => {
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

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
    <section className="relative min-h-screen flex items-center justify-center -mt-3 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoadedData={() => setVideoLoaded(true)}
        >
          <source
            // src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/20 z-[1]" />
      </div>

      {/* Loading Placeholder */}
      {!videoLoaded && <div className="absolute inset-0 bg-wharf-black/80 animate-pulse z-0" />}

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
                  <span className="text-wharf-pink-dark">Speaks For Itself</span>
                </h1>

                {/* Description */}
                <p className="font-mono text-sm md:text-base text-wharf-text-secondary max-w-2xl mx-auto mb-8 capitalize">
                  Transform any GitHub repository into clean, professional, recruiter-ready
                  documentation in seconds. No setup required.
                </p>

                {/* URL Input Bar */}
                <div className="max-w-2xl mx-auto mb-8">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <FaGithub className="w-5 h-5 text-wharf-text-tertiary" />
                      </div>
                      <input
                        type="text"
                        placeholder={typedText}
                        className="w-full pl-10 pr-4 py-3 font-mono text-sm border-2 border-wharf-border-primary bg-wharf-surface-primary focus:outline-none focus:shadow-brutal-sm focus:border-wharf-pink transition-all"
                      />
                    </div>
                    <Button variant="primary" size="lg" className="gap-2 group">
                      Generate README
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex flex-wrap justify-center gap-6 md:gap-16 pt-8 border-t-2 border-wharf-border-secondary max-w-2xl mx-auto">
                  <div className="text-center group cursor-default">
                    <div className="flex items-center gap-1 justify-center">
                      <span className="font-display font-black text-2xl group-hover:text-wharf-pink transition-colors">
                        10k+
                      </span>
                    </div>
                    <p className="font-mono text-xs text-wharf-text-tertiary">Repos Documented</p>
                  </div>
                  <div className="text-center group cursor-default">
                    <div className="flex items-center gap-1 justify-center">
                      <span className="font-display font-black text-2xl group-hover:text-wharf-pink transition-colors">
                        99%
                      </span>
                    </div>
                    <p className="font-mono text-xs text-wharf-text-tertiary">Accuracy Rate</p>
                  </div>
                  <div className="text-center group cursor-default">
                    <div className="flex items-center gap-1 justify-center">
                      <span className="font-display font-black text-2xl group-hover:text-wharf-pink transition-colors">
                        &lt;30s
                      </span>
                    </div>
                    <p className="font-mono text-xs text-wharf-text-tertiary">
                      Avg Generation Time
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
