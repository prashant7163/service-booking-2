export type Role = 'CUSTOMER' | 'PROVIDER' | 'ADMINISTRATOR';

export interface SessionView {
  accountId: string;
  role: Role;
  verified: boolean;
}

export interface ApiFieldError {
  field: string;
  messageKey: string;
}

export interface ApiErrorPayload {
  code: string;
  messageKey: string;
  fieldErrors: ApiFieldError[];
  correlationId: string;
}

export interface SafeApiError {
  code: string;
  messageKey: string;
  message: string;
  fieldErrors: ApiFieldError[];
  status?: number;
}

const safeErrors: Record<string, { messageKey: string; message: string }> = {
  AUTH_FAILED: { messageKey: 'auth.invalidCredentials', message: 'Authentication failed.' },
  INVALID_CREDENTIALS: { messageKey: 'auth.invalidCredentials', message: 'Authentication failed.' },
  AUTHENTICATION_REQUIRED: { messageKey: 'auth.signIn', message: 'Authentication is required.' },
  EMAIL_IN_USE: { messageKey: 'auth.emailInUse', message: 'This email is already registered.' },
  PROVIDER_SUSPENDED: { messageKey: 'auth.suspended', message: 'Provider access is suspended.' },
  INVALID_TOKEN: { messageKey: 'auth.invalidToken', message: 'This credential is invalid or already used.' },
  VALIDATION_FAILED: { messageKey: 'common.validation', message: 'Check the highlighted fields.' },
  FORBIDDEN: { messageKey: 'common.accessDenied', message: 'Access denied.' },
  VERIFICATION_REQUIRED: { messageKey: 'common.accessDenied', message: 'Verification is required.' },
  NOT_FOUND: { messageKey: 'common.unavailable', message: 'This item is unavailable.' },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function safeFieldErrors(value: unknown): ApiFieldError[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.field !== 'string' || typeof item.messageKey !== 'string') return [];
    return [{ field: item.field, messageKey: item.messageKey }];
  });
}

export function publicError(value: unknown, status?: number): SafeApiError {
  const code = isRecord(value) && typeof value.code === 'string' ? value.code : 'UNKNOWN';
  const known = safeErrors[code];
  const fallback =
    status === 401
      ? safeErrors.AUTHENTICATION_REQUIRED
      : status === 403
        ? safeErrors.FORBIDDEN
        : status === 404
          ? safeErrors.NOT_FOUND
          : { messageKey: 'common.requestFailed', message: 'This request could not be completed.' };

  return {
    code,
    messageKey: (known ?? fallback).messageKey,
    message: (known ?? fallback).message,
    fieldErrors: isRecord(value) ? safeFieldErrors(value.fieldErrors) : [],
    status,
  };
}

export class ApiRequestError extends Error {
  readonly detail: SafeApiError;

  constructor(detail: SafeApiError) {
    super(detail.message);
    this.name = 'ApiRequestError';
    this.detail = detail;
  }
}

let csrfToken: string | undefined;

function assertApiPath(path: string): void {
  if (!path.startsWith('/api/') || path.startsWith('//')) {
    throw new Error('API requests must use a same-origin /api path.');
  }
}

async function responseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return undefined;
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

async function getCsrfToken(): Promise<string> {
  const response = await fetch('/api/auth/csrf', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
  const body = await responseBody(response);
  if (!response.ok || !isRecord(body) || typeof body.token !== 'string') {
    throw new ApiRequestError(publicError(body, response.status));
  }
  csrfToken = body.token;
  return csrfToken;
}

export interface RequestOptions extends Omit<RequestInit, 'credentials'> {
  body?: BodyInit | null;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  assertApiPath(path);
  const method = (options.method ?? 'GET').toUpperCase();
  const mutation = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (mutation) headers.set('X-CSRF-TOKEN', csrfToken ?? (await getCsrfToken()));

  const response = await fetch(path, { ...options, method, headers, credentials: 'same-origin' });
  const body = await responseBody(response);

  if (!response.ok) throw new ApiRequestError(publicError(body, response.status));
  if (mutation) csrfToken = undefined;
  return body as T;
}

export const api = { request };
