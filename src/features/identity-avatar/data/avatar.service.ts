import { AvatarRepository } from './avatar.repository';
import type {
  BunkerAvatarConfig,
  GuardianAvatarDTO,
  GuardianAvatarRecord,
  AvatarStudioFilter,
} from '../types/avatar.types';
import { cleanAvatarCode } from '../lib/avatar-code';
import { generateAvatarConfig, AVATAR_GENERATOR_VERSION } from '../lib/avatar-generator';

export class AvatarService {
  /**
   * Formats raw DB record to client DTO.
   */
  static formatDTO(record: GuardianAvatarRecord): GuardianAvatarDTO {
    return {
      id: record.id,
      avatarCode: record.avatar_code,
      name: record.name,
      config: record.avatar_config,
      generatorVersion: record.generator_version || 1,
      projectId: record.project_id || null,
      projectName: record.project?.name || null,
      projectSlug: record.project?.slug || null,
      projectStatus: record.project?.status || null,
      projectColor: record.project?.color || null,
      clientName: record.project?.client?.name || record.project?.client?.company || null,
      isAssigned: Boolean(record.project_id),
      createdAt: new Date(record.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      updatedAt: new Date(record.updated_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  }

  /**
   * Lists all avatars with optional filtering and search.
   */
  static async listAvatars(options?: {
    search?: string;
    filter?: AvatarStudioFilter;
  }): Promise<GuardianAvatarDTO[]> {
    let records = await AvatarRepository.getAvatars();

    // Auto-seed from existing projects if database has 0 avatars
    if (records.length === 0) {
      records = await AvatarRepository.autoSeedProjectAvatars();
    }

    let dtos = records.map((r) => this.formatDTO(r));

    // Filter by Assignment Status
    if (options?.filter && options.filter !== 'all') {
      if (options.filter === 'assigned') {
        dtos = dtos.filter((d) => d.isAssigned);
      } else if (options.filter === 'unassigned') {
        dtos = dtos.filter((d) => !d.isAssigned);
      } else if (options.filter === 'projects') {
        dtos = dtos.filter((d) => d.config.archetype !== 'operator');
      } else if (options.filter === 'clients') {
        dtos = dtos.filter((d) => d.clientName);
      }
    }

    // Search by Name, 10-digit Code, Project, Client
    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      const cleanCode = cleanAvatarCode(q);

      dtos = dtos.filter((d) => {
        return (
          d.name.toLowerCase().includes(q) ||
          d.avatarCode.includes(cleanCode) ||
          (d.projectName && d.projectName.toLowerCase().includes(q)) ||
          (d.clientName && d.clientName.toLowerCase().includes(q)) ||
          d.config.material.toLowerCase().includes(q) ||
          d.config.archetype.toLowerCase().includes(q)
        );
      });
    }

    return dtos;
  }

  /**
   * Retrieves an avatar by ID or 10-digit code.
   */
  static async getAvatar(idOrCode: string): Promise<GuardianAvatarDTO | null> {
    const clean = cleanAvatarCode(idOrCode);
    let record: GuardianAvatarRecord | null = null;

    if (/^[0-9]{10}$/.test(clean)) {
      record = await AvatarRepository.getAvatarByCode(clean);
    } else {
      record = await AvatarRepository.getAvatarById(idOrCode);
    }

    return record ? this.formatDTO(record) : null;
  }

  /**
   * Creates a new avatar record with 10-digit code.
   */
  static async createAvatar(payload: {
    name: string;
    config?: BunkerAvatarConfig;
    projectId?: string | null;
  }): Promise<GuardianAvatarDTO> {
    const config =
      payload.config ||
      generateAvatarConfig({
        entityId: `custom-${Date.now()}`,
        entityKind: 'project',
        name: payload.name,
      });

    const record = await AvatarRepository.createAvatar({
      name: payload.name,
      config,
      projectId: payload.projectId,
    });

    return this.formatDTO(record);
  }

  /**
   * Updates an avatar's name or 3D appearance config (preserves 10-digit Avatar Code).
   */
  static async updateAvatar(
    id: string,
    updates: {
      name?: string;
      config?: BunkerAvatarConfig;
    }
  ): Promise<GuardianAvatarDTO> {
    const record = await AvatarRepository.updateAvatar(id, {
      name: updates.name,
      config: updates.config,
      generatorVersion: updates.config?.version || AVATAR_GENERATOR_VERSION,
    });

    return this.formatDTO(record);
  }

  /**
   * Generates a new candidate appearance for regeneration comparison while preserving Avatar Code.
   */
  static generateRegenerationCandidate(current: GuardianAvatarDTO): BunkerAvatarConfig {
    return generateAvatarConfig({
      entityId: current.id,
      entityKind: 'project',
      name: current.name,
      salt: `regen-${Date.now()}-${Math.random()}`,
      preferredColor: current.config.accentColor,
    });
  }

  /**
   * Resets an avatar's appearance to deterministic base default while preserving Avatar Code.
   */
  static async resetToDefault(avatar: GuardianAvatarDTO): Promise<GuardianAvatarDTO> {
    const defaultConfig = generateAvatarConfig({
      entityId: avatar.projectId || avatar.id,
      entityKind: 'project',
      name: avatar.projectName || avatar.name,
      preferredColor: avatar.projectColor || avatar.config.accentColor,
    });

    return this.updateAvatar(avatar.id, { config: defaultConfig });
  }

  /**
   * Assigns an avatar to a project.
   */
  static async assignToProject(avatarId: string, projectId: string): Promise<GuardianAvatarDTO> {
    const record = await AvatarRepository.assignToProject(avatarId, projectId);
    return this.formatDTO(record);
  }

  /**
   * Unassigns an avatar.
   */
  static async unassign(avatarId: string, currentProjectId?: string | null): Promise<GuardianAvatarDTO> {
    const record = await AvatarRepository.unassign(avatarId, currentProjectId);
    return this.formatDTO(record);
  }

  /**
   * Duplicates an avatar (clones appearance with fresh 10-digit code).
   */
  static async duplicate(avatar: GuardianAvatarDTO): Promise<GuardianAvatarDTO> {
    return this.createAvatar({
      name: `${avatar.name} (Copy)`,
      config: { ...avatar.config, seed: `copy-${Date.now()}` },
    });
  }

  /**
   * Deletes an avatar.
   */
  static async deleteAvatar(avatarId: string): Promise<void> {
    await AvatarRepository.deleteAvatar(avatarId);
  }
}
