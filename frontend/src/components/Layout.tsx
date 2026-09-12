import { NavLink, Outlet } from 'react-router-dom';
import { hasRole, useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n';

export function Layout() {
  const { session, loading, error } = useAuth();
  const { language, setLanguage, t } = useI18n();

  return (
    <>
      <a className="skip-link" href="#main-content">
        {t('common.skip')}
      </a>
      <header>
        <div className="header-row">
          <NavLink className="brand" to="/">
            Service Booking Two
          </NavLink>
          <fieldset className="language-switch">
            <legend>{t('common.language')}</legend>
            <div className="language-actions">
              <button type="button" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>
                English
              </button>
              <button type="button" aria-pressed={language === 'de'} onClick={() => setLanguage('de')}>
                Deutsch
              </button>
            </div>
          </fieldset>
        </div>
        <nav aria-label={t('nav.primary')}>
          <NavLink to="/">{t('nav.services')}</NavLink>
          {hasRole(session, 'CUSTOMER') ? <NavLink to="/cart">{t('nav.cart')}</NavLink> : null}
          {hasRole(session, 'CUSTOMER') ? <NavLink to="/orders">{t('nav.orders')}</NavLink> : null}
          {hasRole(session, 'PROVIDER') ? <NavLink to="/provider/shop">{t('nav.provider')}</NavLink> : null}
          {hasRole(session, 'PROVIDER') ? <NavLink to="/provider/bookings">{t('nav.bookings')}</NavLink> : null}
          {hasRole(session, 'ADMINISTRATOR') ? <NavLink to="/admin">{t('nav.admin')}</NavLink> : null}
          {!loading && !session ? <NavLink to="/sign-in">{t('auth.signIn')}</NavLink> : null}
          {!loading && !session ? <NavLink to="/register/customer">{t('nav.customerRegistration')}</NavLink> : null}
          {!loading && !session ? <NavLink to="/register/provider">{t('nav.providerRegistration')}</NavLink> : null}
          {session ? <NavLink to="/sign-out">{t('auth.signOut')}</NavLink> : null}
        </nav>
        {loading ? <p aria-live="polite">{t('common.loading')}</p> : null}
        {error ? <p role="alert">{t('common.requestFailed')}</p> : null}
        {session ? <p className="session-status">{session.verified ? t('auth.verified') : t('auth.unverified')}</p> : null}
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
