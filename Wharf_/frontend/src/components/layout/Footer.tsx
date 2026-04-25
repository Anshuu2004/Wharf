import { Mail, ExternalLink } from 'lucide-react'
import { FaDiscord, FaGithub, FaLinkedin } from 'react-icons/fa'

interface FooterProps {
  year?: number
  version?: string
}

export const Footer = ({ year = new Date().getFullYear(), version = 'v1.0.0' }: FooterProps) => {
  const footerLinks = {
    product: [
      { label: 'Generator', href: '#generator', description: 'AI-powered README generation' },
      { label: 'Tree Map', href: '#treemap', description: 'Visualize repo structure' },
      { label: 'Health Score', href: '#health', description: 'Check documentation quality' },
      { label: 'Changelog', href: '#changelog', description: 'Auto-generate changelogs' },
    ],
    resources: [
      { label: 'Documentation', href: '#docs', description: 'Guides & tutorials' },
      { label: 'API Reference', href: '#api', description: 'REST API endpoints' },
      { label: 'GitHub', href: 'https://github.com', description: 'Open source' },
      { label: 'Status', href: '#status', description: 'System status' },
    ],
    company: [
      { label: 'About', href: '#about', description: 'Our story' },
      { label: 'Blog', href: '#blog', description: 'Latest updates' },
      { label: 'Terms', href: '#terms', description: 'Terms of service' },
      { label: 'Privacy', href: '#privacy', description: 'Privacy policy' },
    ],
  }

  const socialLinks = [
    { icon: FaGithub, href: 'https://github.com/FrostByte-49', label: 'GitHub', color: 'hover:bg-wharf-text-tertiary' },
    { icon: FaLinkedin, href: 'https://linkedin.com/in/pranav-kh', label: 'LinkedIn', color: 'hover:bg-wharf-cyan' },
    { icon: Mail, href: 'mailto:pranav.kh25@gmail.com', label: 'Email', color: 'hover:bg-wharf-pink' },
    { icon: FaDiscord, href: 'https://discord.com/users/1377918872925241375', label: 'Discord', color: 'hover:bg-wharf-purple' },
  ]

  return (
    <footer className="border-t-4 border-wharf-border-primary bg-wharf-surface-secondary mt-auto">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Flex row with justify-between to push sections apart */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">
          
          {/* Left Section — Auto width */}
          <div className="lg:w-[40%] space-y-6">
            {/* Logo & Tagline */}
            <div>
              <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight mb-3">
                WHARF
              </h2>
              <p className="font-mono text-lg font-bold text-wharf-pink mb-2 capitalize">
                Ship code that speaks for itself...
              </p>
              <p className="font-mono text-sm text-wharf-text-secondary max-w-lg text-justify capitalize">
                AI-powered documentation workflow platform that transforms GitHub repositories 
                into clean, professional, recruiter-ready documentation in seconds.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="pt-4">
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
                      bg-wharf-surface-primary
                      transition-all duration-200
                      hover:-translate-y-0.5 hover:shadow-brutal-sm
                      ${social.color}
                    `}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 transition-colors group-hover:text-wharf-white" />
                    <span className="
                      absolute top-12 px-1.5 py-0.5
                      bg-wharf-black text-wharf-white
                      font-mono text-[10px] font-bold
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-150
                      whitespace-nowrap
                      border border-wharf-border-primary
                      shadow-brutal-sm
                      pointer-events-none
                    ">
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
              <div className="grid grid-cols-3 gap-8 md:gap-12 lg:gap-24">
                
                {/* Product Column */}
                <div>
                  <h3 className="font-mono font-bold text-sm uppercase tracking-wider mb-4 text-wharf-text-primary border-l-3 border-wharf-error pl-2">
                    Product
                  </h3>
                  <ul className="space-y-4">
                    {footerLinks.product.map((link) => (
                      <li key={link.label}>
                        <a 
                          href={link.href} 
                          className="group flex flex-col gap-0.5"
                        >
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
                  <h3 className="font-mono font-bold text-sm uppercase tracking-wider mb-4 text-wharf-text-primary border-l-3 border-wharf-success pl-2">
                    Resources
                  </h3>
                  <ul className="space-y-4">
                    {footerLinks.resources.map((link) => (
                      <li key={link.label}>
                        <a 
                          href={link.href} 
                          className="group flex flex-col gap-0.5"
                        >
                          <span className="font-mono text-sm text-wharf-text-secondary hover:text-wharf-success transition-colors flex items-center gap-1">
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
                  <h3 className="font-mono font-bold text-sm uppercase tracking-wider mb-4 text-wharf-text-primary border-l-3 border-wharf-warning pl-2">
                    Company
                  </h3>
                  <ul className="space-y-4">
                    {footerLinks.company.map((link) => (
                      <li key={link.label}>
                        <a 
                          href={link.href} 
                          className="group flex flex-col gap-0.5"
                        >
                          <span className="font-mono text-sm text-wharf-text-secondary hover:text-wharf-warning transition-colors flex items-center gap-1">
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
      <div className="border-t-2 border-wharf-border-primary bg-wharf-surface-primary">
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
  )
}