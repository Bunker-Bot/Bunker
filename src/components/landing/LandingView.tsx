import React from 'react';
import { HeroSection } from '../../sections/hero';
import { FeaturesSection } from '../../sections/features';
import { HowItWorksSection } from '../../sections/how-it-works';
import { PortalShowcaseSection } from '../../sections/portal-showcase';
import { TestimonialsSection } from '../../sections/testimonials';
import { CtaSection } from '../../sections/cta';
import { useNavigate } from 'react-router-dom';

export const LandingView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="w-full">
      {/* Hero Section */}
      <HeroSection
        onAdminLogin={() => navigate('/login')}
        onSeeAction={() => navigate('/login')}
      />

      {/* Core Features Showcase */}
      <FeaturesSection />

      {/* How It Works Interactive Walkthrough */}
      <HowItWorksSection />

      {/* Client Portal Showcase */}
      <PortalShowcaseSection />

      {/* Social Proof Testimonials Section */}
      <TestimonialsSection />

      {/* Final Conversion Call-To-Action Section */}
      <CtaSection />
    </main>
  );
};

export default LandingView;
