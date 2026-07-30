import React, { useState } from 'react';
import { WorkspaceHealthBanner } from './components/workspace-health-banner';
import { DashboardKpiRow } from './components/dashboard-kpi-row';
import { DashboardQuickActions } from './components/dashboard-quick-actions';
import { ProjectHealthWidget } from './components/project-health-widget';
import { UpcomingDeadlinesWidget } from './components/upcoming-deadlines-widget';
import { GithubOverviewWidget } from './components/github-overview-widget';
import { DeploymentStatusWidget } from './components/deployment-status-widget';
import { ShareAnalyticsWidget } from './components/share-analytics-widget';
import { StorageAnalyticsWidget } from './components/storage-analytics-widget';
import { SystemStatusWidget } from './components/system-status-widget';
import { ProjectProgressChart } from './charts/project-progress-chart';
import { MonthlyCompletedChart } from './charts/monthly-completed-chart';
import { TechnologyUsageChart } from './charts/technology-usage-chart';
import { ClientDistributionChart } from './charts/client-distribution-chart';
import { RecentActivityFeed } from './recent-activity-feed';
import { ProjectFormDrawer } from '../projects/project-form-drawer';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';

export const DashboardPage: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Scoped Realtime Subscriptions for Dashboard Telemetry
  useRealtimeSubscription({
    table: 'projects',
    queryKeyToInvalidate: ['dashboard'],
  });

  useRealtimeSubscription({
    table: 'project_updates',
    queryKeyToInvalidate: ['dashboard'],
  });

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-5 text-zinc-100 font-mono select-none">
      {/* 1. Executive Workspace Health Banner */}
      <WorkspaceHealthBanner />

      {/* 2. Workspace KPI Cards Row */}
      <DashboardKpiRow />

      {/* 3. Quick Command Actions Row */}
      <DashboardQuickActions onOpenNewProject={() => setIsDrawerOpen(true)} />

      {/* 4. Main Analytics Charts Grid (2x2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ProjectProgressChart />
        <MonthlyCompletedChart />
        <TechnologyUsageChart />
        <ClientDistributionChart />
      </div>

      {/* 5. Project Health Status Widget */}
      <ProjectHealthWidget />

      {/* 6. Upcoming Deadlines & GitHub Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <UpcomingDeadlinesWidget />
        <GithubOverviewWidget />
      </div>

      {/* 7. Deployments Status & Share Link Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <DeploymentStatusWidget />
        <ShareAnalyticsWidget />
      </div>

      {/* 8. Storage Analytics & System Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <StorageAnalyticsWidget />
        <SystemStatusWidget />
      </div>

      {/* 9. Realtime Activity Feed */}
      <RecentActivityFeed />

      {/* Project Form Drawer */}
      <ProjectFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
