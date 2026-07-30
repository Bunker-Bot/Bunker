import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../../lib/supabase/queries/clients';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { ClientFormDrawer } from './client-form-drawer';
import { DeleteClientDialog } from './delete-client-dialog';
import { ProjectEmptyState } from '../../components/project/ProjectEmptyState';
import { PageHeader } from '../../components/project/PageHeader';
import { ClientKpiCards } from './components/client-kpi-cards';
import { ClientToolbar } from './components/client-toolbar';
import { ClientTableRow } from './components/client-table-row';
import { ClientExpandableRow } from './components/client-expandable-row';
import { exportClientsToCSV } from './utils/export-clients-csv';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserGroupIcon,
  PlusSignIcon,
  ViewIcon,
  Edit01Icon,
  Delete02Icon,
  Copy01Icon,
  Folder01Icon
} from '@hugeicons/core-free-icons';

const LOCAL_STORAGE_KEY = 'bunker_client_directory_filters_v1';

export const ClientsListPage: React.FC = () => {
  const navigate = useNavigate();

  // Filter & Search State with LocalStorage Persistence
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [country, setCountry] = useState('all');
  const [status, setStatus] = useState('all');
  const [activeProjects, setActiveProjects] = useState('all');
  const [registrationDate, setRegistrationDate] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Expansion & Menu State
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<any | null>(null);
  const [clientToDelete, setClientToDelete] = useState<any | null>(null);
  const [activeMenu, setActiveMenu] = useState<{ id: string; top: number; left: number } | null>(null);

  // Restore LocalStorage Filters on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.country) setCountry(parsed.country);
        if (parsed.status) setStatus(parsed.status);
        if (parsed.activeProjects) setActiveProjects(parsed.activeProjects);
        if (parsed.registrationDate) setRegistrationDate(parsed.registrationDate);
        if (parsed.sortBy) setSortBy(parsed.sortBy);
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, []);

  // Persist Filters to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ country, status, activeProjects, registrationDate, sortBy })
      );
    } catch (e) {
      // Ignore quota errors
    }
  }, [country, status, activeProjects, registrationDate, sortBy]);

  // 300ms Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Close portal dropdown menu on scroll or resize
  useEffect(() => {
    const handleDismiss = () => setActiveMenu(null);
    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);
    return () => {
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
  }, []);

  // Main Paginated Query
  const { data, isLoading, isError, refetch } = useClients({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search: debouncedSearch || undefined,
    country: country !== 'all' ? country : undefined,
    status: status as any,
    activeProjects: activeProjects as any,
    registrationDate: registrationDate as any,
    sortBy: sortBy as any,
  });

  // Scoped Realtime channel on clients table
  useRealtimeSubscription({
    table: 'clients',
    queryKeyToInvalidate: ['clients'],
  });

  const clients = data?.clients || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const toggleRowExpand = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const handleCopyText = (text: string) => {
    if (!text || text === '—') return;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-4 sm:space-y-6 text-zinc-100 font-mono select-none">
      {/* 1. Shared PageHeader */}
      <PageHeader
        title="Client Directory"
        description="Manage client accounts, communication details, project assignments, and delivery history from a centralized workspace."
        icon={UserGroupIcon}
        badge={`${totalCount} Client Accounts`}
        actions={
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportClientsToCSV(clients)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors shrink-0"
              title="Export Directory CSV"
            >
              <HugeiconsIcon icon={Folder01Icon} size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={() => {
                setClientToEdit(null);
                setIsDrawerOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-sm shrink-0"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={15} />
              <span>New Client</span>
            </button>
          </div>
        }
      />

      {/* 2. Workspace Statistics KPI Cards */}
      <ClientKpiCards />

      {/* 3. Search & Filters Sticky Toolbar */}
      <ClientToolbar
        search={search}
        onSearchChange={setSearch}
        onSearchClear={() => setSearch('')}
        country={country}
        onCountryChange={(val) => {
          setCountry(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        activeProjects={activeProjects}
        onActiveProjectsChange={(val) => {
          setActiveProjects(val);
          setPage(1);
        }}
        registrationDate={registrationDate}
        onRegistrationDateChange={(val) => {
          setRegistrationDate(val);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={(val) => {
          setSortBy(val);
          setPage(1);
        }}
        onRefresh={() => refetch()}
        onExportCsv={() => exportClientsToCSV(clients)}
      />

      {/* 4. Premium Client Directory Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-4 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs flex items-center justify-between">
          <span>Failed to load client directory.</span>
          <button onClick={() => refetch()} className="underline cursor-pointer">Retry</button>
        </div>
      ) : clients.length === 0 ? (
        <ProjectEmptyState
          title="No Clients Found"
          description={debouncedSearch ? `No client records matching "${debouncedSearch}".` : 'Create your first client to begin managing projects and securely sharing project progress.'}
          icon={UserGroupIcon}
          action={
            <button
              onClick={() => {
                setClientToEdit(null);
                setIsDrawerOpen(true);
              }}
              className="px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-sm"
            >
              Create Client
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="rounded-sm border border-zinc-800 bg-zinc-900/90 shadow-md overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-zinc-950/90 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Contact Details</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Projects</th>
                  <th className="px-4 py-3">Current Engagement</th>
                  <th className="px-4 py-3">Last Activity</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3">Health</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                {clients.map((client: any) => {
                  const isExpanded = expandedRowId === client.id;
                  return (
                    <React.Fragment key={client.id}>
                      <ClientTableRow
                        client={client}
                        isExpanded={isExpanded}
                        onToggleExpand={() => toggleRowExpand(client.id)}
                        onOpenMenu={(e) => {
                          e.stopPropagation();
                          if (activeMenu?.id === client.id) {
                            setActiveMenu(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setActiveMenu({
                              id: client.id,
                              top: rect.bottom + 4,
                              left: rect.right - 160,
                            });
                          }
                        }}
                      />

                      <ClientExpandableRow client={client} isExpanded={isExpanded} />
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 5. Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 py-1 text-xs text-zinc-400 font-mono">
              <span>
                Showing page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalCount} Clients)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-200 disabled:opacity-40 cursor-pointer hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-200 disabled:opacity-40 cursor-pointer hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Body Portal Dropdown Menu */}
      {activeMenu &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: activeMenu.top,
              left: activeMenu.left,
            }}
            className="z-[99999] w-40 py-1 rounded-sm bg-zinc-950 border border-zinc-800 shadow-2xl font-mono text-xs space-y-0.5 text-left"
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button
              onClick={() => {
                const targetId = activeMenu.id;
                setActiveMenu(null);
                navigate(`/app/clients/${targetId}`);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer"
            >
              <HugeiconsIcon icon={ViewIcon} size={14} />
              <span>View Profile</span>
            </button>
            <button
              onClick={() => {
                const clientObj = clients.find((c: any) => c.id === activeMenu.id);
                setActiveMenu(null);
                if (clientObj) {
                  setClientToEdit(clientObj);
                  setIsDrawerOpen(true);
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer"
            >
              <HugeiconsIcon icon={Edit01Icon} size={14} />
              <span>Edit Record</span>
            </button>

            <button
              onClick={() => {
                const clientObj = clients.find((c: any) => c.id === activeMenu.id);
                setActiveMenu(null);
                if (clientObj?.email) handleCopyText(clientObj.email);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer"
            >
              <HugeiconsIcon icon={Copy01Icon} size={14} />
              <span>Copy Email</span>
            </button>

            <button
              onClick={() => {
                const targetId = activeMenu.id;
                setActiveMenu(null);
                toggleRowExpand(targetId);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-cyan-400 hover:bg-zinc-900 cursor-pointer"
            >
              <HugeiconsIcon icon={Folder01Icon} size={14} />
              <span>Expand Row</span>
            </button>

            <div className="border-t border-zinc-900 my-0.5" />

            <button
              onClick={() => {
                const clientObj = clients.find((c: any) => c.id === activeMenu.id);
                setActiveMenu(null);
                if (clientObj) setClientToDelete(clientObj);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 cursor-pointer"
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} />
              <span>Delete Client</span>
            </button>
          </div>,
          document.body
        )}

      {/* Slide-over Form Drawer */}
      <ClientFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        clientToEdit={clientToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteClientDialog
        isOpen={Boolean(clientToDelete)}
        onClose={() => setClientToDelete(null)}
        client={clientToDelete}
      />
    </div>
  );
};

export default ClientsListPage;
