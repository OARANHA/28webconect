'use client';

import HeroSection from '@/components/site/HeroSection';
import ServicesSection from '@/components/site/ServicesSection';
import BenefitsSection from '@/components/site/BenefitsSection';
import CTASection from '@/components/site/CTASection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <BenefitsSection />
      <CTASection />
    </>
  );
}
