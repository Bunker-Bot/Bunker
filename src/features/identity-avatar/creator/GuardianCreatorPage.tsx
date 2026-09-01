import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase/client';
import {
  useGuardianAvatars,
  useCreateGuardianAvatar,
  useUpdateGuardianAvatar,
} from '../data/avatar.queries';
import { useGuardianEditorStore } from './state/useGuardianEditorStore';
import { GuardianTopBar } from './GuardianTopBar';
import { GuardianToolRail } from './GuardianToolRail';
import { GuardianViewport } from './GuardianViewport';
import { GuardianInspector } from './GuardianInspector';

export const GuardianCreatorPage: React.FC = () => {
  const { avatarId, avatarCode: routeCode, teamId: routeTeamId } = useParams<{
    avatarId?: string;
    avatarCode?: string;
    teamId?: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const createMutation = useCreateGuardianAvatar();
  const updateMutation = useUpdateGuardianAvatar();
  const { data: avatars = [], isLoading: isAvatarsLoading } = useGuardianAvatars();

  const [isSaving, setIsSaving] = useState(false);

  const {
    mode,
    name,
    projectId,
    draftConfig,
    isDirty,
    initialize,
    markSaved,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useGuardianEditorStore();

  const queryProject = searchParams.get('project');
  const teamId = routeTeamId || searchParams.get('team');

  // Fetch target project if queryProject is present
  const { data: defaultProject } = useQuery({
    queryKey: ['creator-default-project', queryProject],
    queryFn: async () => {
      if (!queryProject) return null;
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, slug, color, clients ( id, name, company )')
        .eq('id', queryProject)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!queryProject,
  });

  // Fetch target team if teamId is present
  const { data: defaultTeam } = useQuery({
    queryKey: ['creator-default-team', teamId],
    queryFn: async () => {
      if (!teamId) return null;
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!teamId,
  });

  // Initialize Store on mount / route change
  useEffect(() => {
    if (isAvatarsLoading) return;

    const targetId = avatarId || (routeCode ? avatars.find((a) => a.avatarCode === routeCode.replace(/^#/, ''))?.id : undefined);

    if (targetId) {
      const match = avatars.find((a) => a.id === targetId || a.avatarCode === targetId);
      if (match) {
        initialize({ avatar: match, mode: 'edit' });
        return;
      }
    }

    if (defaultTeam) {
      if (defaultTeam.avatar_config) {
        initialize({
          avatar: {
            id: defaultTeam.guardian_avatar_id || defaultTeam.id,
            avatarCode: defaultTeam.avatar_code || '0000000000',
            name: `${defaultTeam.name} Guardian`,
            config: defaultTeam.avatar_config,
            generatorVersion: defaultTeam.avatar_version || 1,
            projectId: null,
            isAssigned: true,
            createdAt: defaultTeam.created_at,
            updatedAt: defaultTeam.updated_at,
          },
          mode: 'edit',
        });
      } else {
        initialize({ mode: 'create' });
      }
      return;
    }

    if (defaultProject) {
      initialize({ defaultProject, mode: 'create' });
      return;
    }

    initialize({ mode: 'create' });
  }, [avatarId, routeCode, avatars, defaultProject, defaultTeam, isAvatarsLoading]);

  // Global Keyboard Shortcuts (Cmd/Ctrl + S, Cmd/Ctrl + Z, Cmd/Ctrl + Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      if (cmdKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      } else if (cmdKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo()) redo();
        } else {
          if (canUndo()) undo();
        }
      } else if (cmdKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo()) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [draftConfig, name, projectId, isDirty, canUndo, canRedo]);

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (teamId) {
        // Save directly to Team entity
        await supabase
          .from('teams')
          .update({
            avatar_config: draftConfig,
            primary_color: draftConfig.primaryColor,
            secondary_color: draftConfig.secondaryColor,
            accent_color: draftConfig.accentColor,
            updated_at: new Date().toISOString(),
          })
          .eq('id', teamId);

        markSaved(draftConfig);
        navigate(`/app/teams/${teamId}/identity`);
        return;
      }

      if (mode === 'edit' && avatarId) {
        const updated = await updateMutation.mutateAsync({
          id: avatarId,
          updates: {
            name: name.trim() || 'Guardian Identity',
            config: draftConfig,
          },
        });
        markSaved(updated.config);
      } else {
        const created = await createMutation.mutateAsync({
          name: name.trim() || 'New Guardian Identity',
          config: draftConfig,
          projectId: projectId || null,
        });
        markSaved(created.config);
        navigate(`/app/avatar-studio/${created.id}/edit`, { replace: true });
      }
    } catch (err) {
      console.error('Failed to save Guardian:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Save as New Identity handler
  const handleSaveAsNew = async () => {
    setIsSaving(true);
    try {
      const created = await createMutation.mutateAsync({
        name: `${name} (Copy)`.trim(),
        config: draftConfig,
        projectId: null,
      });
      markSaved(created.config);
      navigate(`/app/avatar-studio/${created.id}/edit`, { replace: true });
    } catch (err) {
      console.error('Failed to create new Guardian copy:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-zinc-950 text-white font-mono select-none overflow-hidden">
      {/* 1. Global Workspace Top Bar */}
      <GuardianTopBar
        onSave={handleSave}
        isSaving={isSaving}
        onSaveAsNew={mode === 'edit' ? handleSaveAsNew : undefined}
      />

      {/* 2. Responsive 3-Zone Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Zone A: Tool Rail (Horizontal scroll on mobile, vertical sidebar on desktop) */}
        <GuardianToolRail />

        {/* Zone B: Live 3D Viewport Stage */}
        <div className="flex-1 lg:flex-1 h-[42vh] min-h-[220px] max-h-[460px] lg:h-auto lg:max-h-none flex flex-col min-w-0 bg-zinc-950">
          <GuardianViewport />
        </div>

        {/* Zone C: Context Inspector */}
        <div className="flex-1 lg:flex-none lg:w-96 min-h-0 overflow-hidden flex flex-col border-t lg:border-t-0 lg:border-l border-zinc-850 bg-zinc-950">
          <GuardianInspector />
        </div>
      </div>
    </div>
  );
};

export default GuardianCreatorPage;
