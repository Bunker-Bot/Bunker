import React from 'react';
import { motion } from 'framer-motion';
import { ClientHero } from '../../../modules/portal/components/ClientHero';
import { ClientStatsGrid } from '../../../modules/portal/components/ClientStatsGrid';
import { ClientProgressDashboard } from '../../../modules/portal/components/ClientProgressDashboard';
import { ClientTechnologyGrid } from '../../../modules/portal/components/ClientTechnologyGrid';
import { ClientMilestoneCards } from '../../../modules/portal/components/ClientMilestoneCards';
import { ClientTimelinePreview } from '../../../modules/portal/components/ClientTimelinePreview';
import { ClientDocumentationGrid } from '../../../modules/portal/components/ClientDocumentationGrid';
import { ClientGithubSummary } from '../../../modules/portal/components/ClientGithubSummary';
import { ClientPaymentWidget } from '../../../modules/portal/components/ClientPaymentWidget';
import { ClientActivityFeed } from '../../../modules/portal/components/ClientActivityFeed';
import { ClientPortalFooter } from '../../../modules/portal/components/ClientPortalFooter';

interface PortalOverviewViewProps {
  project: any;
  milestones: any[];
  deliverables: any[];
  docs: any[];
  github: any;
  timeline?: any[];
  payments?: any[];
  expiresAt?: string | null;
  onNavigateModule: (id: string) => void;
  onOpenPaymentModal?: () => void;
}

export const PortalOverviewView: React.FC<PortalOverviewViewProps> = ({
  project,
  milestones = [],
  deliverables = [],
  docs = [],
  github = {},
  timeline = [],
  payments = [],
  expiresAt,
  onNavigateModule,
  onOpenPaymentModal,
}) => {
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m: any) => m.progress === 100).length;

  const computedProgress =
    (project?.completion_percent !== undefined && project?.completion_percent > 0)
      ? project.completion_percent
      : totalMilestones > 0
        ? Math.round(
            milestones.reduce((acc: number, m: any) => acc + (m.progress !== undefined ? m.progress : 0), 0) /
              totalMilestones
          )
        : 0;

  const totalBudget = Number(project?.budget || project?.amount || 10000);
  const verifiedPayments = (payments || []).filter((p: any) => p.is_verified !== false);
  const totalPaid = verifiedPayments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
  const remainingAmount = Math.max(0, totalBudget - totalPaid);
  const currencySymbol = project?.currency === 'USD' ? '$' : project?.currency === 'EUR' ? '€' : project?.currency === 'GBP' ? '£' : '₹';

  const techStack: string[] = Array.isArray(project?.tech_stack)
    ? project.tech_stack
    : typeof project?.tech_stack === 'string' && project.tech_stack.trim().length > 0
      ? project.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 font-mono text-xs select-none"
    >
      {/* 1. Enterprise Project Hero */}
      <ClientHero
        project={project}
        completionPct={computedProgress}
        totalMilestones={totalMilestones}
        completedMilestones={completedMilestones}
        remainingAmount={remainingAmount}
        currencySymbol={currencySymbol}
        onOpenPaymentModal={onOpenPaymentModal}
      />

      {/* 2. Responsive KPI Cards Grid (4 -> 2 -> 1) */}
      <ClientStatsGrid
        milestones={milestones}
        deliverables={deliverables}
        docs={docs}
        github={github}
        remainingAmount={remainingAmount}
        totalBudget={totalBudget}
        currencySymbol={currencySymbol}
        onNavigateModule={onNavigateModule}
      />

      {/* 3. Project Health & Delivery Telemetry Dashboard */}
      <ClientProgressDashboard
        completionPct={computedProgress}
        milestones={milestones}
        deliverables={deliverables}
        docs={docs}
        github={github}
        remainingAmount={remainingAmount}
        totalBudget={totalBudget}
        currencySymbol={currencySymbol}
      />

      {/* 4. Milestone Checkpoints Roadmap & Technology Stack Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ClientMilestoneCards milestones={milestones} onNavigateModule={onNavigateModule} />
        </div>
        <div className="lg:col-span-5">
          <ClientTechnologyGrid techStack={techStack} />
        </div>
      </div>

      {/* 5. Payment & Deliverables Unlock Portal Widget */}
      {onOpenPaymentModal && (
        <ClientPaymentWidget
          remainingAmount={remainingAmount}
          totalBudget={totalBudget}
          currencySymbol={currencySymbol}
          onOpenPaymentModal={onOpenPaymentModal}
        />
      )}

      {/* 6. Timeline Delivery Log & Recent Documentation Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <ClientTimelinePreview timeline={timeline} onNavigateTimeline={() => onNavigateModule('timeline')} />
        </div>
        <div className="lg:col-span-6">
          <ClientDocumentationGrid docs={docs} onNavigateDocs={() => onNavigateModule('documentation')} />
        </div>
      </div>

      {/* 7. GitHub Source Control Telemetry & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <ClientGithubSummary github={github} onNavigateGithub={() => onNavigateModule('github')} />
        </div>
        <div className="lg:col-span-6">
          <ClientActivityFeed milestones={milestones} docs={docs} deliverables={deliverables} />
        </div>
      </div>

      {/* 8. Enterprise Footer */}
      <ClientPortalFooter expiresAt={expiresAt} />
    </motion.div>
  );
};

export default PortalOverviewView;
