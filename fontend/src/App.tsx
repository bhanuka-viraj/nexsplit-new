import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';

import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { GroupsListPage } from '@/features/groups/GroupsListPage';
import { GroupDetailsPage } from '@/features/groups/GroupDetailsPage';

const queryClient = new QueryClient();

// Placeholder components for routes

import { ActivityPage } from '@/features/activity/ActivityPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { DebtsPage } from '@/features/debts/DebtsPage';

import { AuthLayout } from '@/features/auth/AuthLayout';
import { SignInPage } from '@/features/auth/SignInPage';
import { SignUpPage } from '@/features/auth/SignUpPage';
import { AuthGuard } from '@/features/auth/AuthGuard';

const router = createBrowserRouter([
  // Auth Routes
  {
    element: <AuthLayout />,
    children: [
      { path: 'signin', element: <SignInPage /> },
      { path: 'signup', element: <SignUpPage /> },
    ]
  },
  // Protected Routes (Main App)
  {
    path: '/',
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'activity', // New route
        element: <ActivityPage />,
      },
      {
        path: 'debts',
        element: <DebtsPage />,
      },
      {
        path: 'groups',
        element: <GroupsListPage />,
      },
      {
        path: 'groups/:groupId',
        element: <GroupDetailsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
