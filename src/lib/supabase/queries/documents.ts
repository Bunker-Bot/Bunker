import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentService } from '../../services/document.service';
import type {
  DocumentItem,
  DocumentFilterOptions,
} from '../../repositories/document.repository';

// Centralized Query Keys Factory
export const docKeys = {
  all: ['documents'] as const,
  lists: () => [...docKeys.all, 'project-documents'] as const,
  list: (projectId?: string, filters?: DocumentFilterOptions) =>
    [...docKeys.lists(), { projectId, ...filters }] as const,
  details: () => [...docKeys.all, 'document'] as const,
  detail: (id: string) => [...docKeys.details(), id] as const,
  versionsGroup: () => [...docKeys.all, 'document-versions'] as const,
  versions: (id: string) => [...docKeys.versionsGroup(), id] as const,
};

/**
 * useDocuments(projectId)
 * Purpose: Load lightweight document list metadata for sidebar.
 * Lightweight selection: id, project_id, title, doc_type, version, updated_at, created_at.
 * Markdown content is NOT fetched in this list query.
 */
export const useDocuments = (
  projectId?: string,
  options: DocumentFilterOptions = {}
) => {
  return useQuery({
    queryKey: docKeys.list(projectId, options),
    queryFn: () => DocumentService.getDocumentsByProject(projectId, options),
    staleTime: 1000 * 60, // 60 seconds staleTime for metadata
    gcTime: 1000 * 60 * 10,
    networkMode: 'online',
    retry: (failureCount, error: any) => {
      // Disable retries for validation or missing resource errors
      if (error?.message?.includes('required') || error?.code === 'PGRST116') return false;
      return failureCount < 2;
    },
  });
};

/**
 * useDocument(documentId)
 * Purpose: Load single selected document markdown content lazily.
 * Cached individually per documentId.
 */
export const useDocument = (documentId: string | null) => {
  return useQuery({
    queryKey: docKeys.detail(documentId || ''),
    queryFn: () => DocumentService.getDocumentById(documentId!),
    enabled: Boolean(documentId),
    staleTime: 1000 * 60 * 10, // 10 minutes staleTime for markdown content
    gcTime: 1000 * 60 * 30,
    networkMode: 'online',
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116') return false;
      return failureCount < 2;
    },
  });
};

/**
 * useDocumentVersions(documentId)
 * Purpose: Lazy load version history snapshots only when Version History Panel opens.
 */
export const useDocumentVersions = (documentId: string | null) => {
  return useQuery({
    queryKey: docKeys.versions(documentId || ''),
    queryFn: () => DocumentService.getDocumentVersions(documentId!),
    enabled: Boolean(documentId),
    staleTime: 1000 * 60 * 5, // 5 minutes staleTime for versions
    gcTime: 1000 * 60 * 15,
  });
};

/**
 * useCreateDocument()
 * Purpose: Create new document, initial version, and optimistically update sidebar cache.
 */
export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (docData: Partial<DocumentItem>) => DocumentService.createDocument(docData),
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: docKeys.lists() });
      if (newDoc?.id) {
        queryClient.setQueryData(docKeys.detail(newDoc.id), newDoc);
      }
    },
  });
};

/**
 * useSaveDocument()
 * Purpose: Primary atomic save pipeline with in-flight locking, optimistic updates, and version incrementing.
 */
export const useSaveDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
      changeSummary = 'Updated document content',
    }: {
      id: string;
      updates: Partial<DocumentItem>;
      changeSummary?: string;
    }) => DocumentService.saveDocument(id, updates, changeSummary),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: docKeys.detail(id) });
      const previousDoc = queryClient.getQueryData<DocumentItem>(docKeys.detail(id));

      if (previousDoc) {
        queryClient.setQueryData(docKeys.detail(id), {
          ...previousDoc,
          ...updates,
          version: (previousDoc.version || 1) + (updates.content !== previousDoc.content ? 1 : 0),
          updated_at: new Date().toISOString(),
        });
      }

      return { previousDoc };
    },
    onError: (_err: any, { id }, context) => {
      if (context?.previousDoc) {
        queryClient.setQueryData(docKeys.detail(id), context.previousDoc);
      }
    },
    onSuccess: (data, { id }) => {
      if (data) {
        queryClient.setQueryData(docKeys.detail(id), data);
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: docKeys.lists() });
      queryClient.invalidateQueries({ queryKey: docKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: docKeys.versions(id) });
    },
  });
};

/**
 * Alias for useSaveDocument to support legacy update calls
 */
export const useUpdateDocument = useSaveDocument;

/**
 * useRestoreDocumentVersion()
 * Purpose: Restore historical version by creating a new version snapshot and updating current document.
 */
export const useRestoreDocumentVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, versionId }: { documentId: string; versionId: string }) =>
      DocumentService.restoreVersion(documentId, versionId),
    onSuccess: (updatedDoc) => {
      if (updatedDoc?.id) {
        queryClient.setQueryData(docKeys.detail(updatedDoc.id), updatedDoc);
        queryClient.invalidateQueries({ queryKey: docKeys.lists() });
        queryClient.invalidateQueries({ queryKey: docKeys.versions(updatedDoc.id) });
      }
    },
  });
};

/**
 * Alias for useRestoreDocumentVersion
 */
export const useRestoreVersion = useRestoreDocumentVersion;

/**
 * useDeleteDocument()
 * Purpose: Delete document with optimistic sidebar removal and rollback on error.
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DocumentService.deleteDocument(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: docKeys.lists() });
      const previousList = queryClient.getQueriesData({ queryKey: docKeys.lists() });

      queryClient.setQueriesData({ queryKey: docKeys.lists() }, (old: any) => {
        if (!old || !old.documents) return old;
        return {
          ...old,
          documents: old.documents.filter((d: DocumentItem) => d.id !== id),
          totalCount: Math.max(0, (old.totalCount || 1) - 1),
        };
      });

      return { previousList };
    },
    onError: (_err, _id, context) => {
      if (context?.previousList) {
        context.previousList.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (_data, _err, id) => {
      queryClient.invalidateQueries({ queryKey: docKeys.lists() });
      queryClient.removeQueries({ queryKey: docKeys.detail(id) });
    },
  });
};

/**
 * useToggleFavorite()
 */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      DocumentService.toggleFavorite(id, isFavorite),
    onMutate: async ({ id, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: docKeys.all });

      queryClient.setQueriesData({ queryKey: docKeys.lists() }, (old: any) => {
        if (!old || !old.documents) return old;
        return {
          ...old,
          documents: old.documents.map((d: DocumentItem) =>
            d.id === id ? { ...d, is_favorite: isFavorite } : d
          ),
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: docKeys.lists() });
    },
  });
};

/**
 * useToggleClientVisible()
 */
export const useToggleClientVisible = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isClientVisible }: { id: string; isClientVisible: boolean }) =>
      DocumentService.toggleClientVisible(id, isClientVisible),
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: docKeys.lists() });
      queryClient.invalidateQueries({ queryKey: docKeys.detail(id) });
    },
  });
};
