import { Lock, Key, ShieldCheck, Database, RefreshCw } from 'lucide-react';
import { Badge, Card } from '../components/ui';

export const PrivacyPage = () => {
  return (
    <main className="min-h-screen pb-6 w-full overflow-x-hidden">
      {/* Header */}
      <section className="py-20 bg-wharf-surface-primary w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-6">
            <Badge variant="purple" className="gap-2 mx-auto w-fit">
              <Lock className="w-3 h-3" />
              Privacy Assurance
            </Badge>

            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl tracking-tighter leading-[1.1]">
              Privacy{' '}
              <span className="bg-wharf-purple-darker bg-clip-text text-transparent">Policy</span>
            </h1>

            <p className="font-mono text-base md:text-lg text-wharf-text-secondary max-w-xl mx-auto mb-16 capitalize">
              How we process, secure & handle your repository data precisely & transparently
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <Card variant="hard" rounded="2xl" className="p-8 bg-wharf-surface-primary group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border-2 border-wharf-border-primary bg-wharf-surface-secondary flex items-center justify-center rounded-lg">
                  <Database className="w-6 h-6 text-wharf-cyan-darker" />
                </div>
                <h2 className="font-display font-black text-2xl tracking-tighter">
                  1. Information We Collect
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-wharf-text-secondary leading-relaxed">
                <p>
                  When you use WHARF, we securely log fundamental tracking properties to fulfill our
                  core services seamlessly:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>GitHub Data:</strong> Basic profile metadata and access tokens to
                    uniquely map generated documents back to you.
                  </li>
                  <li>
                    <strong>Repository Assets:</strong> Contextual source code and folder structures
                    passed temporarily into memory to provide exact AI analyses.
                  </li>
                  <li>
                    <strong>Usage Tracking:</strong> Token metrics and generation statistics
                    associated with your account are mapped securely inside a database to regulate
                    the platform.
                  </li>
                </ul>
              </div>
            </Card>

            <Card variant="hard" rounded="2xl" className="p-8 bg-wharf-surface-primary group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border-2 border-wharf-border-primary bg-wharf-surface-secondary flex items-center justify-center rounded-lg">
                  <RefreshCw className="w-6 h-6 text-wharf-green-darker" />
                </div>
                <h2 className="font-display font-black text-2xl tracking-tighter">
                  2. How We Use Information
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-wharf-text-secondary leading-relaxed">
                <p>
                  The primary purpose of collecting API and source intelligence is strictly utility:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Transforming complex codebase patterns into cohesive, human-readable
                    documentation metrics.
                  </li>
                  <li>
                    Tracking standard statistics such as total generations to populate UI metrics
                    (e.g., your Admin Dashboard).
                  </li>
                  <li>
                    Preventing malicious misuse, throttling API constraints heavily, and securing
                    backend pipelines.
                  </li>
                </ul>
              </div>
            </Card>

            <Card variant="hard" rounded="2xl" className="p-8 bg-wharf-surface-primary group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border-2 border-wharf-border-primary bg-wharf-surface-secondary flex items-center justify-center rounded-lg">
                  <Key className="w-6 h-6 text-wharf-pink-darker" />
                </div>
                <h2 className="font-display font-black text-2xl tracking-tighter">
                  3. AI Providers & Key Handling (BYOK)
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-wharf-text-secondary leading-relaxed">
                <p>
                  Your repository codebase represents your intellectual property. When passed to our
                  configured AI services (Gemini, Groq, etc.), standard API retention policies from
                  these enterprise models execute strictly natively.
                </p>
                <p>
                  <strong>Bring Your Own Key (BYOK):</strong> When using customized API keys
                  deployed in your configurations, those keys are deeply secured explicitly via
                  server-level encryptions and only invoked when fulfilling your specific request
                  streams explicitly.
                </p>
              </div>
            </Card>

            <Card variant="hard" rounded="2xl" className="p-8 bg-wharf-surface-primary group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border-2 border-wharf-border-primary bg-wharf-surface-secondary flex items-center justify-center rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-wharf-purple-darker" />
                </div>
                <h2 className="font-display font-black text-2xl tracking-tighter">
                  4. Your Control & Data Protection
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-wharf-text-secondary leading-relaxed">
                <p>
                  We do not sell, rent, or leverage your code for unsolicited programmatic
                  advertising models under any circumstances. You explicitly maintain comprehensive
                  control over your dataset footprint within WHARF.
                </p>
                <p>
                  History deletion functionality remains completely accessible natively mapping
                  orphaned records safely under high-water marks explicitly securing total privacy
                  asynchronously.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
};
