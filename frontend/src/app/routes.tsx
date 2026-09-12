import { useEffect, useRef, type ReactNode } from 'react';
import { NavLink, Navigate, createBrowserRouter, useLocation } from 'react-router-dom';
import { rolesForPath, useAuth } from '../auth/AuthContext';
import { Layout } from '../components/Layout';
import { useI18n } from '../i18n';
import { CustomerRegistration, ProviderRegistration, SignInPage, SignOutPage } from '../features/auth/AuthPages';

function PageHeading({ children }: { children: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  return (
    <h1 ref={heading} tabIndex={-1}>
      {children}
    </h1>
  );
}

function ServicesPage() {
  const { t } = useI18n();
  return <PageHeading>{t('catalog.title')}</PageHeading>;
}

function HomePage() {
  const { t } = useI18n();
  return (
    <div className="home-page">
      <section className="home-hero">
        <p className="home-kicker">{t('home.kicker')}</p>
        <PageHeading>{t('home.title')}</PageHeading>
        <p className="home-intro">{t('home.intro')}</p>
        <div className="home-actions">
          <NavLink className="primary-link" to="/">{t('home.browse')}</NavLink>
          <NavLink to="/register/customer">{t('auth.registerCustomer')}</NavLink>
          <NavLink to="/register/provider">{t('auth.registerProvider')}</NavLink>
        </div>
      </section>
      <section aria-labelledby="home-benefits-title">
        <h2 id="home-benefits-title">{t('home.benefits.title')}</h2>
        <div className="benefit-grid">
          <article className="benefit-card">
            <h3>{t('home.benefits.discovery.title')}</h3>
            <p>{t('home.benefits.discovery.text')}</p>
          </article>
          <article className="benefit-card">
            <h3>{t('home.benefits.journey.title')}</h3>
            <p>{t('home.benefits.journey.text')}</p>
          </article>
          <article className="benefit-card">
            <h3>{t('home.benefits.roles.title')}</h3>
            <p>{t('home.benefits.roles.text')}</p>
          </article>
        </div>
      </section>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  if (loading) return <p aria-busy="true">{t('common.loading')}</p>;
  const requested = `${location.pathname}${location.search}${location.hash}`;
  if (!session) return <Navigate to="/sign-in" replace state={{ from: requested }} />;
  if (!rolesForPath(location.pathname)?.includes(session.role)) return <PageHeading>{t('common.accessDenied')}</PageHeading>;
  return children;
}

function ReservedPage() {
  const { t } = useI18n();
  return <PageHeading>{t('common.unavailable')}</PageHeading>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <ServicesPage /> },
      { path: 'home', element: <HomePage /> },
      { path: 'sign-in', element: <SignInPage /> },
      { path: 'sign-out', element: <SignOutPage /> },
      { path: 'register/customer', element: <CustomerRegistration /> },
      { path: 'register/provider', element: <ProviderRegistration /> },
      { path: 'cart', element: <ProtectedRoute><ReservedPage /></ProtectedRoute> },
      { path: 'orders', element: <ProtectedRoute><ReservedPage /></ProtectedRoute> },
      { path: 'provider/shop', element: <ProtectedRoute><ReservedPage /></ProtectedRoute> },
      { path: 'provider/bookings', element: <ProtectedRoute><ReservedPage /></ProtectedRoute> },
      { path: 'admin', element: <ProtectedRoute><ReservedPage /></ProtectedRoute> },
      { path: '*', element: <ReservedPage /> },
    ],
  },
]);
