import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  useInfiniteTimeline,
  useDeleteTimelineUpdate
} from '../../lib/supabase/queries/timeline';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { UpdateComposer } from './update-composer';
import { AttachmentPreviewModal } from './attachment-preview-modal';
import type { TimelineAttachment } from './attachment-preview-modal';
import { MarkdownPreview } from '../projects/components/MarkdownPreview';
import { Select } from '../../../packages/ui/src/components/select';
import { RadialSpinner } from '../../components/ui/RadialSpinner';
import { Badge } from '../../components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Calendar01Icon,
  Search01Icon,
  PlusSignIcon,
  Clock01Icon,
  Edit01Icon,
  Delete02Icon,
  File01Icon,
  Image01Icon,
  LegalDocumentIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  RocketIcon,
  FlashIcon,
  Target01Icon,
  GithubIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Tag01Icon
} from '@hugeicons/core-free-icons';

export interface TimelineTabProps {
  projectId: string;
  isAdmin?: boolean;
  className?: string;
}

interface UpdateItem {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  entry_date: string;
  attachments?: TimelineAttachment[];
  created_by?: string;
  created_at: string;
}

const CATEGORY_OPTIONS = [
  { label: 'All Updates', value: 'all' },
  { label: 'Features & Releases', value: 'feature' },
  { label: 'Bug Fixes', value: 'fix' },
  { label: 'Deployments', value: 'deploy' },
  { label: 'Milestones', value: 'milestone' },
  { label: 'Documents & Specs', value: 'doc' },
];

export const TimelineTab: React.FC<TimelineTabProps> = ({
  projectId,
  isAdmin = true,
  className = '',
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFrom] = useState<string | null>(null);
  const [dateTo] = useState<string | null>(null);

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [previewAttachment, setPreviewAttachment] = useState<TimelineAttachment | null>(null);

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [updateToEdit, setUpdateToEdit] = useState<UpdateItem | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);

  // 300ms search debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Infinite Query for Progressive Timeline Pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteTimeline(projectId, debouncedSearch, selectedCategory, dateFrom, dateTo);

  const deleteMutation = useDeleteTimelineUpdate();

  // Realtime subscription for project_updates
  useRealtimeSubscription({
    table: 'project_updates',
    filter: `project_id=eq.${projectId}`,
    queryKeyToInvalidate: ['timeline', 'project', projectId],
  });

  // IntersectionObserver for Infinite Scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.2 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten paginated items
  const allUpdates: UpdateItem[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items as UpdateItem[]);
  }, [data]);

  const totalCount = data?.pages[0]?.totalCount || allUpdates.length;

  // Group Updates Chronologically (Today, Yesterday, Last 7 Days, Last 30 Days, Older)
  const groupedUpdates = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const groups: {
      today: UpdateItem[];
      yesterday: UpdateItem[];
      last7Days: UpdateItem[];
      last30Days: UpdateItem[];
      older: UpdateItem[];
    } = {
      today: [],
      yesterday: [],
      last7Days: [],
      last30Days: [],
      older: [],
    };

    allUpdates.forEach((item) => {
      const entryDate = item.entry_date;
      const dateObj = new Date(entryDate);

      if (entryDate === todayStr) {
        groups.today.push(item);
      } else if (entryDate === yesterdayStr) {
        groups.yesterday.push(item);
      } else if (dateObj >= sevenDaysAgo) {
        groups.last7Days.push(item);
      } else if (dateObj >= thirtyDaysAgo) {
        groups.last30Days.push(item);
      } else {
        groups.older.push(item);
      }
    });

    return [
      { title: "Today's Updates", items: groups.today },
      { title: 'Yesterday', items: groups.yesterday },
      { title: 'Last 7 Days', items: groups.last7Days },
      { title: 'Last 30 Days', items: groups.last30Days },
      { title: 'Older History', items: groups.older },
    ].filter((g) => g.items.length > 0);
  }, [allUpdates]);

  const getSmartIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('fix') || lower.includes('bug')) {
      return { icon: AlertCircleIcon, color: 'text-rose-400', bg: 'bg-rose-950/80 border-rose-800/80' };
    }
    if (lower.includes('release') || lower.includes('launch') || lower.includes('v1.') || lower.includes('v2.')) {
      return { icon: RocketIcon, color: 'text-emerald-400', bg: 'bg-emerald-950/80 border-emerald-800/80' };
    }
    if (lower.includes('deploy') || lower.includes('ci') || lower.includes('cd')) {
      return { icon: FlashIcon, color: 'text-cyan-400', bg: 'bg-cyan-950/80 border-cyan-800/80' };
    }
    if (lower.includes('milestone') || lower.includes('roadmap') || lower.includes('goal')) {
      return { icon: Target01Icon, color: 'text-amber-400', bg: 'bg-amber-950/80 border-amber-800/80' };
    }
    if (lower.includes('doc') || lower.includes('pdf') || lower.includes('spec') || lower.includes('readme')) {
      return { icon: LegalDocumentIcon, color: 'text-purple-400', bg: 'bg-purple-950/80 border-purple-800/80' };
    }
    if (lower.includes('github') || lower.includes('git') || lower.includes('repo') || lower.includes('commit')) {
      return { icon: GithubIcon, color: 'text-indigo-400', bg: 'bg-indigo-950/80 border-indigo-800/80' };
    }
    if (lower.includes('image') || lower.includes('design') || lower.includes('screenshot') || lower.includes('ui')) {
      return { icon: Image01Icon, color: 'text-blue-400', bg: 'bg-blue-950/80 border-blue-800/80' };
    }
    return { icon: CheckmarkCircle02Icon, color: 'text-zinc-200', bg: 'bg-zinc-800 border-zinc-700' };
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    return `${Math.floor(diffSecs / 86400)}d ago`;
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (update: UpdateItem) => {
    setUpdateToEdit(update);
    setIsComposerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this timeline update entry?')) {
      await deleteMutation.mutateAsync({ id, projectId });
    }
  };

  const latestUpdate = allUpdates[0];

  return (
    <div className={`space-y-6 font-mono select-none text-zinc-100 ${className}`}>
      {/* 1. Header Control Panel */}
      <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900 border border-zinc-800 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between gap-2.5 border-b border-zinc-800/80 pb-3.5 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shrink-0 shadow-inner">
              <HugeiconsIcon icon={Calendar01Icon} size={18} className="sm:hidden" />
              <HugeiconsIcon icon={Calendar01Icon} size={20} className="hidden sm:block" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  Project Timeline<span className="hidden sm:inline"> & Activity Journal</span>
                </h2>
                <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0.5 shrink-0 font-mono">
                  {totalCount} <span className="hidden xs:inline">Updates</span>
                </Badge>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 truncate hidden xs:block">
                {latestUpdate
                  ? `Latest activity published ${formatRelativeTime(latestUpdate.created_at || latestUpdate.entry_date)}`
                  : 'Chronological development log'}
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setUpdateToEdit(null);
                setIsComposerOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-sm shrink-0 whitespace-nowrap transition-colors"
              title="Add Update"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={15} />
              <span>Add<span className="hidden sm:inline"> Update</span></span>
            </button>
          )}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="relative sm:col-span-2">
            <HugeiconsIcon icon={Search01Icon} size={14} className="absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search updates by title or description..."
              className="w-full pl-9 pr-3 py-2 rounded-sm bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs outline-none focus:border-zinc-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={CATEGORY_OPTIONS}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 2. Professional Timeline Feed */}
      {isLoading ? (
        <div className="space-y-6 pl-6 border-l border-zinc-800/80 ml-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-sm bg-zinc-900 border border-zinc-800 space-y-2 animate-pulse">
              <div className="h-4 w-48 bg-zinc-800 rounded" />
              <div className="h-12 w-full bg-zinc-950/60 rounded" />
            </div>
          ))}
        </div>
      ) : groupedUpdates.length > 0 ? (
        <div className="space-y-8 pt-1">
          {groupedUpdates.map((group) => (
            <div key={group.title} className="space-y-6">
              {/* Flush Opaque Sticky Group Header — -top-4 sm:-top-6 offsets <main>'s p-4 sm:p-6 padding to stick 100% flush under the top Header */}
              <div className="sticky -top-4 sm:-top-6 z-20 py-2.5 mb-4 bg-zinc-950/95 border-b border-zinc-800/90 shadow-2xl flex items-center justify-between gap-3 px-4 sm:px-6 -mx-4 sm:-mx-6 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-sm bg-zinc-900 border border-zinc-800 text-[10.5px] uppercase font-bold text-zinc-200 tracking-wider shadow-sm flex items-center gap-1.5 shrink-0">
                    <HugeiconsIcon icon={Tag01Icon} size={12} className="text-zinc-400" />
                    <span>{group.title}</span>
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                    ({group.items.length} {group.items.length === 1 ? 'entry' : 'entries'})
                  </span>
                </div>
                <div className="flex-1 h-px bg-zinc-800/80 mx-2" />
              </div>

              {/* Group Timeline Items Container with Vertical Guide Line */}
              <div className="relative pl-7 sm:pl-9 space-y-8 border-l border-zinc-800/90 ml-3 sm:ml-4 pt-1">
                {group.items.map((item) => {
                  const { icon: NodeIcon, color, bg } = getSmartIcon(item.title);
                  const isExpanded = expandedItems[item.id] || false;
                  const hasLongDesc = (item.description || '').length > 250;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative"
                    >
                      {/* Precise Centered Node Point */}
                      <div
                        className={`absolute -left-[42px] sm:-left-[50px] top-3.5 w-7 h-7 rounded-full border-2 border-zinc-950 flex items-center justify-center ${bg} shadow-lg shrink-0 z-10`}
                      >
                        <HugeiconsIcon icon={NodeIcon} size={13} className={color} />
                      </div>

                      {/* Timeline Entry Card */}
                      <div className="p-4 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700/90 transition-all duration-200 space-y-3.5 shadow-md">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 flex-wrap">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-zinc-300 font-mono">
                                <HugeiconsIcon icon={Calendar01Icon} size={11} className="text-zinc-500" />
                                <span>{item.entry_date}</span>
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-zinc-400 font-mono" title={new Date(item.created_at).toLocaleString()}>
                                <HugeiconsIcon icon={Clock01Icon} size={11} className="text-zinc-500" />
                                <span>{formatRelativeTime(item.created_at)}</span>
                              </span>
                            </div>
                          </div>

                          {isAdmin && (
                            <div className="flex items-center gap-1 shrink-0 bg-zinc-950/60 p-1 rounded border border-zinc-800/80">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
                                title="Edit update"
                              >
                                <HugeiconsIcon icon={Edit01Icon} size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 cursor-pointer transition-colors"
                                title="Delete update"
                              >
                                <HugeiconsIcon icon={Delete02Icon} size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Description — Rendered with MarkdownPreview */}
                        {item.description && (
                          <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                            <div className={!isExpanded && hasLongDesc ? 'max-h-36 overflow-hidden relative' : ''}>
                              <MarkdownPreview content={item.description} />
                              {!isExpanded && hasLongDesc && (
                                <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-zinc-900 to-transparent pointer-events-none" />
                              )}
                            </div>
                            {hasLongDesc && (
                              <button
                                onClick={() => toggleExpand(item.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-white cursor-pointer mt-1"
                              >
                                <span>{isExpanded ? 'Show Less' : 'Read Full Update'}</span>
                                <HugeiconsIcon icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon} size={12} />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Attachments Section */}
                        {item.attachments && item.attachments.length > 0 && (
                          <div className="pt-2.5 border-t border-zinc-800/60 space-y-2">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                              Attachments ({item.attachments.length})
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {item.attachments.map((att, idx) => {
                                const isImg = att.type?.startsWith('image/') ||
                                  /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(att.name) ||
                                  /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(att.url);

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setPreviewAttachment(att)}
                                    className="px-2.5 py-1.5 rounded-sm bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700 text-xs flex items-center gap-1.5 cursor-pointer text-zinc-200 hover:text-white transition-colors"
                                  >
                                    <HugeiconsIcon icon={isImg ? Image01Icon : File01Icon} size={13} className="text-zinc-400 shrink-0" />
                                    <span className="truncate max-w-[140px] font-semibold">{att.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Sentinel element for infinite scrolling trigger */}
          <div ref={observerTarget} className="h-6 flex items-center justify-center">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <RadialSpinner size={14} />
                <span>Loading older timeline entries...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-sm bg-zinc-900 border border-zinc-800 text-center space-y-3 font-mono text-xs">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
            <HugeiconsIcon icon={Calendar01Icon} size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No Project Updates Recorded</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {debouncedSearch || selectedCategory !== 'all'
                ? 'No timeline entries match the selected filter query.'
                : 'Project updates published by the team will appear here in chronological order.'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setUpdateToEdit(null);
                setIsComposerOpen(true);
              }}
              className="px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer"
            >
              Create First Update
            </button>
          )}
        </div>
      )}

      {/* Rich Markdown Update Composer Modal */}
      <UpdateComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        projectId={projectId}
        updateToEdit={updateToEdit}
      />

      {/* Attachment Lightbox Modal */}
      <AttachmentPreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </div>
  );
};

export default TimelineTab;
