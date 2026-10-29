import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { ProblemStats } from '@/components/landing/ProblemStats';
import { HowItWorksStepper } from '@/components/landing/HowItWorksStepper';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { RoleShowcase } from '@/components/landing/RoleShowcase';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata = {
  title: 'TruckSaathi | Indian Night-Highway Fleet Mission Control',
  description: 'Enterprise fleet dispatch, live telemetry tracking, driver safety, and trip P&L accounting purpose-built for commercial freight operations across India.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary selection:bg-brand-orange selection:text-white">
      <LandingNavbar />
      <main>
        <LandingHero />
        <ProblemStats />
        <HowItWorksStepper />
        <FeatureGrid />
        <RoleShowcase />
      </main>
      <LandingFooter />
    </div>
  );
}
