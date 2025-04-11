import Topbar from '@/components/shared/Topbar.tsx'
import LeftSidebar from '@/components/shared/LeftSidebar.tsx'
import Bottombar from '@/components/shared/Bottombar.tsx'
import { Outlet } from 'react-router-dom'


const RootLayout = () => {
  return (
    <div className="w-full md:flex min-h-screen bg-gray-50">
    <Topbar />
    <LeftSidebar />
      <section className="flex flex-1 overflow-y-auto">
        <Outlet />
      </section>
      <Bottombar />
    </div>
  );
};

export default RootLayout