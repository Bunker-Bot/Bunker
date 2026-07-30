import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  MoreVerticalIcon,
  UserGroupIcon,
  Calendar01Icon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';
import { getTechnologyIcon } from '../../../lib/constants/technology-icons';
import type { ProjectDTO } from '../../../lib/services/project.service';

interface ProjectDashboardCardProps {
  project: ProjectDTO;
  onOpenMenu: (project: ProjectDTO, event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ProjectDashboardCard: React.FC<ProjectDashboardCardProps> = ({
  project,
  onOpenMenu,
}) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Render Colorful Shadcn/UI Status Badge
  const renderStatusBadge = (statusStr: string) => {
    const s = statusStr.toLowerCase();
    if (s === 'completed') {
      return (
        <Badge variant="outline" className="rounded-sm bg-blue-950/90 border-blue-700/80 text-blue-300 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
          Completed
        </Badge>
      );
    }
    if (s === 'in_progress' || s === 'in progress') {
      return (
        <Badge variant="outline" className="rounded-sm bg-cyan-950/90 border-cyan-700/80 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          In Progress
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="rounded-sm bg-emerald-950/90 border-emerald-700/80 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {statusStr.replace('_', ' ')}
      </Badge>
    );
  };

  // Render Colorful Shadcn/UI Priority Badge
  const renderPriorityBadge = (priorityStr: string) => {
    const p = priorityStr.toLowerCase();
    if (p === 'urgent') {
      return (
        <Badge variant="outline" className="rounded-sm bg-rose-950/90 border-rose-700/80 text-rose-300 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
          Urgent
        </Badge>
      );
    }
    if (p === 'high') {
      return (
        <Badge variant="outline" className="rounded-sm bg-amber-950/90 border-amber-700/80 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
          High
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="rounded-sm bg-amber-950/60 border-amber-800/60 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
        {priorityStr}
      </Badge>
    );
  };

  const technologies = project.technologies || [];

  return (
    <motion.div
      onClick={() => navigate(`/app/projects/${project.slug}`)}
      className="group relative flex flex-col justify-between p-4.5 rounded-sm bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer select-none space-y-4 font-mono overflow-hidden"
    >
      {/* Subtle Accent Glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none"
        style={{ backgroundColor: project.color || '#3B82F6' }}
      />

      <div className="space-y-3 relative z-10">
        {/* Top Header Row: Project Brand Avatar + Title + Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Color Avatar */}
            <div
              className="w-9 h-9 rounded-sm flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md ring-1 ring-white/10"
              style={{ backgroundColor: project.color || '#27272A' }}
            >
              {getInitials(project.name)}
            </div>

            <div className="min-w-0 space-y-0.5">
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight truncate leading-snug">
                {project.name}
              </h3>
              
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate font-sans">
                <HugeiconsIcon icon={UserGroupIcon} size={13} className="text-zinc-500 shrink-0" />
                <span className="truncate">{project.clientName}</span>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenMenu(project, e);
            }}
            className="p-1 rounded-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
          </button>
        </div>

        {/* Short Description */}
        {project.description && (
          <p className="text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Badges Strip: Status + Priority + Relative Deadline */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          {renderStatusBadge(project.status)}
          {renderPriorityBadge(project.priority)}

          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono rounded-sm bg-zinc-950 text-zinc-400 border border-zinc-800">
            <HugeiconsIcon icon={Calendar01Icon} size={11} className="text-zinc-500" />
            <span className={project.isOverdue ? 'text-rose-400 font-bold' : ''}>
              {project.relativeDeadline}
            </span>
          </span>
        </div>

        {/* Progress Bar Section */}
        <div className="space-y-1 pt-1 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 text-[11px]">Completion</span>
            <span className="font-bold text-cyan-400 font-mono text-xs">{project.completionPercent}%</span>
          </div>
          <div className="w-full h-1.5 rounded-sm bg-zinc-950 overflow-hidden border border-zinc-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.completionPercent}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-500 rounded-sm shadow-sm"
            />
          </div>
        </div>

        {/* Technology Logos Stack */}
        {technologies.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {technologies.slice(0, 5).map((tech: string) => (
              <div
                key={tech}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-zinc-950 border border-zinc-800 text-[10px] font-bold text-zinc-200 shadow-sm"
              >
                <img
                  src={getTechnologyIcon(tech)}
                  alt={tech}
                  className="w-3.5 h-3.5 object-contain shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="capitalize">{tech}</span>
              </div>
            ))}
            {technologies.length > 5 && (
              <span className="px-1.5 py-0.5 rounded-sm bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 font-bold">
                +{technologies.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500 relative z-10">
        <span className="truncate">Updated {project.formattedUpdatedAt}</span>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/app/projects/${project.slug}`);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700 text-zinc-200 group-hover:text-white font-bold text-[11px] transition-all cursor-pointer shadow-sm"
        >
          <span>View Workspace</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
