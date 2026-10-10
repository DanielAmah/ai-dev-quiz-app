import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { HistoryProvider, ProfileProvider } from '@/state';
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
