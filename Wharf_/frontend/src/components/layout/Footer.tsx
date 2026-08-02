import { Mail, ExternalLink } from 'lucide-react';
import { FaDiscord, FaGithub, FaLinkedin } from 'react-icons/fa';

interface FooterProps {
  year?: number;
  version?: string;
}

export const Footer = ({ year = new Date().getFullYear(), version = 'v1.0.0' }: FooterProps) => {
  const footerLinks = {
    product: [
      { label: 'README Generator', href: '/generator', description: 'AI-powered README generation' },
      { label: 'Profile Generator', href: '/profile', description: 'Create GitHub profiles' },
      { label: 'Codebase Chat', href: '/chat', description: 'AI architecture exploration' },
      { label: 'Changelogs', href: '/changelog', description: 'Automate version releases' },
    ],
    resources: [
      { label: 'Documentation', href: '/docs', description: 'Platform guide & Docs' },
      { label: 'Settings (BYOK)', href: '/settings', description: 'Manage custom API keys' },
      { label: 'GitHub Repository', href: 'https://github.com/FrostByte-49/Wharf', description: 'Open source codebase' },
      { label: 'Status', href: '#status', description: 'System status' },
    ],
    company: [
      { label: 'About WHARF', href: '/about', description: 'Our story & mission' },
      { label: 'Blog', href: '#blog', description: 'Latest updates' },
      { label: 'Terms of Service', href: '/terms', description: 'Usage boundaries & rules' },
      { label: 'Privacy Policy', href: '/privacy', description: 'Data handling practices' },
    ],
  };

  const socialLinks = [
    {
      icon: FaGithub,
      href: 'https://github.com/FrostByte-49',
      label: 'GitHub',
      color: 'hover:bg-wharf-text-tertiary/50',
    },
    {
      icon: FaLinkedin,
      href: 'https://linkedin.com/in/pranav-kh',
      label: 'LinkedIn',
      color: 'hover:bg-wharf-cyan',
    },
    {
      icon: Mail,
      href: 'mailto:pranav.kh25@gmail.com',
      label: 'Email',
      color: 'hover:bg-wharf-error',
    },
    {
      icon: FaDiscord,
      href: 'https://discord.com/users/1377918872925241375',
      label: 'Discord',
      color: 'hover:bg-wharf-purple',
    },
  ];

  return (
    <footer className="border-t-4 border-wharf-border-primary bg-wharf-background-primary mt-auto rounded-3xl">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-12">
        {/* Flex Row */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-12">
          {/* Left Section  */}
          <div className="lg:w-1/3 space-y-6">
            {/* Logo & Tagline */}
            <div>
              <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight mb-3">
                WHARF
              </h2>
              <p className="font-mono text-lg font-bold text-wharf-pink-dark mb-2 capitalize">
                Ship code that speaks for itself...
              </p>
              <p className="font-mono text-sm text-wharf-text-secondary max-w-lg text-justify capitalize">
                AI-powered documentation workflow platform that transforms GitHub repositories into
                clean, professional, recruiter-ready documentation in seconds...
              </p>
            </div>

            {/* Social Links */}
            <div className="pt-2">
              <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-wharf-text-tertiary mb-3">
                Connect with us
              </h3>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      group relative flex items-center justify-center
                      w-11 h-11 border-2 border-wharf-border-primary 
                      bg-wharf-surface-primary rounded-xl
                      transition-all duration-200
                      hover:-translate-y-0.5 hover:shadow-brutal-sm
                      ${social.color}
                    `}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 transition-colors group-hover:text-wharf-white" />
                    <span
                      className="
                      absolute top-12 px-1.5 py-0.5
                      bg-wharf-black text-wharf-white
                      font-mono text-[10px] font-bold
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-150
                      whitespace-nowrap
                      border border-wharf-border-primary
                      shadow-brutal-sm
                      pointer-events-none
                    "
                    >
                      {social.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden md:block">
            <div className="flex justify-end">
              <div className="grid grid-cols-3 gap-8 md:gap-12 lg:gap-20">
                {/* Product Column */}
                <div>
                  <h3 className="font-mono font-bold text-sm uppercase tracking-wider mb-4 text-wharf-text-primary border-l-3 border-wharf-error pl-2">
                    Product
                  </h3>
                  <ul className="space-y-5">
                    {footerLinks.product.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="group flex flex-col gap-0.5">
                          <span className="font-mono text-sm text-wharf-text-secondary hover:text-wharf-error transition-colors flex items-center gap-1">
                            {link.label}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                          <span className="font-mono text-[10px] text-wharf-text-tertiary capitalize">
                            {link.description}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources Column */}
                <div>
                  <h3 className="font-mono font-bold text-sm uppercase tracking-wider mb-4 text-wharf-text-primary border-l-3 border-wharf-green-darker pl-2">
                    Resources
                  </h3>
                  <ul className="space-y-5">
                    {footerLinks.resources.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="group flex flex-col gap-0.5">
                          <span className="font-mono text-sm text-wharf-text-secondary hover:text-wharf-green-darker transition-colors flex items-center gap-1">
                            {link.label}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                          <span className="font-mono text-[10px] text-wharf-text-tertiary capitalize">
                            {link.description}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Company Column */}
                <div>
                  <h3 className="font-mono font-bold text-sm uppercase tracking-wider mb-4 text-wharf-text-primary border-l-3 border-yellow-500 pl-2">
                    Company
                  </h3>
                  <ul className="space-y-5">
                    {footerLinks.company.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="group flex flex-col gap-0.5">
                          <span className="font-mono text-sm text-wharf-text-secondary hover:text-yellow-500 transition-colors flex items-center gap-1">
                            {link.label}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                          <span className="font-mono text-[10px] text-wharf-text-tertiary capitalize">
                            {link.description}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-2 border-wharf-border-primary bg-wharf-background-primary">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-wharf-text-tertiary capitalize">
                © {year} WHARF | All rights reserved
              </span>
            </div>

            <a href="#status" className="flex items-center gap-2 group">
              <span className="font-mono text-xs text-wharf-text-tertiary group-hover:text-wharf-text-primary transition-colors">
                // WHARF {version}
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
