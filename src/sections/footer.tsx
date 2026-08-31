import React from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GithubIcon,
  NewTwitterIcon,
  Linkedin02Icon,
  DiscordIcon
} from '@hugeicons/core-free-icons';
import { HeroSignatureBackground } from '../components/landing/HeroSignatureBackground';
import { AppLogo } from '../components/ui/AppLogo';

export const FooterSection: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full border-t border-zinc-800/80 bg-[#050505] overflow-hidden text-zinc-400">

      {/* Signature Bunker Monochrome Architectural Background */}
      <HeroSignatureBackground />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 w-full pt-16 pb-12 space-y-16">

        {/* Top 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-12">

          {/* Column 1: Branding & Description & Socials (Span 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-5">
            <a href="#hero" className="inline-flex items-center group">
              <AppLogo size={32} showText={true} />
            </a>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
              Premium project management and client collaboration for modern freelancers.
            </p>

            {/* Glass Social Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-sm bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 hover:-translate-y-0.5 transition-all shadow-md"
              >
                <HugeiconsIcon icon={GithubIcon} size={18} />
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="w-9 h-9 rounded-sm bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 hover:-translate-y-0.5 transition-all shadow-md"
              >
                <HugeiconsIcon icon={NewTwitterIcon} size={18} />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-sm bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 hover:-translate-y-0.5 transition-all shadow-md"
              >
                <HugeiconsIcon icon={Linkedin02Icon} size={18} />
              </a>

              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Discord"
                className="w-9 h-9 rounded-sm bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 hover:-translate-y-0.5 transition-all shadow-md"
              >
                <HugeiconsIcon icon={DiscordIcon} size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Product Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">Product</h4>
            <ul className="space-y-2.5">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#portal-showcase" className="hover:text-white transition-colors">Client Portal</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
            </ul>
          </div>

          {/* Column 3: Resources Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">Resources</h4>
            <ul className="space-y-2.5">
              <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link to="/docs" className="hover:text-white transition-colors">Changelog</Link></li>
              <li><Link to="/docs" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Column 4: Company Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">Company</h4>
            <ul className="space-y-2.5">
              <li><Link to="/docs" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 5: Legal Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link to="/docs" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/docs" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/docs" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link to="/docs" className="hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Operational Status */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div>
            &copy; {currentYear} Bunker. All rights reserved.
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>All Systems Operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default FooterSection;
