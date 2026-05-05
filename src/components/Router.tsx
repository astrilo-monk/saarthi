import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/components/pages/HomePage';
import ChatPage from '@/components/pages/ChatPage';
import ForumPage from '@/components/pages/ForumPage';
import LoginPage from '@/components/pages/LoginPage';
import { Navigate } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
      {
        path: "forum",
        element: <ForumPage />,
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
  return <RouterProvider router={router} />;
}
