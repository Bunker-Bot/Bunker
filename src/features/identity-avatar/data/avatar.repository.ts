import { supabase } from '../../../lib/supabase/client';
import type { BunkerAvatarConfig, GuardianAvatarRecord } from '../types/avatar.types';
import { generateClientAvatarCode } from '../lib/avatar-code';
import { generateAvatarConfig } from '../lib/avatar-generator';

export class AvatarRepository {
  /**
   * Helper: Attaches project & client relations to guardian avatar records cleanly
   * without triggering PostgREST ambiguous embed errors.
   */
  private static async attachProjects(
    records: GuardianAvatarRecord[]
  ): Promise<GuardianAvatarRecord[]> {
    if (!records || records.length === 0) return [];

    const projectIds = records
      .map((r) => r.project_id)
      .filter((id): id is string => Boolean(id));

    if (projectIds.length === 0) return records;

    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          slug,
          status,
          color,
          client_id,
          client:clients (
            id,
            name,
            company
          )
        `)
        .in('id', projectIds);

      if (error || !projectsData) return records;

      const projectMap = new Map<string, any>();
      for (const p of projectsData) {
        projectMap.set(p.id, p);
      }

      return records.map((record) => {
        if (record.project_id && projectMap.has(record.project_id)) {
          return {
            ...record,
            project: projectMap.get(record.project_id),
          };
        }
        return record;
      });
    } catch {
      return records;
    }
  }

  /**
   * Fetches all Guardian Avatars with optional project relations.
   */
  static async getAvatars(): Promise<GuardianAvatarRecord[]> {
    try {
      const { data, error } = await supabase
        .from('guardian_avatars')
        .select(`
          id,
          avatar_code,
          name,
          avatar_config,
          generator_version,
          project_id,
          created_by,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[AvatarRepository] getAvatars query error:', error.message);
        return [];
      }

      const records = (data || []) as unknown as GuardianAvatarRecord[];
      return await this.attachProjects(records);
    } catch (err) {
      console.error('[AvatarRepository] Exception in getAvatars:', err);
      return [];
    }
  }

  /**
   * Fetches a single avatar by ID.
   */
  static async getAvatarById(id: string): Promise<GuardianAvatarRecord | null> {
    const { data, error } = await supabase
      .from('guardian_avatars')
      .select(`
        id,
        avatar_code,
        name,
        avatar_config,
        generator_version,
        project_id,
        created_by,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    const records = await this.attachProjects([(data as unknown) as GuardianAvatarRecord]);
    return records[0] || null;
  }

  /**
   * Fetches a single avatar by 10-digit Avatar Code.
   */
  static async getAvatarByCode(code: string): Promise<GuardianAvatarRecord | null> {
    const { data, error } = await supabase
      .from('guardian_avatars')
      .select(`
        id,
        avatar_code,
        name,
        avatar_config,
        generator_version,
        project_id,
        created_by,
        created_at,
        updated_at
      `)
      .eq('avatar_code', code)
      .single();

    if (error || !data) {
      return null;
    }

    const records = await this.attachProjects([(data as unknown) as GuardianAvatarRecord]);
    return records[0] || null;
  }

  /**
   * Creates a new Guardian Avatar with 10-digit code.
   */
  static async createAvatar(payload: {
    name: string;
    config: BunkerAvatarConfig;
    projectId?: string | null;
    avatarCode?: string;
  }): Promise<GuardianAvatarRecord> {
    let avatarCode = payload.avatarCode;

    // 1. Try DB RPC code generator first
    if (!avatarCode) {
      try {
        const { data: codeData } = await supabase.rpc('generate_guardian_avatar_code');
        if (codeData && typeof codeData === 'string') {
          avatarCode = codeData;
        }
      } catch {
        // Fallback to client-side 10-digit generator
      }
    }

    if (!avatarCode) {
      avatarCode = generateClientAvatarCode();
    }

    // Get current user id
    let userId: string | null = null;
    try {
      const { data: userData } = await supabase.auth.getUser();
      userId = userData?.user?.id || null;
    } catch {}

    const insertData = {
      avatar_code: avatarCode,
      name: payload.name || 'Bunker Guardian',
      avatar_config: payload.config,
      generator_version: payload.config.version || 1,
      project_id: payload.projectId || null,
      created_by: userId,
    };

    const { data, error } = await supabase
      .from('guardian_avatars')
      .insert(insertData)
      .select(`
        id,
        avatar_code,
        name,
        avatar_config,
        generator_version,
        project_id,
        created_by,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('[AvatarRepository] Failed to insert avatar:', error);
      throw error;
    }

    const createdRecord = (data as unknown) as GuardianAvatarRecord;

    // If assigned to a project, also update the project's guardian_avatar_id
    if (payload.projectId) {
      try {
        await supabase
          .from('projects')
          .update({
            guardian_avatar_id: createdRecord.id,
          })
          .eq('id', payload.projectId);
      } catch (projErr) {
        console.warn('[AvatarRepository] Warning updating project avatar id:', projErr);
      }
    }

    const records = await this.attachProjects([createdRecord]);
    return records[0];
  }

  /**
   * Updates an existing avatar's name or 3D appearance config.
   * Note: Never modifies avatar_code to preserve identity stability.
   */
  static async updateAvatar(
    id: string,
    updates: {
      name?: string;
      config?: BunkerAvatarConfig;
      generatorVersion?: number;
    }
  ): Promise<GuardianAvatarRecord> {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updatePayload.name = updates.name;
    if (updates.config !== undefined) updatePayload.avatar_config = updates.config;
    if (updates.generatorVersion !== undefined) updatePayload.generator_version = updates.generatorVersion;

    const { data, error } = await supabase
      .from('guardian_avatars')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        id,
        avatar_code,
        name,
        avatar_config,
        generator_version,
        project_id,
        created_by,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('[AvatarRepository] Failed to update avatar:', error);
      throw error;
    }

    const updatedRecord = (data as unknown) as GuardianAvatarRecord;

    const records = await this.attachProjects([updatedRecord]);
    return records[0];
  }

  /**
   * Assigns an avatar to a project.
   */
  static async assignToProject(avatarId: string, projectId: string): Promise<GuardianAvatarRecord> {
    // 1. Clear any existing avatar linked to this project
    await supabase
      .from('guardian_avatars')
      .update({ project_id: null })
      .eq('project_id', projectId);

    // 2. Assign this avatar to the project
    const { data, error } = await supabase
      .from('guardian_avatars')
      .update({
        project_id: projectId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', avatarId)
      .select(`
        id,
        avatar_code,
        name,
        avatar_config,
        generator_version,
        project_id,
        created_by,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('[AvatarRepository] Failed to assign avatar to project:', error);
      throw error;
    }

    // 3. Ensure project table references are in sync
    try {
      await supabase
        .from('projects')
        .update({
          guardian_avatar_id: avatarId,
        })
        .eq('id', projectId);
    } catch {}

    const records = await this.attachProjects([(data as unknown) as GuardianAvatarRecord]);
    return records[0];
  }

  /**
   * Unassigns an avatar from its current project.
   */
  static async unassign(avatarId: string, currentProjectId?: string | null): Promise<GuardianAvatarRecord> {
    const { data, error } = await supabase
      .from('guardian_avatars')
      .update({
        project_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', avatarId)
      .select(`
        id,
        avatar_code,
        name,
        avatar_config,
        generator_version,
        project_id,
        created_by,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('[AvatarRepository] Failed to unassign avatar:', error);
      throw error;
    }

    if (currentProjectId) {
      try {
        await supabase
          .from('projects')
          .update({
            guardian_avatar_id: null,
            avatar_code: null,
          })
          .eq('id', currentProjectId);
      } catch {}
    }

    return (data as unknown) as GuardianAvatarRecord;
  }

  /**
   * Deletes an avatar record.
   */
  static async deleteAvatar(avatarId: string): Promise<void> {
    const { error } = await supabase
      .from('guardian_avatars')
      .delete()
      .eq('id', avatarId);

    if (error) {
      console.error('[AvatarRepository] Failed to delete avatar:', error);
      throw error;
    }
  }

  /**
   * Automatically initializes deterministic avatars for existing projects if studio is empty.
   */
  static async autoSeedProjectAvatars(): Promise<GuardianAvatarRecord[]> {
    try {
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, slug, color, client_id')
        .limit(25);

      if (!projects || projects.length === 0) return [];

      const createdList: GuardianAvatarRecord[] = [];

      for (const p of projects) {
        try {
          const config = generateAvatarConfig({
            entityId: p.id,
            entityKind: 'project',
            name: p.name,
            parentEntityId: p.client_id || undefined,
            preferredColor: p.color || undefined,
          });

          const created = await this.createAvatar({
            name: `${p.name} Guardian`,
            config,
            projectId: p.id,
          });

          createdList.push(created);
        } catch (itemErr) {
          console.warn('[AvatarRepository] Skipped seeding project:', p.name, itemErr);
        }
      }

      return createdList;
    } catch (err) {
      console.warn('[AvatarRepository] Auto-seed halted:', err);
      return [];
    }
  }
}
