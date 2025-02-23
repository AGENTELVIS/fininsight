import { useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { useSignOutAccount } from '@/lib/react-query/queriesAndMutations'
import { useUserContext } from '@/context/AuthContext'
import { sidebarLinks } from '@/constants'
import { INavLink } from '@/types'

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate:signOut, isSuccess} = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess]);

  return (
    <nav className='hidden md:flex px-6 py-10 flex-col justify-between min-w-[270px] bg-gray-800'>
        <div className='flex flex-col gap-11'>
        <Link to="/" className='flex gap-3 items-center'>
                <img src='/assets/react.svg' alt='logo' width={50} height={36}/>
        </Link>

        <Link to={`/profile/${user.id}`} className='flex gap-3 items-center'>
            <img 
                src={user.imageUrl || "/assets/react.svg"}
                alt='profile'
                className='h-14 w-14 rounded-full'
            />
            <div className='flex flex-col'>
                <p className='font-bold'>
                    {user.name}
                </p>
            </div>
        </Link>

        <ul className='flex flex-col gap-6'>
            {sidebarLinks.map((link: INavLink)=> {
                const isActive = pathname == link.route;
                
                return (
                    <li key={link.label} className={`group rounded-lg base-medium hover:bg-gray-500 transition ${isActive && 'bg-gray-500'}`}>
                        <NavLink to={link.route} className='flex gap-4 items-center p-4'>
                            <img 
                                src={link.imgURL}
                                alt={link.label}
                                className={`group-hover:invert ${isActive && 'invert'}`}
                            />
                            {link.label}
                        </NavLink>
                    </li>
                )
            })}
        </ul>
        </div>

        <Button variant='ghost' 
        className='shad-button_ghost' 
        onClick={() => signOut()}>

            <img src='vite.svg' alt-="logout" />
            <p className='text-sm lg:text-sm'>Logout</p>
        </Button> 
    </nav>
  )
}

export default LeftSidebar