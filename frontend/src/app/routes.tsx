import { useEffect, useRef, type ReactNode } from 'react';
import { Navigate, createBrowserRouter, useLocation } from 'react-router-dom';
import { type Role } from '../api/client';
import { useAuth } from '../auth/AuthContext';
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

function ProtectedRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { session, loading } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  if (loading) return <p aria-busy="true">{t('common.loading')}</p>;
  if (!session) return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  if (!roles.includes(session.role)) return <PageHeading>{t('common.accessDenied')}</PageHeading>;
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
      { path: 'cart', element: <ProtectedRoute roles={['CUSTOMER']}><ReservedPage /></ProtectedRoute> },
      { path: 'orders', element: <ProtectedRoute roles={['CUSTOMER']}><ReservedPage /></ProtectedRoute> },
      { path: 'provider/shop', element: <ProtectedRoute roles={['PROVIDER']}><ReservedPage /></ProtectedRoute> },
      { path: 'provider/bookings', element: <ProtectedRoute roles={['PROVIDER']}><ReservedPage /></ProtectedRoute> },
      { path: 'admin', element: <ProtectedRoute roles={['ADMINISTRATOR']}><ReservedPage /></ProtectedRoute> },
      { path: '*', element: <ReservedPage /> },
    ],
  },
]);
