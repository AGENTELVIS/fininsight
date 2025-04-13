import { useUserContext } from '@/context/AuthContext';
import { Outlet, Navigate } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';

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

          <div className="hidden lg:block relative w-1/2 h-screen overflow-hidden bg-gradient-to-br from-blue-600/5 to-blue-800/5">
            <div className="h-full flex flex-col items-center justify-center gap-6 p-8">
              <div className="w-full max-w-md space-y-6">
                {/* Income Card */}
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500/20 p-3 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Track Income</h3>
                      <p className="text-sm text-gray-600">Monitor your earnings and financial growth</p>
                    </div>
                  </div>
                </div>

                {/* Expense Card */}
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-500/20 p-3 rounded-xl">
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Manage Expenses</h3>
                      <p className="text-sm text-gray-600">Keep track of your spending and stay within budget</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to FinInsight</h2>
                <p className="text-lg text-gray-600"></p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AuthLayout;