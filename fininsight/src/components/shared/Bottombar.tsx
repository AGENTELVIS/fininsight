import { bottombarLinks } from '@/constants/index.ts';
import { Home, Wallet, Bell, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Bottombar = () => {
  const {pathname} = useLocation();
  const getIcon = (label: string) => {
    switch (label) {
      case 'Home':
        return <Home className="w-6 h-6" />;
      case 'Transactions':
        return <Wallet className="w-6 h-6" />;
      case 'Reminders':
        return <Bell className="w-6 h-6" />;
      case 'Records':
        return <FileText className="w-6 h-6" />;
      default:
        return null; // Or a default icon
    }
  };

  return (
    <section className='z-50 flex justify-between items-center w-full sticky bottom-0 rounded-t-[20px] bg-gray-800 px-5 py-4 md:hidden shadow-xl border-2'>
      {bottombarLinks.map((link)=> {
                const isActive = pathname == link.route;
                
                return (
                        <Link to={link.route} key={link.label} 
                        className={`${isActive && 'bg-green-600 rounded-[10px] '} flex justify-center flex-col gap-1 p-2 transition`}>
                          
                          {getIcon(link.label)}
                          <span>{link.label}</span>
                        </Link>
                )
            })}
    </section>
  )
}

export default Bottombar