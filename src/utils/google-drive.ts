export interface GoogleDriveInfo {
  isValid: boolean;
  type: 'folder' | 'video' | 'doc' | 'sheet' | 'slide' | 'file' | 'generic';
  embedUrl?: string;
  directUrl?: string;
}

export function parseGoogleDriveUrl(url: string): GoogleDriveInfo {
  if (!url || typeof url !== 'string') {
    return { isValid: false, type: 'generic' };
  }

  const trimmed = url.trim();
  const isGoogleDomain = /drive\.google\.com|docs\.google\.com|drive\.google\.co/i.test(trimmed);

  if (!isGoogleDomain) {
    return { isValid: false, type: 'generic', directUrl: trimmed };
  }

  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) {
    const folderId = folderMatch[1];
    return {
      isValid: true,
      type: 'folder',
      embedUrl: `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`,
      directUrl: trimmed,
    };
  }

  if (trimmed.includes('/document/d/')) {
    const docMatch = trimmed.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    const docId = docMatch ? docMatch[1] : null;
    return {
      isValid: true,
      type: 'doc',
      embedUrl: docId ? `https://docs.google.com/document/d/${docId}/preview` : trimmed,
      directUrl: trimmed,
    };
  }

  if (trimmed.includes('/spreadsheets/d/')) {
    const sheetMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    const sheetId = sheetMatch ? sheetMatch[1] : null;
    return {
      isValid: true,
      type: 'sheet',
      embedUrl: sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/preview` : trimmed,
      directUrl: trimmed,
    };
  }

  if (trimmed.includes('/presentation/d/')) {
    const slideMatch = trimmed.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    const slideId = slideMatch ? slideMatch[1] : null;
    return {
      isValid: true,
      type: 'slide',
      embedUrl: slideId ? `https://docs.google.com/presentation/d/${slideId}/embed` : trimmed,
      directUrl: trimmed,
    };
  }

  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    const fileId = fileMatch[1];
    return {
      isValid: true,
      type: 'video',
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      directUrl: trimmed,
    };
  }

  return {
    isValid: true,
    type: 'file',
    directUrl: trimmed,
  };
}
