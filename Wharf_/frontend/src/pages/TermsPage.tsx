import { FileText, CheckCircle, AlertCircle, Scale, Database } from 'lucide-react';
import { Badge, Card } from '../components/ui';

export const TermsPage = () => {
  return (
    <main className="min-h-screen pb-6 w-full overflow-x-hidden">
      {/* Header */}
      <section className="py-20 bg-wharf-surface-primary w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-6">
            <Badge variant="cyan" className="gap-2 mx-auto w-fit">
              <Scale className="w-3 h-3" />
              Legal Documentation
            </Badge>

            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl tracking-tighter leading-[1.1]">
              Terms of{' '}
              <span className="bg-wharf-cyan-darker bg-clip-text text-transparent">Service</span>
            </h1>

            <p className="font-mono text-base md:text-lg text-wharf-text-secondary max-w-2xl mx-auto mb-16 capitalize">
              Please carefully read the boundaries & rules regarding your usage of the WHARF
              platform
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <Card variant="hard" rounded="2xl" className="p-8 bg-wharf-surface-primary group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border-2 border-wharf-border-primary bg-wharf-surface-secondary flex items-center justify-center rounded-lg">
                  <FileText className="w-6 h-6 text-wharf-cyan-darker" />
                </div>
                <h2 className="font-display font-black text-2xl tracking-tighter">
                  1. Acceptance of Terms
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-wharf-text-secondary leading-relaxed">
                <p>
                  By accessing or using WHARF, you agree to be bound by these Terms of Service. If
                  you disagree with any part of the terms, you may not access the service.
                </p>
                <p>
                  WHARF is designed to assist developers by generating repository documentation
                  utilizing advanced AI models and analyzing GitHub repositories. Our service relies
                  on third-party APIs (including GitHub and leading AI providers) and functions
                  strictly within their continuous availability.
                </p>
              </div>
            </Card>

            <Card variant="hard" rounded="2xl" className="p-8 bg-wharf-surface-primary group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border-2 border-wharf-border-primary bg-wharf-surface-secondary flex items-center justify-center rounded-lg">
                  <CheckCircle className="w-6 h-6 text-wharf-green-darker" />
                </div>
                <h2 className="font-display font-black text-2xl tracking-tighter">
                  2. User Conduct & Auth
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-wharf-text-secondary leading-relaxed">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    You must authenticate using a valid GitHub account to securely access platform
                    functionalities.
                  </li>
                  <li>
                    You are solely responsible for safeguarding the passwords you use to access the
                    service and for any activities or actions under your account.
                  </li>
                  <li>
                    You agree not to exploit the platform for generating abusive, illegal, or
                    heavily restricted explicit documentation materials.
                  </li>
                </ul>
              </div>
            </Card>

            <Card variant="hard" rounded="2xl" className="p-8 bg-wharf-surface-primary group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border-2 border-wharf-border-primary bg-wharf-surface-secondary flex items-center justify-center rounded-lg">
                  <AlertCircle className="w-6 h-6 text-wharf-error" />
                </div>
                <h2 className="font-display font-black text-2xl tracking-tighter">
                  3. AI Generation Disclaimer
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-wharf-text-secondary leading-relaxed">
                <p>
                  WHARF uses automated AI models (e.g., Gemini, Groq) to parse logic and generate
                  descriptive text. We do not guarantee the absolute accuracy, completeness, or
                  usefulness of this output.
                </p>
                <p>
                  As a user, you assume full responsibility for reviewing, modifying, and explicitly
                  validating any AI-generated documentation before merging it into your respective
                  production and open-source repositories.
                </p>
              </div>
            </Card>

            <Card variant="hard" rounded="2xl" className="p-8 bg-wharf-surface-primary group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border-2 border-wharf-border-primary bg-wharf-surface-secondary flex items-center justify-center rounded-lg">
                  <Database className="w-6 h-6 text-wharf-pink-darker" />
                </div>
                <h2 className="font-display font-black text-2xl tracking-tighter">
                  4. Third-Party Integrations
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-wharf-text-secondary leading-relaxed">
                <p>
                  Our Service may contain links to third-party web sites or services that are not
                  owned or controlled by WHARF. We strongly advise you to read the terms and
                  conditions and privacy policies of any third-party websites (especially GitHub).
                </p>
                <p>
                  WHARF will only execute automated workflows and repository access bounded
                  precisely by the permissions strictly granted through OAuth securely on login.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
};
