import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '../../services/task.service';
import { type TaskFilterOptions, type TaskItem, type TaskStatus } from '../../repositories/task.repository';
import { taskKeys } from '../../constants/query-keys';

/**
 * Default Query Configuration
 */
const DEFAULT_QUERY_CONFIG = {
  staleTime: 3 * 60 * 1000, // 3 minutes
  gcTime: 10 * 60 * 1000,    // 10 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 2,
};

/**
 * Fetch Paginated & Filtered Tasks Hook
 */
export const useTasks = (options: TaskFilterOptions = {}) => {
  return useQuery({
    queryKey: taskKeys.list(options),
    queryFn: () => TaskService.getTasks(options),
    ...DEFAULT_QUERY_CONFIG,
  });
};

/**
 * Fetch Aggregate Task Statistics Metrics Hook
 */
export const useTaskStatistics = (projectId?: string) => {
  return useQuery({
    queryKey: taskKeys.statistics(projectId),
    queryFn: () => TaskService.getTaskStatistics(projectId),
    ...DEFAULT_QUERY_CONFIG,
  });
};

/**
 * Fetch Distinct Task Modules Hook
 */
export const useTaskModules = (projectId?: string) => {
  return useQuery({
    queryKey: taskKeys.modules(projectId),
    queryFn: () => TaskService.getTaskModules(projectId),
    ...DEFAULT_QUERY_CONFIG,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Create Task Mutation with Optimistic Updates & Cache Invalidation
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TaskItem>) => TaskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

/**
 * Update Task Mutation with Immediate Optimistic Cache Mutation & Rollback
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TaskItem> }) =>
      TaskService.updateTask(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      // Snapshot previous query data
      const previousData = queryClient.getQueriesData({ queryKey: taskKeys.lists() });

      // Optimistically update matching task list caches
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old || !old.tasks) return old;
        return {
          ...old,
          tasks: old.tasks.map((task: TaskItem) =>
            task.id === id ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
          ),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback to previous state on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

/**
 * Bulk Update Tasks Mutation
 */
export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: Partial<TaskItem> }) =>
      TaskService.bulkUpdateTasks(ids, updates),
    onMutate: async ({ ids, updates }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      const previousData = queryClient.getQueriesData({ queryKey: taskKeys.lists() });

      const idSet = new Set(ids);
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old || !old.tasks) return old;
        return {
          ...old,
          tasks: old.tasks.map((task: TaskItem) =>
            idSet.has(task.id) ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
          ),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

/**
 * Delete Single Task Mutation
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskService.deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      const previousData = queryClient.getQueriesData({ queryKey: taskKeys.lists() });

      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old || !old.tasks) return old;
        return {
          ...old,
          tasks: old.tasks.filter((task: TaskItem) => task.id !== id),
          totalCount: Math.max(0, (old.totalCount || 1) - 1),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

/**
 * Bulk Delete Tasks Mutation
 */
export const useBulkDeleteTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => TaskService.bulkDeleteTasks(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      const previousData = queryClient.getQueriesData({ queryKey: taskKeys.lists() });

      const idSet = new Set(ids);
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old || !old.tasks) return old;
        const filtered = old.tasks.filter((task: TaskItem) => !idSet.has(task.id));
        return {
          ...old,
          tasks: filtered,
          totalCount: Math.max(0, (old.totalCount || ids.length) - ids.length),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

/**
 * Move Task Hook with Immediate Optimistic Board State & Transactional Sync
 */
export const useMoveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      taskId: string;
      newStatus: TaskStatus;
      newSortOrder: number;
      reorderedTasks?: { id: string; sort_order: number }[];
    }) => TaskService.moveTask(params),
    onMutate: async ({ taskId, newStatus, newSortOrder }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      const previousData = queryClient.getQueriesData({ queryKey: taskKeys.lists() });

      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old || !old.tasks) return old;
        return {
          ...old,
          tasks: old.tasks.map((task: TaskItem) =>
            task.id === taskId
              ? {
                  ...task,
                  status: newStatus,
                  sort_order: newSortOrder,
                  ...(newStatus === 'completed' ? { progress: 100 } : {}),
                  updated_at: new Date().toISOString(),
                }
              : task
          ),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

/**
 * Single Task Specifications Query Hook (Progressively Loaded)
 */
export const useTask = (taskId: string | null) => {
  return useQuery({
    queryKey: taskKeys.detail(taskId || ''),
    queryFn: () => TaskService.getTaskById(taskId!),
    enabled: !!taskId,
    staleTime: 60 * 1000,
  });
};

/**
 * Task Attachments Query Hook (Lazy Loaded)
 */
export const useTaskAttachments = (taskId: string | null) => {
  return useQuery({
    queryKey: ['task_attachments', taskId],
    queryFn: () => TaskService.getTaskAttachments(taskId!),
    enabled: !!taskId,
    staleTime: 30 * 1000,
  });
};

/**
 * Upload Task Attachment Hook
 */
export const useUploadTaskAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: string; file: File }) =>
      TaskService.uploadTaskAttachment(taskId, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task_attachments', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

/**
 * Delete Task Attachment Hook
 */
export const useDeleteTaskAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; taskId: string }) =>
      TaskService.deleteTaskAttachment(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task_attachments', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

/**
 * Dedicated Update Task Status Hook
 */
export const useUpdateTaskStatus = () => {
  const updateTask = useUpdateTask();

  return useMutation({
    mutationFn: ({ id, status, progress }: { id: string; status: TaskStatus; progress?: number }) =>
      updateTask.mutateAsync({
        id,
        updates: {
          status,
          ...(progress !== undefined ? { progress } : status === 'completed' ? { progress: 100 } : {}),
        },
      }),
  });
};
