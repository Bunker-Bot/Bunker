import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Folder01Icon,
  Share01Icon,
  ActivityIcon,
  SparklesIcon
} from '@hugeicons/core-free-icons';
import { HeroSignatureBackground } from '../components/landing/HeroSignatureBackground';

// Reusable Step Card Props Interface
interface StepCardProps {
  stepNumber: string;
  icon: typeof Folder01Icon;
  title: string;
  description: string;
  className?: string;
  delay?: number;
}

// Reusable Liquid Glass Step Card Component
const StepCard: React.FC<StepCardProps> = ({
  stepNumber,
  icon,
  title,
  description,
  className = '',
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, delay }}
      className={`group relative p-7 sm:p-8 bg-[rgba(15,15,18,0.92)] border border-zinc-800/90 rounded-lg backdrop-blur-2xl shadow-2xl hover:border-zinc-700 hover:scale-[1.01] transition-all duration-200 flex flex-col justify-between space-y-6 ${className}`}
    >
      {/* Header Row: Glass Capsule Badge & 32px HugeIcon Container */}
      <div className="flex items-center justify-between">
        <div className="px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 backdrop-blur-xl text-xs font-mono font-bold text-white shadow-lg tracking-wider">
          {stepNumber}
        </div>
        
        <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:-translate-y-1 transition-transform duration-200 shadow-md">
          <HugeiconsIcon icon={icon} size={28} />
        </div>
      </div>

      {/* Card Content */}
      <div className="space-y-2.5">
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed font-normal">{description}</p>
      </div>

      {/* Subtle Inner Highlight Line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent rounded-t-lg pointer-events-none" />
    </motion.div>
  );
};

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="scroll-mt-20 relative w-full py-24 pb-32 border-t border-zinc-800/80 bg-[#050505] overflow-hidden">
      
      {/* Signature Bunker Monochrome Architectural Background */}
      <HeroSignatureBackground />

      {/* Interactive Content Layer */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-12 w-full space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl text-xs text-zinc-300 shadow-xl">
            <HugeiconsIcon icon={SparklesIcon} size={14} className="text-zinc-300 animate-pulse" />
            <span className="font-medium">How It Works</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
            From project kickoff to client delivery in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              minutes
            </span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Bunker removes the friction from keeping clients informed by providing a secure, professional project portal that syncs automatically.
          </p>
        </div>

        {/* Spatial Journey Container with Balanced Padding */}
        <div className="relative pt-4 pb-12">
          
          {/* Desktop Precision Orthogonal Animated Connectors (Hidden on Mobile) */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
            <svg className="w-full h-full" viewBox="0 0 1200 440" fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Connector 1: Card 1 Right Edge -> Card 2 Top/Left Edge */}
              <path
                d="M 370 130 H 425 C 445 130 445 145 445 160 V 170 C 445 185 460 185 480 185"
                stroke="rgba(255, 255, 255, 0.14)"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
              <motion.path
                d="M 370 130 H 425 C 445 130 445 145 445 160 V 170 C 445 185 460 185 480 185"
                stroke="url(#glowGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Connector 2: Card 2 Right Edge -> Card 3 Top/Left Edge */}
              <path
                d="M 770 185 H 825 C 845 185 845 200 845 215 V 225 C 845 240 860 240 880 240"
                stroke="rgba(255, 255, 255, 0.14)"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
              <motion.path
                d="M 770 185 H 825 C 845 185 845 200 845 215 V 225 C 845 240 860 240 880 240"
                stroke="url(#glowGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Traveling Light Pulse Particles */}
              <motion.circle
                r="3.5"
                fill="#ffffff"
                animate={{
                  opacity: [0.2, 1, 0.2]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <animateMotion
                  path="M 370 130 H 425 C 445 130 445 145 445 160 V 170 C 445 185 460 185 480 185"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </motion.circle>

              <motion.circle
                r="3.5"
                fill="#ffffff"
                animate={{
                  opacity: [0.2, 1, 0.2]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
              >
                <animateMotion
                  path="M 770 185 H 825 C 845 185 845 200 845 215 V 225 C 845 240 860 240 880 240"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </motion.circle>
            </svg>
          </div>

          {/* Staggered Spatial 3-Step Cards Grid with Balanced Offsets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            
            {/* STEP 1: Top Left Offset */}
            <div className="lg:translate-y-0">
              <StepCard
                stepNumber="01"
                icon={Folder01Icon}
                title="Create Project"
                description="Create a new project, organize tasks, milestones, files, repositories, and documentation in one structured workspace."
                delay={0}
              />
            </div>

            {/* STEP 2: Center Middle Offset */}
            <div className="lg:translate-y-10">
              <StepCard
                stepNumber="02"
                icon={Share01Icon}
                title="Share Secure Portal"
                description="Generate a secure, branded client portal with a private share link and optional password protection."
                delay={0.15}
              />
            </div>

            {/* STEP 3: Bottom Right Offset */}
            <div className="lg:translate-y-20">
              <StepCard
                stepNumber="03"
                icon={ActivityIcon}
                title="Client Tracks Progress"
                description="Clients follow real-time progress, milestones, files, and updates without needing to create an account."
                delay={0.3}
              />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;
