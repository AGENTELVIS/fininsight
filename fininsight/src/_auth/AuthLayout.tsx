import { useUserContext } from '@/context/AuthContext';
import { Outlet, Navigate } from 'react-router-dom';

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) {
    return (
      <div className="flex-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <>
          <section className="flex flex-1 justify-center items-center flex-col py-10">
            <Outlet />
          </section>

          <img 
            src="/assets/logo.png"
            alt="logo"
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
          />
        </>
      )}
    </>
  );
};

export default AuthLayout;