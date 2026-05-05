import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';
import { AdminProtectedRoute } from '@/components/ui/admin-protected-route';
import Layout from '@/components/Layout';
import HomePage from '@/components/pages/HomePage';
import ChatPage from '@/components/pages/ChatPage';
import BookingPage from '@/components/pages/BookingPage';
import ResourcesPage from '@/components/pages/ResourcesPage';
import ForumPage from '@/components/pages/ForumPage';
import AdminPage from '@/components/pages/AdminPage';
import AdminLoginPage from '@/components/pages/AdminLoginPage';
import ProfilePage from '@/components/pages/ProfilePage';
import PlantGamePage from '@/components/pages/PlantGamePage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />, // MIXED ROUTE: Shows different content for authenticated vs anonymous users
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
      {
        path: "booking",
        element: <BookingPage />,
      },
      {
        path: "resources",
        element: <ResourcesPage />,
      },
      {
        path: "forum",
        element: <ForumPage />,
      },
      {
        path: "admin-login",
        element: <AdminLoginPage />,
      },
      {
        path: "admin",
        element: (
          <AdminProtectedRoute messageToSignIn="Sign in with admin or counselor credentials to access the dashboard">
            <AdminPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "plant-game",
        element: <PlantGamePage />,
      },
      {
        path: "profile",
        element: (
          <MemberProtectedRoute messageToSignIn="Sign in to access your profile">
            <ProfilePage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: "/",
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
