import Topbar from '@/components/shared/Topbar.tsx'
import LeftSidebar from '@/components/shared/LeftSidebar.tsx'
import { Outlet, Navigate } from 'react-router-dom'
import { useUserContext } from '@/context/AuthContext'

const RootLayout = () => {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) {
    return (
      <div className="flex-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="w-full md:flex min-h-screen bg-gray-50">
      <Topbar />
      <LeftSidebar />
      <section className="flex flex-1 overflow-y-auto">
        <Outlet />
      </section>
    </div>
  );
};

export default RootLayout;