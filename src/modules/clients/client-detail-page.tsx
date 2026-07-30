import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useClientDetails } from '../../lib/supabase/queries/clients';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { ClientFormDrawer } from './client-form-drawer';
import { DeleteClientDialog } from './delete-client-dialog';
import { PageHeader } from '../../components/project/PageHeader';
import { ClientHeroSection } from './detail/client-hero-section';
import { Client360Stats } from './detail/client-360-stats';
import { ClientStickySidebar } from './detail/client-sticky-sidebar';
import { OverviewTab } from './detail/tabs/overview-tab';
import { ProjectsTab } from './detail/tabs/projects-tab';
import { TimelineTab } from './detail/tabs/timeline-tab';
import { DocumentationTab } from './detail/tabs/documentation-tab';
import { ShareLinksTab } from './detail/tabs/share-links-tab';
import { DeploymentsTab } from './detail/tabs/deployments-tab';
import { GithubTab } from './detail/tabs/github-tab';
import { NotesTab } from './detail/tabs/notes-tab';
import { ActivityTab } from './detail/tabs/activity-tab';
import { ProjectFormDrawer } from '../projects/project-form-drawer';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  ArrowLeft02Icon,
  Folder01Icon,
  Clock01Icon,
  File01Icon,
  Link01Icon,
  CloudIcon,
  GithubIcon,
  NoteIcon,
  ActivityIcon,
  Building01Icon
} from '@hugeicons/core-free-icons';

type ActiveTab = 'overview' | 'projects' | 'timeline' | 'documentation' | 'share-links' | 'deployments' | 'github' | 'notes' | 'activity';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = id || '';

  const { data: client, isLoading, isError } = useClientDetails(clientId);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  // Scoped Realtime subscriptions for clients and projects
  useRealtimeSubscription({ table: 'clients', queryKeyToInvalidate: ['clients'] });
  useRealtimeSubscription({ table: 'projects', queryKeyToInvalidate: ['clients', 'projects', clientId] });

  if (isLoading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6 text-zinc-100 font-mono select-none">
        <div className="h-32 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
        <div className="h-20 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="h-96 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse lg:col-span-3" />
          <div className="h-96 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse lg:col-span-1" />
        </div>
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="p-6 font-mono text-xs text-zinc-100 space-y-4 max-w-xl mx-auto text-center pt-20">
        <Link to="/app/clients" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white mb-4">
          <HugeiconsIcon icon={ArrowLeft02Icon} size={14} />
          <span>Back to Client Directory</span>
        </Link>
        <div className="p-8 rounded-sm bg-zinc-900 border border-zinc-800 space-y-3 shadow-xl">
          <div className="text-white font-bold text-base">Client Record Not Found</div>
          <p className="text-zinc-400 text-xs font-sans">The requested client workspace profile does not exist or has been deleted.</p>
          <button
            onClick={() => navigate('/app/clients')}
            className="px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-sm"
          >
            Return to Directory
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Building01Icon },
    { id: 'projects', label: `Projects (${client.projectCount})`, icon: Folder01Icon },
    { id: 'timeline', label: 'Timeline', icon: Clock01Icon },
    { id: 'documentation', label: 'Documentation', icon: File01Icon },
    { id: 'share-links', label: 'Share Links', icon: Link01Icon },
    { id: 'deployments', label: 'Deployments', icon: CloudIcon },
    { id: 'github', label: 'GitHub', icon: GithubIcon },
    { id: 'notes', label: 'Notes', icon: NoteIcon },
    { id: 'activity', label: 'Activity', icon: ActivityIcon },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 p-3 sm:p-6 text-zinc-100 font-mono select-none">
      {/* 1. Breadcrumb Page Header */}
      <PageHeader
        title={client.name}
        description="Comprehensive 360° client operational workspace, communication records, documentation, and delivery history."
        icon={UserIcon}
        badge={client.company}
        breadcrumbs={[
          { label: 'Client Directory', href: '/app/clients' },
          { label: client.name },
        ]}
      />

      {/* 2. Client Hero Section */}
      <ClientHeroSection
        client={client}
        onEdit={() => setIsDrawerOpen(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onCreateProject={() => setIsCreateProjectOpen(true)}
      />

      {/* 3. 10 Compact Statistics Cards */}
      <Client360Stats clientId={client.id} />

      {/* 4. Workspace Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-sm bg-zinc-900/90 border border-zinc-800 shadow-sm overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <HugeiconsIcon icon={tab.icon} size={14} className={isActive ? 'text-cyan-400' : 'text-zinc-500'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Two-Column Layout: Active Tab Content (Left 3 cols) + Sticky Sidebar (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Active Workspace Tab Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <OverviewTab key="overview" client={client} />}
            {activeTab === 'projects' && (
              <ProjectsTab key="projects" client={client} onCreateProject={() => setIsCreateProjectOpen(true)} />
            )}
            {activeTab === 'timeline' && <TimelineTab key="timeline" clientId={client.id} />}
            {activeTab === 'documentation' && <DocumentationTab key="documentation" clientId={client.id} />}
            {activeTab === 'share-links' && <ShareLinksTab key="share-links" clientId={clientId} />}
            {activeTab === 'deployments' && <DeploymentsTab key="deployments" clientId={clientId} />}
            {activeTab === 'github' && <GithubTab key="github" clientId={clientId} />}
            {activeTab === 'notes' && <NotesTab key="notes" client={client} />}
            {activeTab === 'activity' && <ActivityTab key="activity" clientId={clientId} />}
          </AnimatePresence>
        </div>

        {/* Right Sticky Sidebar */}
        <div className="lg:col-span-1">
          <ClientStickySidebar client={client} />
        </div>
      </div>

      {/* Slide-over Form Drawer */}
      <ClientFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        clientToEdit={client}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <DeleteClientDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        client={client}
      />

      {/* Create Project Drawer */}
      {isCreateProjectOpen && (
        <ProjectFormDrawer
          isOpen={isCreateProjectOpen}
          onClose={() => setIsCreateProjectOpen(false)}
        />
      )}
    </div>
  );
};

export default ClientDetailPage;
