import { useEffect, useRef, type ReactNode } from 'react';
import { Navigate, createBrowserRouter, useLocation } from 'react-router-dom';
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
