import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { HistoryProvider } from '@/context/HistoryContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { router } from '@/routes';

export default function App() {
  return (
    <ErrorBoundary>
      <ProfileProvider>
        <HistoryProvider>
          <RouterProvider router={router} />
        </HistoryProvider>
      </ProfileProvider>
    </ErrorBoundary>
  );
}
