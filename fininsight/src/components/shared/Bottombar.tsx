import { bottombarLinks } from '@/constants/index.ts';
import { Link, useLocation } from 'react-router-dom';

const Bottombar = () => {
  const {pathname} = useLocation();
  return (
    <section className='z-50 flex justify-between items-center w-full sticky bottom-0 rounded-t-[20px] bg-gray-500 px-5 py-4 md:hidden'>
      {bottombarLinks.map((link)=> {
                const isActive = pathname == link.route;
                
                return (
                        <Link to={link.route} key={link.label} 
                        className={`${isActive && 'bg-gray-500 rounded-[10px] '} flex justify-center flex-col gap-1 p-2 transition`}>
                            <img 
                                src={link.imgURL}
                                alt={link.label}
                                className={`${isActive && 'invert'}`}
                                width={16}
                                height={16}
                            />
                            <p className='font-light text-slate-50'>{link.label}</p>
                        </Link>
                )
            })}
    </section>
  )
}

export default Bottombar