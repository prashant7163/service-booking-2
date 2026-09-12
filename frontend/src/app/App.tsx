import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { I18nProvider } from '../i18n';
import { router } from './routes';

export function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </I18nProvider>
  );
}
