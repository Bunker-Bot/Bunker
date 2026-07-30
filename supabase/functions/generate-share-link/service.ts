import type {
  GenerateShareLinkRequest,
  GenerateShareLinkResponse,
} from './types.ts';

import { config } from './config.ts';
import { validateShareLinkPayload } from './validator.ts';
import { checkRateLimit } from './rate-limiter.ts';
import { getIdempotentResponse, setIdempotentResponse } from './idempotency.ts';
import {
  generate32ByteRawToken,
  hashTokenSHA256,
  hashPasswordSecurely,
  createTokenPreview,
} from './security.ts';
import {
  verifyProjectExists,
  executeShareLinkCreation,
  writeActivityLog,
} from './repository.ts';

export async function processGenerateShareLink(
  userId: string,
  body: GenerateShareLinkRequest,
  idempotencyKey?: string | null
): Promise<{ status: number; body: GenerateShareLinkResponse }> {
  // 1. Check Rate Limiting (10 requests per minute per administrator)
  const rateLimitStatus = checkRateLimit(userId);
  if (rateLimitStatus.isLimited) {
    return {
      status: 429,
      body: {
        success: false,
        code: 'RATE_LIMITED',
        message: 'Rate limit exceeded. Maximum 10 share-link generations per minute allowed.',
      },
    };
  }

  // 2. Check Idempotency Key
  if (idempotencyKey) {
    const cachedResponse = getIdempotentResponse(idempotencyKey);
    if (cachedResponse) {
      return { status: 200, body: cachedResponse };
    }
  }

  // 3. Validate Request Payload
  const validation = validateShareLinkPayload(body);
  if (!validation.isValid || !validation.sanitized) {
    return {
      status: 400,
      body: {
        success: false,
        code: 'INVALID_PAYLOAD',
        message: validation.error || 'Invalid share link request payload.',
      },
    };
  }

  const payload = validation.sanitized;

  // 4. Verify Project Exists & Is Active
  const projectCheck = await verifyProjectExists(payload.projectId);
  if (!projectCheck.exists) {
    return {
      status: 404,
      body: {
        success: false,
        code: 'INVALID_PROJECT',
        message: 'Project could not be found or has been archived.',
      },
    };
  }

  // 5. Generate Token & Hashes
  // Raw 32-byte (256-bit entropy) token returned ONLY ONCE in the share URL
  const rawToken = generate32ByteRawToken();
  const tokenHash = await hashTokenSHA256(rawToken);
  const tokenPreview = createTokenPreview(rawToken);

  let passwordHash: string | null = null;
  if (payload.password) {
    passwordHash = await hashPasswordSecurely(payload.password);
  }

  // 6. DB Creation Transaction
  try {
    const createdLink = await executeShareLinkCreation({
      projectId: payload.projectId,
      name: payload.name,
      tokenHash, // DB stores SHA-256(token)
      passwordHash,
      expiresAt: payload.expiresAt,
      maxViews: payload.maxViews,
      modulePermissions: payload.modulePermissions,
      notes: payload.notes,
      clientName: payload.clientName,
      label: payload.label,
      purpose: payload.purpose,
      tokenPreview,
      createdBy: userId,
    });

    // 7. Write Activity Audit Log
    const allowedModuleKeys = Object.keys(payload.modulePermissions);
    await writeActivityLog({
      linkId: createdLink.id,
      projectId: payload.projectId,
      projectName: projectCheck.name || 'Project',
      userId,
      expiresAt: payload.expiresAt,
      passwordEnabled: Boolean(passwordHash),
      maxViews: payload.maxViews,
      allowedModules: allowedModuleKeys,
      tokenPreview,
    });

    // 8. Assemble Clean Response (Browser receives raw token in URL only once)
    const publicUrl = `${config.publicAppUrl}/share/${rawToken}`;

    const responseSuccess = {
      success: true as const,
      id: createdLink.id,
      url: publicUrl,
      tokenPreview,
      expiresAt: payload.expiresAt,
      createdAt: createdLink.createdAt,
      passwordProtected: Boolean(passwordHash),
      allowedModules: allowedModuleKeys,
      maxViews: payload.maxViews,
    };

    // Cache for Idempotency if key provided
    if (idempotencyKey) {
      setIdempotentResponse(idempotencyKey, responseSuccess);
    }

    return { status: 201, body: responseSuccess };
  } catch (err: any) {
    console.error('[service] processGenerateShareLink failed:', err);
    return {
      status: 500,
      body: {
        success: false,
        code: 'DATABASE_ERROR',
        message: 'Unable to insert share link into database.',
      },
    };
  }
}
