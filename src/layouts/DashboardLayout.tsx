import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminShell } from '../components/layout/admin-shell';
import { AuthGuard } from '../modules/auth/auth-guard';
import { DashboardPage } from '../modules/dashboard/dashboard-page';
import { ClientsListPage } from '../modules/clients/clients-list-page';
import { ClientDetailPage } from '../modules/clients/client-detail-page';
import { ProjectsListPage } from '../modules/projects/projects-list-page';
import { ProjectDetailPage } from '../modules/projects/project-detail-page';
import { GitHubRepositoriesPage } from '../modules/github/github-repositories-page';
import { TimelinePage } from '../modules/timeline/timeline-page';
import { TasksListPage } from '../modules/tasks/tasks-list-page';
import { KanbanBoard } from '../modules/kanban/kanban-board';
import { DocumentationTab } from '../modules/documentation/documentation-tab';
import { ShareLinksPanel } from '../modules/share-links/share-links-panel';
import { PaymentsPage } from '../modules/payments/payments-page';
import { ChangelogTab } from '../modules/changelog/changelog-tab';
import { NotesTab } from '../modules/notes/notes-tab';
import { DeploymentsTab } from '../modules/deployments/deployments-tab';
import { MilestonesTab } from '../modules/milestones/milestones-tab';
import { SettingsPage } from '../modules/settings/settings-page';
import { AvatarStudioPage } from '../features/identity-avatar/studio/AvatarStudioPage';
import { ProjectIdentitiesPage } from '../features/identity-avatar/studio/ProjectIdentitiesPage';
import { AvatarVariantsPage } from '../features/identity-avatar/studio/AvatarVariantsPage';
import { AvatarSettingsPage } from '../features/identity-avatar/studio/AvatarSettingsPage';
import { GuardianCreatorPage } from '../features/identity-avatar/creator/GuardianCreatorPage';
import { TeamsListPage } from '../modules/teams/team-directory/TeamsListPage';
import { TeamDetailPage } from '../modules/teams/detail/TeamDetailPage';
import { pageTransitionVariants } from '../../packages/ui/src/theme/motion';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();

  return (
    <AuthGuard>
      <AdminShell>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={pageTransitionVariants.initial}
            animate={pageTransitionVariants.animate}
            exit={pageTransitionVariants.exit}
            className="w-full h-full"
          >
            <Routes location={location}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="teams" element={<TeamsListPage />} />
              <Route path="/teams" element={<TeamsListPage />} />
              <Route path="teams/:teamId/*" element={<TeamDetailPage />} />
              <Route path="/teams/:teamId/*" element={<TeamDetailPage />} />
              <Route path="clients" element={<ClientsListPage />} />
              <Route path="/clients" element={<ClientsListPage />} />
              <Route path="clients/:id" element={<ClientDetailPage />} />
              <Route path="/clients/:id" element={<ClientDetailPage />} />
              <Route path="avatar-studio" element={<AvatarStudioPage />} />
              <Route path="/avatar-studio" element={<AvatarStudioPage />} />
              <Route path="avatar-studio/team/:teamId" element={<GuardianCreatorPage />} />
              <Route path="/avatar-studio/team/:teamId" element={<GuardianCreatorPage />} />
              <Route path="avatar-studio/projects" element={<ProjectIdentitiesPage />} />
              <Route path="/avatar-studio/projects" element={<ProjectIdentitiesPage />} />
              <Route path="avatar-studio/create" element={<GuardianCreatorPage />} />
              <Route path="/avatar-studio/create" element={<GuardianCreatorPage />} />
              <Route path="avatar-studio/:avatarId/edit" element={<GuardianCreatorPage />} />
              <Route path="/avatar-studio/:avatarId/edit" element={<GuardianCreatorPage />} />
              <Route path="avatar-studio/variants" element={<AvatarVariantsPage />} />
              <Route path="/avatar-studio/variants" element={<AvatarVariantsPage />} />
              <Route path="avatar-studio/settings" element={<AvatarSettingsPage />} />
              <Route path="/avatar-studio/settings" element={<AvatarSettingsPage />} />
              <Route path="avatar-studio/:avatarCode" element={<GuardianCreatorPage />} />
              <Route path="/avatar-studio/:avatarCode" element={<GuardianCreatorPage />} />
              <Route path="projects" element={<ProjectsListPage />} />
              <Route path="/projects" element={<ProjectsListPage />} />
              <Route path="projects/:slug" element={<ProjectDetailPage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path="github" element={<GitHubRepositoriesPage />} />
              <Route path="/github" element={<GitHubRepositoriesPage />} />
              <Route path="timeline" element={<TimelinePage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="tasks" element={<TasksListPage />} />
              <Route path="/tasks" element={<TasksListPage />} />
              <Route path="kanban" element={<KanbanBoard />} />
              <Route path="/kanban" element={<KanbanBoard />} />
              <Route path="docs" element={<DocumentationTab />} />
              <Route path="/docs" element={<DocumentationTab />} />
              <Route path="documentation" element={<DocumentationTab />} />
              <Route path="/documentation" element={<DocumentationTab />} />
              <Route path="share-links" element={<ShareLinksPanel />} />
              <Route path="/share-links" element={<ShareLinksPanel />} />
              <Route path="share" element={<ShareLinksPanel />} />
              <Route path="/share" element={<ShareLinksPanel />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="finances" element={<PaymentsPage />} />
              <Route path="/finances" element={<PaymentsPage />} />
              <Route path="changelog" element={<ChangelogTab />} />
              <Route path="/changelog" element={<ChangelogTab />} />
              <Route path="notes" element={<NotesTab />} />
              <Route path="/notes" element={<NotesTab />} />
              <Route path="deployments" element={<DeploymentsTab />} />
              <Route path="/deployments" element={<DeploymentsTab />} />
              <Route path="milestones" element={<MilestonesTab projectId="" />} />
              <Route path="/milestones" element={<MilestonesTab projectId="" />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Default fallback route */}
              <Route path="*" element={<DashboardPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </AdminShell>
    </AuthGuard>
  );
};

export default DashboardLayout;
