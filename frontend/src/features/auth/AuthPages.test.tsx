import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../app/App';
import { router } from '../../app/routes';
import { publicError } from '../../api/client';
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

  it('preserves a protected destination when redirecting to sign in', async () => {
    await router.navigate('/cart');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeVisible();
    expect(router.state.location.state).toEqual({ from: '/cart' });
  });

  it('links reset validation to the reset field on the shared page', async () => {
    await router.navigate('/sign-in');
    render(<App />);
    await screen.findByRole('heading', { name: 'Sign in' });
    await userEvent.click(screen.getByRole('button', { name: 'Reset password' }));
    await userEvent.click(screen.getByRole('button', { name: 'Request reset instructions' }));
    expect(screen.getByRole('link', { name: 'This field is required.' })).toHaveAttribute('href', '#reset-email');
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
