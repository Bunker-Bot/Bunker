import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  InformationCircleIcon,
  SparklesIcon,
  Building01Icon,
  QuoteUpIcon
} from '@hugeicons/core-free-icons';
import { HeroSignatureBackground } from '../components/landing/HeroSignatureBackground';

// Data-driven Sample Testimonial Items
interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  location: string;
  avatarInitials: string;
  quote: string;
  rating: number;
}

const SAMPLE_TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    name: 'Alexander Wright',
    role: 'Full-Stack Developer',
    location: 'United States',
    avatarInitials: 'AW',
    quote: 'Bunker completely transformed how I deliver client projects. My clients love checking their portal instead of emailing me every morning.',
    rating: 5
  },
  {
    id: '2',
    name: 'Elena Rostova',
    role: 'Product Designer & Strategist',
    location: 'Germany',
    avatarInitials: 'ER',
    quote: 'The zero-trust client portal is brilliant. Clients get a polished, read-only view of progress and files without needing to sign up.',
    rating: 5
  },
  {
    id: '3',
    name: 'Marcus Chen',
    role: 'Agency Founder',
    location: 'Singapore',
    avatarInitials: 'MC',
    quote: 'Automatic GitHub sync and milestone sign-offs save our team hours of manual status reporting each week.',
    rating: 5
  },
  {
    id: '4',
    name: 'Sophie Laurent',
    role: 'UI/UX Freelancer',
    location: 'France',
    avatarInitials: 'SL',
    quote: 'The monochrome liquid glass aesthetic immediately communicates luxury and craftsmanship to high-ticket clients.',
    rating: 5
  },
  {
    id: '5',
    name: 'David Miller',
    role: 'DevOps & Backend Engineer',
    location: 'United Kingdom',
    avatarInitials: 'DM',
    quote: 'Having PostgreSQL RLS security enforcing read-only share links gives me 100% peace of mind when sharing sensitive project data.',
    rating: 5
  },
  {
    id: '6',
    name: 'Hiroshi Tanaka',
    role: 'Mobile App Developer',
    location: 'Japan',
    avatarInitials: 'HT',
    quote: 'Project files, living documentation, and deliverable sign-offs in one place. It makes freelancing feel like running a top agency.',
    rating: 5
  }
];

// Sample Typographic Partner Logos
const SAMPLE_PARTNERS = [
  'Studio One',
  'North Labs',
  'Pixel Forge',
  'Nova Agency',
  'Code Foundry',
  'Vertex Studio'
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="scroll-mt-20 relative w-full py-24 border-t border-zinc-800/80 bg-[#050505] overflow-hidden">

      {/* Signature Bunker Monochrome Architectural Background */}
      <HeroSignatureBackground />

      {/* Main Interactive Container */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-12 w-full space-y-16">

        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl text-xs text-zinc-300 shadow-xl">
            <HugeiconsIcon icon={SparklesIcon} size={14} className="text-zinc-300 animate-pulse" />
            <span className="font-medium">Social Proof</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
            Built for freelancers who care about the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              client experience
            </span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            See how modern independent developers and agencies elevate their work with Bunker.
          </p>
        </div>

        {/* Explicit Glass Transparency Notice Banner */}
        <div className="max-w-3xl mx-auto p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-sm backdrop-blur-xl flex items-center gap-3 text-xs text-zinc-400 shadow-xl">
          <HugeiconsIcon icon={InformationCircleIcon} size={18} className="text-zinc-300 shrink-0" />
          <p className="leading-normal">
            <span className="font-mono font-bold text-white uppercase tracking-wider mr-2">Sample Content:</span>
            The testimonials below are illustrative placeholders and will be replaced with verified customer feedback before production release.
          </p>
        </div>

        {/* Sample Partner Logo Strip */}
        <div className="space-y-3 text-center">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">Sample Partner Logos</span>
          <div className="p-6 bg-[rgba(15,15,18,0.7)] border border-zinc-800/60 rounded-sm backdrop-blur-xl flex flex-wrap items-center justify-center sm:justify-between gap-6 opacity-70 hover:opacity-100 transition-opacity">
            {SAMPLE_PARTNERS.map((partner, index) => (
              <div key={index} className="flex items-center gap-2 text-xs sm:text-sm font-mono font-semibold text-zinc-400 tracking-wider">
                <HugeiconsIcon icon={Building01Icon} size={16} className="text-zinc-500" />
                <span>{partner}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Large Editorial Featured Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.25 }}
          className="group relative p-8 sm:p-12 bg-[rgba(15,15,18,0.92)] border border-zinc-800/90 rounded-sm backdrop-blur-2xl shadow-2xl space-y-6 hover:border-zinc-700 transition-all duration-200"
        >
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-1 text-white">
              {[...Array(5)].map((_, i) => (
                <HugeiconsIcon key={i} icon={StarIcon} size={16} className="fill-white text-white" />
              ))}
            </div>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-sm">
              Featured Sample Testimonial
            </span>
          </div>

          <div className="relative space-y-4">
            <HugeiconsIcon icon={QuoteUpIcon} size={36} className="text-zinc-700" />
            <blockquote className="text-lg sm:text-2xl font-medium text-white leading-relaxed tracking-tight">
              &ldquo;Bunker completely changed my client onboarding process. Giving every client their own secure, real-time portal eliminated 90% of status check-in emails while making my agency look like a Fortune 500 team.&rdquo;
            </blockquote>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-zinc-800/80">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center font-mono font-bold text-white text-base shadow-lg">
              JS
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Julian Sterling</h4>
              <p className="text-xs text-zinc-400">Principal Architect, Sterling Design Co. &bull; United States</p>
            </div>
          </div>
        </motion.div>

        {/* 6-Card Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_TESTIMONIALS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="group p-6 bg-[rgba(15,15,18,0.88)] border border-zinc-800/80 rounded-sm backdrop-blur-2xl shadow-xl hover:border-zinc-700 hover:scale-[1.01] transition-all duration-200 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header: 5 Monochrome Stars & Sample Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-white">
                    {[...Array(item.rating)].map((_, i) => (
                      <HugeiconsIcon key={i} icon={StarIcon} size={14} className="fill-white text-white" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Sample</span>
                </div>

                {/* Quote Body */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/80">
                <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-bold text-white shadow">
                  {item.avatarInitials}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{item.name}</h4>
                  <p className="text-[11px] text-zinc-400">{item.role} &bull; {item.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
