import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import {
  useGuardianAvatars,
  useDuplicateGuardianAvatar,
  useResetGuardianAvatar,
  useDeleteGuardianAvatar,
} from '../data/avatar.queries';
import { AvatarStudioShell } from './AvatarStudioShell';
import { AvatarStudioHeader } from './AvatarStudioHeader';
import { AvatarLibrary } from './AvatarLibrary';
import { AvatarInspector } from './AvatarInspector';
import { AvatarAssignmentModal } from './AvatarAssignmentModal';
import { AvatarRegenerateModal } from './AvatarRegenerateModal';
import type {
  GuardianAvatarDTO,
  AvatarStudioFilter,
  AvatarStudioViewMode,
} from '../types/avatar.types';

export const AvatarStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams<{ avatarCode?: string }>();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AvatarStudioFilter>('all');
  const [viewMode, setViewMode] = useState<AvatarStudioViewMode>('grid');

  const { data: avatars = [], isLoading, isError, refetch } = useGuardianAvatars({
    search,
    filter,
  });

  const duplicateMutation = useDuplicateGuardianAvatar();
  const resetMutation = useResetGuardianAvatar();
  const deleteMutation = useDeleteGuardianAvatar();

  // Selected Avatar state
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [modalTargetAvatar, setModalTargetAvatar] = useState<GuardianAvatarDTO | null>(null);

  const isInitialSyncRef = React.useRef(false);

  // Deep-linking from query params or route params (?avatar=..., ?project=..., /avatar-studio/:avatarCode)
  useEffect(() => {
    if (avatars.length === 0) return;

    const queryAvatar = searchParams.get('avatar');
    const queryProject = searchParams.get('project');
    const routeCode = params.avatarCode;

    if (!isInitialSyncRef.current) {
      isInitialSyncRef.current = true;

      if (routeCode) {
        const match = avatars.find((a) => a.avatarCode === routeCode.replace(/^#/, ''));
        if (match) {
          setSelectedAvatarId(match.id);
          return;
        }
      }

      if (queryAvatar) {
        const match = avatars.find((a) => a.id === queryAvatar || a.avatarCode === queryAvatar.replace(/^#/, ''));
        if (match) {
          setSelectedAvatarId(match.id);
          return;
        }
      }

      if (queryProject) {
        const match = avatars.find((a) => a.projectId === queryProject);
        if (match) {
          setSelectedAvatarId(match.id);
          return;
        }
      }

      // Default select first avatar on initial load
      if (!selectedAvatarId && avatars.length > 0) {
        setSelectedAvatarId(avatars[0].id);
      }
    }
  }, [avatars, searchParams, params.avatarCode]);

  const selectedAvatar = useMemo(() => {
    return avatars.find((a) => a.id === selectedAvatarId) || avatars[0] || null;
  }, [avatars, selectedAvatarId]);

  const totalCount = avatars.length;
  const assignedCount = avatars.filter((a) => a.isAssigned).length;
  const unassignedCount = totalCount - assignedCount;

  // Action handlers
  const handleSelectAvatar = (avatar: GuardianAvatarDTO) => {
    setSelectedAvatarId(avatar.id);
    setSearchParams({ avatar: avatar.avatarCode });
  };

  const handleOpenAssign = (avatar: GuardianAvatarDTO) => {
    setModalTargetAvatar(avatar);
    setIsAssignModalOpen(true);
  };

  const handleOpenRegenerate = (avatar: GuardianAvatarDTO) => {
    setModalTargetAvatar(avatar);
    setIsRegenerateModalOpen(true);
  };

  const handleDuplicate = async (avatar: GuardianAvatarDTO) => {
    try {
      const created = await duplicateMutation.mutateAsync(avatar);
      setSelectedAvatarId(created.id);
    } catch (err) {
      console.error('Failed to duplicate avatar:', err);
    }
  };

  const handleReset = async (avatar: GuardianAvatarDTO) => {
    if (window.confirm(`Restore ${avatar.name} to its default deterministic base appearance?`)) {
      try {
        await resetMutation.mutateAsync(avatar);
      } catch (err) {
        console.error('Failed to reset avatar:', err);
      }
    }
  };

  const handleDelete = async (avatar: GuardianAvatarDTO) => {
    let confirmMsg = `Are you sure you want to delete ${avatar.name} (#${avatar.avatarCode})?`;
    if (avatar.isAssigned) {
      confirmMsg = `This Guardian is currently assigned to ${avatar.projectName || 'a project'}. Deleting will unbind the project identity. Proceed?`;
    }
    if (window.confirm(confirmMsg)) {
      try {
        await deleteMutation.mutateAsync(avatar.id);
        if (selectedAvatarId === avatar.id) {
          setSelectedAvatarId(null);
        }
      } catch (err) {
        console.error('Failed to delete avatar:', err);
      }
    }
  };

  return (
    <AvatarStudioShell activeTab="library">
      <div className="w-full space-y-6 font-mono text-xs select-none">
        {/* 1. Header with Search & Filter Controls */}
        <AvatarStudioHeader
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={totalCount}
          assignedCount={assignedCount}
          unassignedCount={unassignedCount}
          onOpenCreate={() => navigate('/app/avatar-studio/create')}
        />

        {/* 2. Error State */}
        {isError && (
          <div className="p-4 rounded-sm bg-rose-950/40 border border-rose-800 text-rose-200 flex items-center justify-between">
            <span>We couldn't load the Guardian Avatars library.</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="underline font-bold cursor-pointer hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* 3. Responsive Master-Detail Layout (65% Library / 35% Inspector) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Library Grid (65% on Desktop) */}
          <div className="xl:col-span-7 space-y-4">
            <AvatarLibrary
              avatars={avatars}
              selectedAvatarId={selectedAvatar?.id || null}
              viewMode={viewMode}
              isLoading={isLoading}
              onSelect={handleSelectAvatar}
              onOpenAssign={handleOpenAssign}
              onOpenRegenerate={handleOpenRegenerate}
              onDuplicate={handleDuplicate}
              onReset={handleReset}
              onDelete={handleDelete}
              onOpenCreate={() => navigate('/app/avatar-studio/create')}
            />
          </div>

          {/* Right Inspector Panel (35% on Desktop) */}
          <div className="xl:col-span-5 sticky top-20">
            <AvatarInspector
              avatar={selectedAvatar}
              onOpenAssign={handleOpenAssign}
              onOpenRegenerate={handleOpenRegenerate}
              onDuplicate={handleDuplicate}
              onReset={handleReset}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* 4. Modals */}
        {modalTargetAvatar && (
          <>
            <AvatarAssignmentModal
              avatar={modalTargetAvatar}
              isOpen={isAssignModalOpen}
              onClose={() => {
                setIsAssignModalOpen(false);
                setModalTargetAvatar(null);
              }}
            />

            <AvatarRegenerateModal
              avatar={modalTargetAvatar}
              isOpen={isRegenerateModalOpen}
              onClose={() => {
                setIsRegenerateModalOpen(false);
                setModalTargetAvatar(null);
              }}
              onApplyNewConfig={() => {
                refetch();
              }}
            />
          </>
        )}
      </div>
    </AvatarStudioShell>
  );
};

export default AvatarStudioPage;
