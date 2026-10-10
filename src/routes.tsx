import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import HistoryPage from '@/pages/HistoryPage';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProfilePage from '@/pages/ProfilePage';
import QuizPage from '@/pages/QuizPage';
import ResultsPage from '@/pages/ResultsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'quiz/:quizId', element: <QuizPage /> },
      { path: 'results/:attemptId', element: <ResultsPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
