import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../app/App';
import { router } from '../../app/routes';
import { publicError, request, type Role } from '../../api/client';
import { CustomerRegistration } from './AuthPages';

const anonymousResponse = () =>
  new Response(
    JSON.stringify({
      code: 'AUTHENTICATION_REQUIRED',
      messageKey: 'error.authentication_required',
      fieldErrors: [],
      correlationId: '1de4aec9-512d-4ef4-8188-145308f76f07',
    }),
    { status: 401, headers: { 'Content-Type': 'application/json' } },
  );

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const signedInSession = (role: Role, verified = true) => ({
  accountId: '268db077-9fa1-44ca-9191-7a4faea4c83d',
  role,
  verified,
});

function mockSuccessfulSignIn(role: Role) {
  vi.mocked(fetch).mockImplementation(async (input, init) => {
    const path = String(input);
    if (path === '/api/auth/session' && (!init?.method || init.method === 'GET')) return anonymousResponse();
    if (path === '/api/auth/csrf') return jsonResponse({ token: 'csrf-sign-in' });
    if (path === '/api/auth/session' && init?.method === 'POST') return jsonResponse(signedInSession(role));
    return anonymousResponse();
  });
}

function mockSession(role: Role, verified: boolean) {
  vi.mocked(fetch).mockResolvedValue(jsonResponse(signedInSession(role, verified)));
}

function mockPasswordReset({ failFirstRequest = false }: { failFirstRequest?: boolean } = {}) {
  let resetRequests = 0;
  vi.mocked(fetch).mockImplementation(async (input, init) => {
    const path = String(input);
    if (path === '/api/auth/session' && (!init?.method || init.method === 'GET')) return anonymousResponse();
    if (path === '/api/auth/csrf') return jsonResponse({ token: `csrf-reset-${resetRequests}` });
    if (path === '/api/auth/password-reset-requests') {
      resetRequests += 1;
      if (failFirstRequest && resetRequests === 1) {
        return jsonResponse({ code: 'INTERNAL_ERROR', messageKey: 'error.internal_error', fieldErrors: [] }, 500);
      }
      return jsonResponse({ status: 'ACCEPTED' }, 202);
    }
    if (path === '/api/auth/password-resets') return new Response(null, { status: 204 });
    return anonymousResponse();
  });
}

async function openResetAndEnterEmail() {
  await screen.findByRole('heading', { name: 'Sign in' });
  await userEvent.click(screen.getByRole('button', { name: 'Reset password' }));
  const email = screen.getByLabelText('Email', { selector: '#reset-email' });
  await userEvent.type(email, 'person@example.test');
}

async function completeSignIn() {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText('Email'), 'person@example.test');
  await user.type(screen.getByLabelText('Password'), 'correct horse battery staple');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('authenticated bilingual shell', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => anonymousResponse()));
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await router.navigate('/');
  });

  it('falls back to English and persists Deutsch on this device', async () => {
    Object.defineProperty(navigator, 'languages', { value: ['fr-CH'], configurable: true });
    render(<App />);
    expect(await screen.findByRole('link', { name: 'Services' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Deutsch' }));
    expect(localStorage.getItem('service-booking-2-language')).toBe('de');
    expect(screen.getByRole('link', { name: 'Dienstleistungen' })).toBeVisible();
    expect(document.documentElement.lang).toBe('de');
  });

  it('localizes navigation and the native language group', async () => {
    render(<App />);
    expect(await screen.findByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
    expect(screen.getByRole('group', { name: 'Interface language' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Deutsch' }));
    expect(screen.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible();
    expect(screen.getByRole('group', { name: 'Sprache der Benutzeroberfläche' })).toBeVisible();
  });

  it('offers a dedicated home page while services remain at the root route', async () => {
    await router.navigate('/home');
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Local services, made simpler.' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Service Booking Two' })).toHaveAttribute('href', '/home');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home');
    expect(screen.getByRole('link', { name: 'Services' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('heading', { name: 'Why use Service Booking Two?' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Browse services' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Create customer account' })).toHaveAttribute(
      'href',
      '/register/customer',
    );
    expect(screen.getByRole('link', { name: 'Create provider account' })).toHaveAttribute(
      'href',
      '/register/provider',
    );
  });

  it('localizes the home page benefits in German', async () => {
    await router.navigate('/home');
    render(<App />);
    await screen.findByRole('heading', { name: 'Local services, made simpler.' });

    await userEvent.click(screen.getByRole('button', { name: 'Deutsch' }));

    expect(screen.getByRole('link', { name: 'Startseite' })).toHaveAttribute('href', '/home');
    expect(screen.getByRole('heading', { name: 'Lokale Dienstleistungen, einfacher gemacht.' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Warum Service Booking Two?' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Dienstleistungen entdecken' })).toHaveAttribute('href', '/');
  });

  it('labels email and links its API error', async () => {
    render(<CustomerRegistration />);
    const email = screen.getByLabelText('Email');
    await userEvent.type(email, 'invalid');
    await userEvent.click(screen.getByRole('button', { name: 'Create customer account' }));
    expect(email).toHaveAccessibleDescription('Enter a valid email address.');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveFocus();
  });

  it('hides privileged navigation from an anonymous session', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument());
    expect(screen.queryByRole('link', { name: 'Cart' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Provider' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Administration' })).not.toBeInTheDocument();
  });

  it('shows only the signed-in role navigation', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ accountId: '268db077-9fa1-44ca-9191-7a4faea4c83d', role: 'CUSTOMER', verified: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    render(<App />);
    expect(await screen.findByRole('link', { name: 'Cart' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Provider' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Administration' })).not.toBeInTheDocument();
  });

  it('provides keyboard-operable navigation and a skip link', async () => {
    render(<App />);
    const user = userEvent.setup();
    await screen.findByRole('link', { name: 'Services' });
    (document.activeElement as HTMLElement).blur();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveFocus();
  });

  it('maps AUTHENTICATION_REQUIRED to the bilingual sign-in UI and preserves the destination', async () => {
    await router.navigate('/cart');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Deutsch' }));
    expect(screen.getByRole('heading', { name: 'Anmelden' })).toBeVisible();
    expect(router.state.location.state).toEqual({ from: '/cart' });
    expect(document.body).not.toHaveTextContent(/AUTHENTICATION_REQUIRED|error\.authentication_required|1de4aec9/);
  });

  it('rejects a saved customer destination after provider sign-in', async () => {
    mockSuccessfulSignIn('PROVIDER');
    await router.navigate('/cart?mode=selected#checkout');
    render(<App />);
    await completeSignIn();
    await waitFor(() => expect(router.state.location.pathname).toBe('/provider/shop'));
    expect(router.state.location.search).toBe('');
    expect(router.state.location.hash).toBe('');
  });

  it('restores an allowed destination with its query and hash', async () => {
    mockSuccessfulSignIn('CUSTOMER');
    await router.navigate('/orders?status=open#latest');
    render(<App />);
    await completeSignIn();
    await waitFor(() => expect(router.state.location.pathname).toBe('/orders'));
    expect(router.state.location.search).toBe('?status=open');
    expect(router.state.location.hash).toBe('#latest');
  });

  it('links reset validation to the reset field on the shared page', async () => {
    await router.navigate('/sign-in');
    render(<App />);
    await screen.findByRole('heading', { name: 'Sign in' });
    await userEvent.click(screen.getByRole('button', { name: 'Reset password' }));
    await userEvent.click(screen.getByRole('button', { name: 'Request reset instructions' }));
    expect(screen.getByRole('link', { name: 'This field is required.' })).toHaveAttribute('href', '#reset-email');
  });

  it('clears a reset request failure and focuses the successful acknowledgment heading', async () => {
    mockPasswordReset({ failFirstRequest: true });
    await router.navigate('/sign-in');
    render(<App />);
    await openResetAndEnterEmail();
    await userEvent.click(screen.getByRole('button', { name: 'Request reset instructions' }));
    expect(await screen.findByRole('heading', { name: 'This request could not be completed.' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Request reset instructions' }));
    const acknowledgment = await screen.findByRole('heading', {
      name: 'If this account exists, reset instructions are available through the simulated process.',
    });
    expect(acknowledgment).toHaveFocus();
    expect(screen.queryByText('This request could not be completed.')).not.toBeInTheDocument();
  });

  it('closes reset after completion and returns focus to the sign-in heading', async () => {
    mockPasswordReset();
    await router.navigate('/sign-in');
    render(<App />);
    await openResetAndEnterEmail();
    await userEvent.click(screen.getByRole('button', { name: 'Request reset instructions' }));
    await userEvent.type(await screen.findByLabelText('Verification or reset credential'), 'reset-secret');
    await userEvent.type(screen.getByLabelText('New password'), 'replacement-secret');
    await userEvent.click(screen.getByRole('button', { name: 'Change password' }));
    const signInHeading = await screen.findByRole('heading', { name: 'Sign in' });
    expect(signInHeading).toHaveFocus();
    expect(document.getElementById('password-reset')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Password changed. Sign in again.');
  });

  it('uses same-origin credentials and refreshes CSRF after rotating mutations', async () => {
    let csrfCount = 0;
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === '/api/auth/csrf') return jsonResponse({ token: `csrf-${++csrfCount}` });
      if (path === '/api/auth/session' && init?.method === 'POST') return jsonResponse(signedInSession('CUSTOMER'));
      if (path === '/api/auth/session' && init?.method === 'DELETE') return new Response(null, { status: 204 });
      return anonymousResponse();
    });

    await request('/api/auth/session', { method: 'POST', body: JSON.stringify({ email: 'a@example.test', password: 'secret' }) });
    await request('/api/auth/session', { method: 'DELETE' });

    const calls = vi.mocked(fetch).mock.calls;
    expect(calls.map(([input]) => String(input))).toEqual([
      '/api/auth/csrf',
      '/api/auth/session',
      '/api/auth/csrf',
      '/api/auth/session',
    ]);
    expect(calls.every(([, init]) => init?.credentials === 'same-origin')).toBe(true);
    expect(new Headers(calls[1]?.[1]?.headers).get('X-CSRF-TOKEN')).toBe('csrf-1');
    expect(new Headers(calls[3]?.[1]?.headers).get('X-CSRF-TOKEN')).toBe('csrf-2');
    await expect(request('https://attacker.example/api/session')).rejects.toThrow('same-origin');
  });

  it('refreshes CSRF after a rejected mutation', async () => {
    let csrfCount = 0;
    let mutationCount = 0;
    vi.mocked(fetch).mockImplementation(async (input) => {
      const path = String(input);
      if (path === '/api/auth/csrf') return jsonResponse({ token: `csrf-recovery-${++csrfCount}` });
      if (path === '/api/auth/session') {
        mutationCount += 1;
        if (mutationCount === 1) {
          return jsonResponse(
            {
              code: 'INVALID_CREDENTIALS',
              messageKey: 'error.invalid_credentials',
              fieldErrors: [],
              correlationId: 'bf5234ea-60ad-410a-a23b-27a85533f806',
            },
            401,
          );
        }
        return jsonResponse(signedInSession('CUSTOMER'));
      }
      return anonymousResponse();
    });

    await expect(
      request('/api/auth/session', { method: 'POST', body: JSON.stringify({ email: 'a@example.test', password: 'wrong' }) }),
    ).rejects.toMatchObject({ detail: { code: 'INVALID_CREDENTIALS' } });
    await request('/api/auth/session', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@example.test', password: 'correct horse battery staple' }),
    });

    const mutationCalls = vi.mocked(fetch).mock.calls.filter(([input]) => String(input) === '/api/auth/session');
    expect(csrfCount).toBe(2);
    expect(new Headers(mutationCalls[0]?.[1]?.headers).get('X-CSRF-TOKEN')).toBe('csrf-recovery-1');
    expect(new Headers(mutationCalls[1]?.[1]?.headers).get('X-CSRF-TOKEN')).toBe('csrf-recovery-2');
  });

  it('signs out through a credentialed CSRF mutation and clears the shell session', async () => {
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === '/api/auth/session' && (!init?.method || init.method === 'GET')) return jsonResponse(signedInSession('CUSTOMER'));
      if (path === '/api/auth/csrf') return jsonResponse({ token: 'csrf-sign-out' });
      if (path === '/api/auth/session' && init?.method === 'DELETE') return new Response(null, { status: 204 });
      return anonymousResponse();
    });
    await router.navigate('/sign-out');
    render(<App />);
    await userEvent.click(await screen.findByRole('button', { name: 'Confirm sign out' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(await screen.findByRole('link', { name: 'Sign in' })).toBeVisible();
    const deleteCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'DELETE');
    expect(new Headers(deleteCall?.[1]?.headers).get('X-CSRF-TOKEN')).toBe('csrf-sign-out');
  });

  it('registers and verifies a customer through rotating CSRF requests', async () => {
    let csrfCount = 0;
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === '/api/auth/session' && (!init?.method || init.method === 'GET')) return anonymousResponse();
      if (path === '/api/auth/csrf') return jsonResponse({ token: `csrf-customer-${++csrfCount}` });
      if (path === '/api/auth/customers') return jsonResponse(signedInSession('CUSTOMER', false), 201);
      if (path === '/api/auth/customers/verification') return jsonResponse(signedInSession('CUSTOMER', true));
      return anonymousResponse();
    });
    await router.navigate('/register/customer');
    render(<App />);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Name'), 'Customer Person');
    await user.type(screen.getByLabelText('Email'), 'customer@example.test');
    await user.type(screen.getByLabelText('Password'), 'registration-secret');
    await user.click(screen.getByRole('button', { name: 'Create customer account' }));
    await user.type(await screen.findByLabelText('Verification or reset credential'), 'customer-verification-secret');
    await user.click(screen.getByRole('button', { name: 'Verify account' }));
    expect(await screen.findByRole('heading', { name: 'Account verified.' })).toBeVisible();
    expect(csrfCount).toBe(2);
    expect(document.body).not.toHaveTextContent('registration-secret');
    expect(document.body).not.toHaveTextContent('customer-verification-secret');
  });

  it('registers and verifies a provider through the pending acknowledgment', async () => {
    let csrfCount = 0;
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === '/api/auth/session' && (!init?.method || init.method === 'GET')) return anonymousResponse();
      if (path === '/api/auth/csrf') return jsonResponse({ token: `csrf-provider-${++csrfCount}` });
      if (path === '/api/auth/providers') return jsonResponse({ status: 'VERIFICATION_PENDING' }, 201);
      if (path === '/api/auth/providers/verification') return jsonResponse(signedInSession('PROVIDER', true));
      return anonymousResponse();
    });
    await router.navigate('/register/provider');
    render(<App />);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Name'), 'Provider Person');
    await user.type(screen.getByLabelText('Email'), 'provider@example.test');
    await user.type(screen.getByLabelText('Password'), 'provider-registration-secret');
    await user.click(screen.getByRole('button', { name: 'Create provider account' }));
    expect(await screen.findByText('Complete the simulated email verification.')).toBeVisible();
    await user.type(screen.getByLabelText('Verification or reset credential'), 'provider-verification-secret');
    await user.click(screen.getByRole('button', { name: 'Verify account' }));
    expect(await screen.findByRole('heading', { name: 'Account verified.' })).toBeVisible();
    expect(within(screen.getByRole('main')).getByRole('link', { name: 'Provider' })).toHaveAttribute('href', '/provider/shop');
    expect(csrfCount).toBe(2);
  });

  it('shows a generic failed sign-in and clears the submitted password', async () => {
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === '/api/auth/session' && (!init?.method || init.method === 'GET')) return anonymousResponse();
      if (path === '/api/auth/csrf') return jsonResponse({ token: 'csrf-failed-sign-in' });
      if (path === '/api/auth/session' && init?.method === 'POST') {
        return jsonResponse(
          {
            code: 'INVALID_CREDENTIALS',
            messageKey: 'error.invalid_credentials',
            fieldErrors: [],
            correlationId: 'b1de2ebf-85e0-449e-bc62-f4d638817575',
          },
          401,
        );
      }
      return anonymousResponse();
    });
    await router.navigate('/sign-in');
    render(<App />);
    await completeSignIn();
    expect(await screen.findByRole('heading', { name: 'Email or password is incorrect.' })).toBeVisible();
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(document.body).not.toHaveTextContent(/INVALID_CREDENTIALS|error\.invalid_credentials|b1de2ebf/);
  });

  it('maps PROVIDER_SUSPENDED to the safe German sign-in error', async () => {
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === '/api/auth/session' && (!init?.method || init.method === 'GET')) return anonymousResponse();
      if (path === '/api/auth/csrf') return jsonResponse({ token: 'csrf-suspended-provider' });
      if (path === '/api/auth/session' && init?.method === 'POST') {
        return jsonResponse(
          {
            code: 'PROVIDER_SUSPENDED',
            messageKey: 'error.provider_suspended',
            fieldErrors: [],
            correlationId: 'a252b229-09a2-4648-b834-a2b207175a88',
          },
          403,
        );
      }
      return anonymousResponse();
    });
    await router.navigate('/sign-in');
    render(<App />);
    await screen.findByRole('heading', { name: 'Sign in' });
    await userEvent.click(screen.getByRole('button', { name: 'Deutsch' }));
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('E-Mail-Adresse'), 'provider@example.test');
    await user.type(screen.getByLabelText('Passwort'), 'correct horse battery staple');
    await user.click(screen.getByRole('button', { name: 'Anmelden' }));
    expect(await screen.findByRole('heading', { name: 'Der Anbieterzugang ist gesperrt.' })).toBeVisible();
    expect(screen.getByLabelText('Passwort')).toHaveValue('');
    expect(document.body).not.toHaveTextContent(/PROVIDER_SUSPENDED|error\.provider_suspended|a252b229/);
  });

  it('resumes customer verification from an unverified session after reload', async () => {
    mockSession('CUSTOMER', false);
    await router.navigate('/register/customer');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Verify your customer account before reserving or paying.' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Create customer account' })).not.toBeInTheDocument();
  });

  it('redirects an incompatible signed-in role away from registration', async () => {
    mockSession('PROVIDER', true);
    await router.navigate('/register/customer');
    render(<App />);
    await waitFor(() => expect(router.state.location.pathname).toBe('/provider/shop'));
  });

  it('does not expose a registration form while the session is unresolved', async () => {
    vi.mocked(fetch).mockImplementation(() => new Promise<Response>(() => undefined));
    await router.navigate('/register/customer');
    render(<App />);
    expect(within(screen.getByRole('main')).getByText('Loading…')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Create customer account' })).not.toBeInTheDocument();
  });

  it('offers an intentional provider verification resume entry', async () => {
    await router.navigate('/register/provider');
    render(<App />);
    await screen.findByRole('heading', { name: 'Create provider account' });
    await userEvent.click(screen.getByRole('button', { name: 'I have a verification credential' }));
    expect(screen.getByRole('heading', { name: 'Verify your provider account before publishing.' })).toBeVisible();
  });

  it('redacts secret values from an API error', () => {
    expect(publicError({ code: 'AUTH_FAILED', message: 'token=4931 password=hunter2' }).message).toBe(
      'Authentication failed.',
    );
    expect(JSON.stringify(publicError({ code: 'UNKNOWN', token: '4931', password: 'hunter2' }))).not.toMatch(
      /4931|hunter2/,
    );
  });
});
