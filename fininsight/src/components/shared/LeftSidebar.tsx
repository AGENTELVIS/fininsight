import { useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useSignOutAccount } from '@/lib/react-query/queriesAndMutations.ts';
import { useUserContext } from '@/context/AuthContext.tsx';
import { sidebarLinks } from '@/constants/index.ts';
import { INavLink } from '@/types';
import { Home, Wallet, ListChecks, FileText } from 'lucide-react';

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess]);

  const getIcon = (label: string) => {
    switch (label) {
      case 'Home':
        return <Home className="w-6 h-6" />;
      case 'Budgets':
        return <Wallet className="w-6 h-6" />;
      case 'Transactions':
        return <ListChecks className="w-6 h-6" />;
      case 'Records':
        return <FileText className="w-6 h-6" />;
      default:
        return null; // Or a default icon
    }
  };
  
  return (
    <nav className="hidden md:flex flex-col justify-between w-72 bg-slate-50 shadow-xl rounded-xl border-2 m-3 z-10">
      <div className="flex flex-col gap-10 p-5">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="default-monochrome.svg"
            alt="logo"
            className="w-[160px] transition-all duration-300"
          />
        </Link>

        {/* User */}
        <Link to={`/profile/${user.id}`} className="flex items-center gap-3">
          <img
            src={user.imageUrl || '/assets/react.svg'}
            alt="profile"
            className="h-12 w-12 rounded-full object-cover"
          />
          <p className="font-bold truncate">
            {user.name}
          </p>
        </Link>

        {/* Links */}
        <ul className="flex flex-col gap-3">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;

            return (
              <li
                key={link.label}
                className={`group/item rounded-lg transition ${isActive ? 'bg-green-600' : ''}`}
              >
                <NavLink
                  to={link.route}
                  className="flex items-center gap-4 p-4"
                >
                  {/* Add icon here */}
                  {getIcon(link.label)}
                  <span>{link.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Logout Button */}
      <Button
        variant="ghost"
        className="flex gap-2 items-center text-red-500 p-5 m-4"
        onClick={() => signOut()}
      >
        <img src="vite.svg" alt="logout" className="w-5 h-5" />
        <p className="text-sm">Logout</p>
      </Button>
    </nav>
  );
};

export default LeftSidebar;