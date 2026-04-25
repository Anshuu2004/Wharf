import { Hero, HowItWorks, Features, Comparison, HealthScoreDemo, CTASection } from '../components/home'

export const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Comparison />
        <HealthScoreDemo />
        <CTASection />
      </main>
    </div>
  )
}