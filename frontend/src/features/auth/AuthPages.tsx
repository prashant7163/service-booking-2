import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiRequestError, api, type Role, type SafeApiError, type SessionView } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { FormField } from '../../components/FormField';
import { useI18n } from '../../i18n';

type FieldName = 'displayName' | 'email' | 'password' | 'token';
type FieldErrors = Partial<Record<FieldName, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FocusHeading({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <h1 ref={ref} tabIndex={-1}>
      {children}
    </h1>
  );
}

function ValidationSummary({ errors, fieldIds = {} }: { errors: FieldErrors; fieldIds?: Partial<Record<FieldName, string>> }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const entries = Object.entries(errors) as [FieldName, string][];

  useEffect(() => {
    if (entries.length) ref.current?.focus();
  }, [entries.length]);

  if (!entries.length) return null;
  return (
    <div className="error-summary" role="alert" tabIndex={-1} ref={ref}>
      <h2>{t('common.validation')}</h2>
      <ul>
        {entries.map(([field, message]) => (
          <li key={field}>
            <a href={`#${fieldIds[field] ?? field}`}>{message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function errorMessage(error: SafeApiError, t: ReturnType<typeof useI18n>['t']): string {
  switch (error.messageKey) {
    case 'auth.invalidCredentials':
      return t('auth.invalidCredentials');
    case 'auth.emailInUse':
      return t('auth.emailInUse');
    case 'auth.suspended':
      return t('auth.suspended');
    case 'auth.invalidToken':
      return t('auth.invalidToken');
    case 'common.accessDenied':
      return t('common.accessDenied');
    case 'common.unavailable':
      return t('common.unavailable');
    default:
      return t('common.requestFailed');
  }
}

function RequestError({ message }: { message?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (message) ref.current?.focus();
  }, [message]);
  return message ? (
    <section className="request-error" role="alert">
      <h2 ref={ref} tabIndex={-1}>
        {message}
      </h2>
    </section>
  ) : null;
}

function validateEmail(email: string, required: string, invalid: string): string | undefined {
  if (!email.trim()) return required;
  return emailPattern.test(email) ? undefined : invalid;
}

function serverFields(error: SafeApiError, required: string, invalidEmail: string): FieldErrors {
  return Object.fromEntries(
    error.fieldErrors.flatMap(({ field }) => {
      if (!['displayName', 'email', 'password', 'token'].includes(field)) return [];
      return [[field, field === 'email' ? invalidEmail : required]];
    }),
  );
}

interface RegistrationProps {
  role: Extract<Role, 'CUSTOMER' | 'PROVIDER'>;
}

function Registration({ role }: RegistrationProps) {
  const { t } = useI18n();
  const { setSession } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [requestError, setRequestError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [verified, setVerified] = useState(false);

  const heading = role === 'CUSTOMER' ? t('auth.registerCustomer') : t('auth.registerProvider');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!displayName.trim()) nextErrors.displayName = t('field.required');
    const emailError = validateEmail(email, t('field.required'), t('field.emailInvalid'));
    if (emailError) nextErrors.email = emailError;
    if (!password) nextErrors.password = t('field.required');
    setErrors(nextErrors);
    setRequestError(undefined);
    if (Object.keys(nextErrors).length) return;

    setPending(true);
    try {
      const path = role === 'CUSTOMER' ? '/api/auth/customers' : '/api/auth/providers';
      const result = await api.request<SessionView | { status: 'VERIFICATION_PENDING' }>(path, {
        method: 'POST',
        body: JSON.stringify({ displayName: displayName.trim(), email: email.trim(), password }),
      });
      setPassword('');
      if ('accountId' in result) setSession(result);
      setVerificationPending(true);
    } catch (failure) {
      setPassword('');
      if (failure instanceof ApiRequestError) {
        const fields = serverFields(failure.detail, t('field.required'), t('field.emailInvalid'));
        if (Object.keys(fields).length) setErrors(fields);
        else setRequestError(errorMessage(failure.detail, t));
      } else setRequestError(t('common.requestFailed'));
    } finally {
      setPending(false);
    }
  }

  if (verified) {
    return (
      <section className="auth-card">
        <FocusHeading>{t('auth.verified')}</FocusHeading>
        <Link to={role === 'CUSTOMER' ? '/' : '/provider/shop'}>{role === 'CUSTOMER' ? t('nav.services') : t('nav.provider')}</Link>
      </section>
    );
  }

  if (verificationPending) {
    return <Verification role={role} onVerified={() => setVerified(true)} />;
  }

  return (
    <section className="auth-card" aria-busy={pending}>
      <FocusHeading>{heading}</FocusHeading>
      <ValidationSummary errors={errors} />
      <RequestError message={requestError} />
      <form noValidate onSubmit={submit}>
        <FormField id="displayName" label={t('field.name')} value={displayName} onChange={(event) => setDisplayName(event.target.value)} error={errors.displayName} autoComplete="name" />
        <FormField id="email" label={t('field.email')} type="email" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} autoComplete="email" />
        <FormField id="password" label={t('field.password')} type="password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} autoComplete="new-password" />
        <button type="submit" disabled={pending}>{pending ? t('common.loading') : heading}</button>
      </form>
    </section>
  );
}

function Verification({ role, onVerified }: RegistrationProps & { onVerified: () => void }) {
  const { t } = useI18n();
  const { setSession } = useAuth();
  const [token, setToken] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [requestError, setRequestError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim()) {
      setErrors({ token: t('field.required') });
      return;
    }
    setErrors({});
    setRequestError(undefined);
    setPending(true);
    try {
      const path = role === 'CUSTOMER' ? '/api/auth/customers/verification' : '/api/auth/providers/verification';
      const session = await api.request<SessionView>(path, { method: 'POST', body: JSON.stringify({ token }) });
      setToken('');
      setSession(session);
      onVerified();
    } catch (failure) {
      setToken('');
      if (failure instanceof ApiRequestError) setRequestError(errorMessage(failure.detail, t));
      else setRequestError(t('common.requestFailed'));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="auth-card" aria-busy={pending}>
      <FocusHeading>{role === 'CUSTOMER' ? t('auth.verifyCustomer') : t('auth.verifyProvider')}</FocusHeading>
      <p>{t('auth.verificationPending')}</p>
      <ValidationSummary errors={errors} />
      <RequestError message={requestError} />
      <form noValidate onSubmit={submit}>
        <FormField id="token" label={t('field.token')} type="password" value={token} onChange={(event) => setToken(event.target.value)} error={errors.token} autoComplete="one-time-code" />
        <button type="submit" disabled={pending}>{pending ? t('common.loading') : t('action.submitVerification')}</button>
      </form>
    </section>
  );
}

export function CustomerRegistration() {
  return <Registration role="CUSTOMER" />;
}

export function ProviderRegistration() {
  return <Registration role="PROVIDER" />;
}

export function SignInPage() {
  const { t } = useI18n();
  const { session, setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [requestError, setRequestError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const resetEmail = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    const emailError = validateEmail(email, t('field.required'), t('field.emailInvalid'));
    if (emailError) nextErrors.email = emailError;
    if (!password) nextErrors.password = t('field.required');
    setErrors(nextErrors);
    setRequestError(undefined);
    if (Object.keys(nextErrors).length) return;
    setPending(true);
    try {
      const nextSession = await api.request<SessionView>('/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      setPassword('');
      setSession(nextSession);
      const requested = (location.state as { from?: string } | null)?.from;
      const fallback = nextSession.role === 'PROVIDER' ? '/provider/shop' : nextSession.role === 'ADMINISTRATOR' ? '/admin' : '/';
      navigate(requested ?? fallback, { replace: true });
    } catch (failure) {
      setPassword('');
      if (failure instanceof ApiRequestError) setRequestError(errorMessage(failure.detail, t));
      else setRequestError(t('common.requestFailed'));
    } finally {
      setPending(false);
    }
  }

  if (session) return <section className="auth-card"><FocusHeading>{t('auth.signedIn')}</FocusHeading></section>;

  return (
    <section className="auth-card" aria-busy={pending}>
      <FocusHeading>{t('auth.signIn')}</FocusHeading>
      <ValidationSummary errors={errors} />
      <RequestError message={requestError} />
      <form noValidate onSubmit={submit}>
        <FormField id="email" label={t('field.email')} type="email" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} autoComplete="email" />
        <FormField id="password" label={t('field.password')} type="password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} autoComplete="current-password" />
        <button type="submit" disabled={pending}>{pending ? t('common.loading') : t('auth.signIn')}</button>
      </form>
      <button
        className="text-button"
        type="button"
        aria-expanded={resetOpen}
        aria-controls="password-reset"
        onClick={() => {
          setResetOpen((open) => !open);
          queueMicrotask(() => resetEmail.current?.focus());
        }}
      >
        {t('auth.reset')}
      </button>
      {resetOpen ? <PasswordReset ref={resetEmail} /> : null}
    </section>
  );
}

const PasswordReset = ({ ref }: { ref: React.Ref<HTMLInputElement> }) => {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [stage, setStage] = useState<'request' | 'complete'>('request');
  const [message, setMessage] = useState<string>();
  const [requestError, setRequestError] = useState<string>();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailError = validateEmail(email, t('field.required'), t('field.emailInvalid'));
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }
    setErrors({});
    setPending(true);
    try {
      await api.request<{ status: 'ACCEPTED' }>('/api/auth/password-reset-requests', { method: 'POST', body: JSON.stringify({ email: email.trim() }) });
      setMessage(t('auth.resetRequested'));
      setStage('complete');
    } catch {
      setRequestError(t('common.requestFailed'));
    } finally {
      setPending(false);
    }
  }

  async function completeReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!token.trim()) nextErrors.token = t('field.required');
    if (!password) nextErrors.password = t('field.required');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setPending(true);
    try {
      await api.request<void>('/api/auth/password-resets', { method: 'POST', body: JSON.stringify({ token, password }) });
      setToken('');
      setPassword('');
      setMessage(t('auth.resetComplete'));
      setStage('request');
    } catch (failure) {
      setToken('');
      setPassword('');
      if (failure instanceof ApiRequestError) setRequestError(errorMessage(failure.detail, t));
      else setRequestError(t('common.requestFailed'));
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="password-reset" className="reset-panel" aria-busy={pending}>
      <h2>{t('auth.reset')}</h2>
      {message ? <p role="status">{message}</p> : null}
      <ValidationSummary errors={errors} fieldIds={{ email: 'reset-email', token: 'reset-token', password: 'reset-password' }} />
      <RequestError message={requestError} />
      {stage === 'request' ? (
        <form noValidate onSubmit={requestReset}>
          <FormField ref={ref} id="reset-email" label={t('field.email')} type="email" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} autoComplete="email" />
          <button type="submit" disabled={pending}>{pending ? t('common.loading') : t('action.requestReset')}</button>
        </form>
      ) : (
        <form noValidate onSubmit={completeReset}>
          <FormField id="reset-token" label={t('field.token')} type="password" value={token} onChange={(event) => setToken(event.target.value)} error={errors.token} autoComplete="one-time-code" />
          <FormField id="reset-password" label={t('field.newPassword')} type="password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} autoComplete="new-password" />
          <button type="submit" disabled={pending}>{pending ? t('common.loading') : t('action.changePassword')}</button>
        </form>
      )}
    </section>
  );
};

export function SignOutPage() {
  const { t } = useI18n();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [requestError, setRequestError] = useState<string>();

  async function submit() {
    setPending(true);
    setRequestError(undefined);
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch {
      setRequestError(t('common.requestFailed'));
      setPending(false);
    }
  }

  return (
    <section className="auth-card" aria-busy={pending}>
      <FocusHeading>{t('auth.signOut')}</FocusHeading>
      <RequestError message={requestError} />
      <button type="button" onClick={() => void submit()} disabled={pending}>
        {pending ? t('common.loading') : t('action.confirmSignOut')}
      </button>
    </section>
  );
}
