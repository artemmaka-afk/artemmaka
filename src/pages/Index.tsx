import { Hero } from '@/components/Hero';
import { BentoAbout } from '@/components/BentoAbout';
import { PortfolioGrid } from '@/components/PortfolioGrid';
import { ServiceCalculator } from '@/components/ServiceCalculator';
import { ProjectRequestForm } from '@/components/ProjectRequestForm';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background mesh-background noise-overlay">
      <div className="relative z-10">
        <Hero />
        <BentoAbout />
        <PortfolioGrid />
        <ServiceCalculator />
        <ProjectRequestForm />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
