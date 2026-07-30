import {
  TaskRepository,
  type TaskFilterOptions,
  type TaskItem,
  type TaskStatistics,
} from '../repositories/task.repository';

export class TaskServiceError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'TaskServiceError';
    this.code = code;
  }
}

export const TaskService = {
  /**
   * Data Normalization Helper
   */
  normalizeTaskPayload<T extends Partial<TaskItem>>(payload: T): T {
    const normalized: Record<string, any> = { ...payload };

    if (typeof normalized.title === 'string') {
      normalized.title = normalized.title.trim();
    }

    if (typeof normalized.description === 'string') {
      normalized.description = normalized.description.trim() || null;
    }

    if (typeof normalized.module === 'string') {
      normalized.module = normalized.module.trim() || null;
    }

    if (typeof normalized.progress === 'number') {
      normalized.progress = Math.min(100, Math.max(0, Math.round(normalized.progress)));
    }

    if (Array.isArray(normalized.labels)) {
      const cleaned = normalized.labels
        .map((l: any) => (typeof l === 'string' ? l.trim() : ''))
        .filter(Boolean);
      normalized.labels = Array.from(new Set(cleaned));
    }

    return normalized as T;
  },

  /**
   * Fetch Paginated & Filtered Tasks Directory
   */
  async getTasks(options: TaskFilterOptions = {}): Promise<{ tasks: TaskItem[]; totalCount: number }> {
    try {
      return await TaskRepository.getTasks(options);
    } catch (err: any) {
      console.error('[TaskService] Failed to fetch tasks:', err);
      throw new TaskServiceError(err.message || 'Unable to load tasks directory.');
    }
  },

  /**
   * Fetch Task Statistics Metrics
   */
  async getTaskStatistics(projectId?: string): Promise<TaskStatistics> {
    try {
      return await TaskRepository.getTaskStatistics(projectId);
    } catch (err: any) {
      console.error('[TaskService] Failed to load task statistics:', err);
      return {
        total: 0,
        todo: 0,
        inProgress: 0,
        review: 0,
        testing: 0,
        completed: 0,
        overdue: 0,
      };
    }
  },

  /**
   * Fetch Distinct Task Modules
   */
  async getTaskModules(projectId?: string): Promise<string[]> {
    try {
      return await TaskRepository.getTaskModules(projectId);
    } catch (err: any) {
      console.error('[TaskService] Failed to fetch task modules:', err);
      return [];
    }
  },

  /**
   * Create New Task
   */
  async createTask(taskData: Partial<TaskItem>): Promise<TaskItem> {
    const normalized = this.normalizeTaskPayload(taskData);

    if (!normalized.title) {
      throw new TaskServiceError('Task title is required.');
    }

    if (!normalized.project_id) {
      throw new TaskServiceError('Project ID is required.');
    }

    try {
      return await TaskRepository.createTask(normalized);
    } catch (err: any) {
      console.error('[TaskService] Create task failed:', err);
      throw new TaskServiceError(err.message || 'Failed to create task entry.');
    }
  },

  /**
   * Update Single Task
   */
  async updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem> {
    if (!id) {
      throw new TaskServiceError('Task ID is required for update.');
    }

    const normalized = this.normalizeTaskPayload(updates);

    try {
      return await TaskRepository.updateTask(id, normalized);
    } catch (err: any) {
      console.error(`[TaskService] Update task ${id} failed:`, err);
      throw new TaskServiceError(err.message || 'Failed to update task.');
    }
  },

  /**
   * Bulk Update Tasks
   */
  async bulkUpdateTasks(ids: string[], updates: Partial<TaskItem>): Promise<void> {
    if (!ids || ids.length === 0) return;

    const normalized = this.normalizeTaskPayload(updates);

    try {
      await TaskRepository.bulkUpdateTasks(ids, normalized);
    } catch (err: any) {
      console.error('[TaskService] Bulk update tasks failed:', err);
      throw new TaskServiceError(err.message || 'Failed to execute bulk task update.');
    }
  },

  /**
   * Delete Task
   */
  async deleteTask(id: string): Promise<void> {
    if (!id) throw new TaskServiceError('Task ID required.');

    try {
      await TaskRepository.deleteTask(id);
    } catch (err: any) {
      console.error(`[TaskService] Delete task ${id} failed:`, err);
      throw new TaskServiceError(err.message || 'Failed to delete task.');
    }
  },

  /**
   * Bulk Delete Tasks
   */
  async bulkDeleteTasks(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) return;

    try {
      await TaskRepository.bulkDeleteTasks(ids);
    } catch (err: any) {
      console.error('[TaskService] Bulk delete tasks failed:', err);
      throw new TaskServiceError(err.message || 'Failed to execute bulk task deletion.');
    }
  },

  /**
   * Transactional Move Task & Reorder Status Column
   */
  async moveTask(params: {
    taskId: string;
    newStatus: any;
    newSortOrder: number;
    reorderedTasks?: { id: string; sort_order: number }[];
  }): Promise<void> {
    try {
      await TaskRepository.moveTask(params);
    } catch (err: any) {
      console.error('[TaskService] Move task failed:', err);
      throw new TaskServiceError(err.message || 'Failed to move task on board.');
    }
  },

  /**
   * Get Task By ID
   */
  async getTaskById(id: string) {
    try {
      return await TaskRepository.getTaskById(id);
    } catch (err: any) {
      console.error('[TaskService] Fetch task by ID failed:', err);
      throw new TaskServiceError(err.message || 'Failed to fetch task specifications.');
    }
  },

  /**
   * Get Task Attachments
   */
  async getTaskAttachments(taskId: string) {
    try {
      return await TaskRepository.getTaskAttachments(taskId);
    } catch (err: any) {
      console.error('[TaskService] Fetch task attachments failed:', err);
      return [];
    }
  },

  /**
   * Upload Task Attachment
   */
  async uploadTaskAttachment(taskId: string, file: File) {
    try {
      if (file.size > 25 * 1024 * 1024) {
        throw new Error('File size exceeds the maximum limit of 25MB.');
      }
      return await TaskRepository.uploadTaskAttachment(taskId, file);
    } catch (err: any) {
      console.error('[TaskService] Upload attachment failed:', err);
      throw new TaskServiceError(err.message || 'Failed to upload task attachment.');
    }
  },

  /**
   * Delete Task Attachment
   */
  async deleteTaskAttachment(id: string) {
    try {
      await TaskRepository.deleteTaskAttachment(id);
    } catch (err: any) {
      console.error('[TaskService] Delete attachment failed:', err);
      throw new TaskServiceError(err.message || 'Failed to delete task attachment.');
    }
  },
};
