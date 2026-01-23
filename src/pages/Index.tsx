import { lazy, Suspense } from 'react';
import { Hero } from '@/components/Hero';
import { BentoAbout } from '@/components/BentoAbout';
import { PortfolioGrid } from '@/components/PortfolioGrid';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Analytics } from '@/components/Analytics';
import { DynamicMeta } from '@/components/DynamicMeta';

// Lazy load below-the-fold components to reduce initial bundle size
const ServiceCalculator = lazy(() => import('@/components/ServiceCalculator'));
const ProjectRequestForm = lazy(() => import('@/components/ProjectRequestForm'));

const Index = () => {
  return (
    <div className="min-h-screen bg-background mesh-background noise-overlay">
      <DynamicMeta />
      <Analytics />
      <div className="relative z-10">
        <Hero />
        <BentoAbout />
        <PortfolioGrid />
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <ServiceCalculator />
        </Suspense>
        <Suspense fallback={<div className="min-h-[300px]" />}>
          <ProjectRequestForm />
        </Suspense>
        <Footer />
        <CookieConsent />
        <ScrollToTop />
      </div>
    </div>
  );
};

export default Index;
