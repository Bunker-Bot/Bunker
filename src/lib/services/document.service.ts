import {
  DocumentRepository,
  type DocumentFilterOptions,
  type DocumentItem,
  type DocumentVersionItem,
} from '../repositories/document.repository';

export class DocumentServiceError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'DocumentServiceError';
    this.code = code;
  }
}

export const DocumentService = {
  /**
   * Helper: Calculate Word Count
   */
  calculateWordCount(content?: string | null): number {
    if (!content) return 0;
    const cleanText = content.replace(/```[\s\S]*?```/g, '').replace(/#+|\*|_|`|\[|\]|\(|\)/g, ' ');
    const words = cleanText.trim().split(/\s+/).filter(Boolean);
    return words.length;
  },

  /**
   * Helper: Calculate Reading Time (words / 200 wpm)
   */
  calculateReadingTime(content?: string | null): number {
    const wordCount = this.calculateWordCount(content);
    return Math.max(1, Math.ceil(wordCount / 200));
  },

  /**
   * Normalize Payload Data
   */
  normalizeDocumentPayload<T extends Partial<DocumentItem>>(payload: T): T {
    const normalized: Record<string, any> = { ...payload };

    if (typeof normalized.title === 'string') {
      normalized.title = normalized.title.trim();
    }

    if (typeof normalized.category === 'string') {
      normalized.category = normalized.category.trim();
    }

    if (typeof normalized.author === 'string') {
      normalized.author = normalized.author.trim();
    }

    return normalized as T;
  },

  /**
   * Fetch Minimal Document List (Progressive Loading)
   */
  async getDocumentsByProject(
    projectId?: string,
    options: DocumentFilterOptions = {}
  ): Promise<{ documents: DocumentItem[]; totalCount: number }> {
    try {
      return await DocumentRepository.getDocumentsByProject(projectId, options);
    } catch (err: any) {
      console.error('[DocumentService] Failed to load documents:', err);
      throw new DocumentServiceError(err.message || 'Unable to load project documents list.');
    }
  },

  /**
   * Fetch Single Full Document Specifications
   */
  async getDocumentById(documentId: string): Promise<DocumentItem | null> {
    if (!documentId) return null;
    try {
      return await DocumentRepository.getDocumentById(documentId);
    } catch (err: any) {
      console.error(`[DocumentService] Fetch document ${documentId} failed:`, err);
      throw new DocumentServiceError(err.message || 'Failed to fetch document content.');
    }
  },

  /**
   * Fetch Document Versions History (Lazy Loaded)
   */
  async getDocumentVersions(documentId: string): Promise<DocumentVersionItem[]> {
    if (!documentId) return [];
    try {
      return await DocumentRepository.getDocumentVersions(documentId);
    } catch (err: any) {
      console.error(`[DocumentService] Fetch versions for document ${documentId} failed:`, err);
      return [];
    }
  },

  /**
   * Create New Documentation Entry
   */
  async createDocument(data: Partial<DocumentItem>): Promise<DocumentItem> {
    const normalized = this.normalizeDocumentPayload(data);

    if (!normalized.title) {
      throw new DocumentServiceError('Document title is required.');
    }

    if (!normalized.project_id) {
      throw new DocumentServiceError('Project ID is required.');
    }

    try {
      return await DocumentRepository.createDocument(normalized);
    } catch (err: any) {
      console.error('[DocumentService] Create document failed:', err);
      throw new DocumentServiceError(err.message || 'Failed to create document.');
    }
  },

  /**
   * Atomic Save Document Method
   */
  async saveDocument(
    documentId: string,
    updates: Partial<DocumentItem>,
    changeSummary = 'Updated document content'
  ): Promise<DocumentItem> {
    if (!documentId) throw new DocumentServiceError('Document ID is required.');

    const normalized = this.normalizeDocumentPayload(updates);

    try {
      return await DocumentRepository.saveDocument(documentId, normalized, changeSummary);
    } catch (err: any) {
      console.error(`[DocumentService] Save document ${documentId} failed:`, err);
      throw new DocumentServiceError(err.message || 'Unable to save document.');
    }
  },

  /**
   * Update Document Content / Metadata
   */
  async updateDocument(
    documentId: string,
    updates: Partial<DocumentItem>,
    changeSummary = 'Updated document content'
  ): Promise<DocumentItem> {
    return this.saveDocument(documentId, updates, changeSummary);
  },

  /**
   * Delete Document
   */
  async deleteDocument(documentId: string): Promise<void> {
    if (!documentId) throw new DocumentServiceError('Document ID is required.');

    try {
      await DocumentRepository.deleteDocument(documentId);
    } catch (err: any) {
      console.error(`[DocumentService] Delete document ${documentId} failed:`, err);
      throw new DocumentServiceError(err.message || 'Failed to delete document.');
    }
  },

  /**
   * Toggle Favorite Status
   */
  async toggleFavorite(documentId: string, isFavorite: boolean): Promise<void> {
    if (!documentId) return;
    try {
      await DocumentRepository.toggleFavorite(documentId, isFavorite);
    } catch (err: any) {
      console.error(`[DocumentService] Toggle favorite failed:`, err);
    }
  },

  /**
   * Toggle Client Visibility Status
   */
  async toggleClientVisible(documentId: string, isClientVisible: boolean): Promise<void> {
    if (!documentId) return;
    try {
      await DocumentRepository.toggleClientVisible(documentId, isClientVisible);
    } catch (err: any) {
      console.error(`[DocumentService] Toggle client visibility failed:`, err);
    }
  },

  /**
   * Restore Specific Historical Version
   */
  async restoreVersion(documentId: string, versionId: string): Promise<DocumentItem> {
    if (!documentId || !versionId) {
      throw new DocumentServiceError('Document ID and Version ID are required.');
    }

    try {
      return await DocumentRepository.restoreVersion(documentId, versionId);
    } catch (err: any) {
      console.error(`[DocumentService] Restore version failed:`, err);
      throw new DocumentServiceError(err.message || 'Failed to restore historical version.');
    }
  },
};

export default DocumentService;
