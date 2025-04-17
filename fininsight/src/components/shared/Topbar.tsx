import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../ui/button'
import { useSignOutAccount } from '@/lib/react-query/queriesAndMutations.ts'
import { useUserContext } from '@/context/AuthContext.tsx'
import { Home, ListChecks, FileText, LogOut, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const Topbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess]);

  const isProfilePage = pathname.startsWith('/profile');

  const getIcon = (label: string) => {
    switch (label) {
      case 'Home':
        return <Home className="w-5 h-5" />;
      case 'Transactions':
        return <ListChecks className="w-5 h-5" />;
      case 'Records':
        return <FileText className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <section className='sticky top-0 z-50 md:hidden bg-white w-full border-b'>
      <div className='flex justify-between items-center py-3 px-4'>
        <Link to="/" className='flex gap-3 items-center'>
          <img src='default-monochrome.svg' className='' alt='logo' width={100} height={60}/>
        </Link>

        <div className='flex items-center gap-4'>
          <div className='flex gap-4 absolute left-1/2 transform -translate-x-1/2'>
            <Link 
              to="/" 
              className={`p-2 rounded-md transition-colors ${
                pathname === "/" ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home className="w-5 h-5" />
            </Link>
            <Link 
              to="/create-transactions" 
              className={`p-2 rounded-md transition-colors ${
                pathname === "/create-transactions" ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ListChecks className="w-5 h-5" />
            </Link>
            <Link 
              to="/records" 
              className={`p-2 rounded-md transition-colors ${
                pathname === "/records" ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-5 h-5" />
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full p-0">
                <img 
                  src={user.imageUrl || '/assets/react.svg'}
                  alt='profile'
                  className='h-8 w-8 rounded-full object-cover'
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2">
              {!isProfilePage && (
                <>
                  <DropdownMenuItem asChild>
                    <Link 
                      to={`/profile/${user.id}`}
                      className="flex items-center gap-2 cursor-pointer px-2 py-1.5"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                </>
              )}
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 px-2 py-1.5"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </section>
  )
}

export default Topbar