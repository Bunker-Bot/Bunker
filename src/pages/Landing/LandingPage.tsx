import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { HeroSection } from '../../sections/hero';
import { FeaturesSection } from '../../sections/features';
import { HowItWorksSection } from '../../sections/how-it-works';
import { PortalShowcaseSection } from '../../sections/portal-showcase';
import { TestimonialsSection } from '../../sections/testimonials';
import { CtaSection } from '../../sections/cta';
import { FooterSection } from '../../sections/footer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Scroll restoration to top on page mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="w-full bg-[#050505] text-[#FAFAFA] selection:bg-zinc-800 selection:text-white"
    >
      {/* 1-6. Main Storytelling Landing Flow */}
      <main className="w-full">
        {/* 1. Hero Section */}
        <HeroSection
          onAdminLogin={() => navigate('/login')}
          onSeeAction={() => navigate('/login')}
        />

        {/* 2. Core Features Section */}
        <FeaturesSection />

        {/* 3. How It Works Interactive Walkthrough */}
        <HowItWorksSection />

        {/* 4. Client Portal Showcase Section */}
        <PortalShowcaseSection />

        {/* 5. Social Proof Testimonials Section */}
        <TestimonialsSection />

        {/* 6. Closing Conversion Call-To-Action Section */}
        <CtaSection />
      </main>

      {/* 7. Footer Section */}
      <FooterSection />
    </motion.div>
  );
};

export default LandingPage;
