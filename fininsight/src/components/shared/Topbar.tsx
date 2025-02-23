import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { useSignOutAccount } from '@/lib/react-query/queriesAndMutations'
import { useUserContext } from '@/context/AuthContext'

const Topbar = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate:signOut, isSuccess} = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess]);

  return (
    <section className='sticky top-0 z-50 md:hidden bg-gray-800 w-full'>
        <div className='flex justify-between py-4 px-5'>
            <Link to="/" className='flex gap-3 items-center'>
                <img src='/assets/react.svg' alt='logo' width={40} height={32}/>
            </Link>

            <div className='flex gap-4'>
                <Button variant='ghost' className='shad-button_ghost' onClick={() => signOut()}>
                    <img src='vite.svg' alt-="logout" />
                </Button> 

                <Link to={`/profile/${user.id}`} className='flex justify-center gap-3'>
                    <img 
                        src={user.imageUrl || '/assets/react.svg'}
                        alt='profile'
                        className='h-8 w-8 rounded-full'/>
                </Link>
            </div>
        </div>

    </section>
  )
}

export default Topbar