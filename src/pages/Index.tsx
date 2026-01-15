import { Hero } from '@/components/Hero';
import { PortfolioGrid } from '@/components/PortfolioGrid';
import { ServiceCalculator } from '@/components/ServiceCalculator';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background mesh-background noise-overlay">
      <div className="relative z-10">
        <Hero />
        <PortfolioGrid />
        <ServiceCalculator />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
