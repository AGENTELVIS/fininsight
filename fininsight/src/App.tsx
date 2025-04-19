import { Route, Routes } from 'react-router-dom';
import './index.css';
import { CreateTransactions, Home, Profile, Records } from './_root/pages/Index.ts';
import SignInform from './_auth/_forms/SignInform';
import SignUpform from './_auth/_forms/SignUpform';
import AuthLayout from './_auth/AuthLayout';
import RootLayout from './_root/RootLayout';
import { Toaster } from "@/components/ui/toaster"


const App = () => {
  return (
    <main className='flex h-screen'>
      <Routes>
        {/* public routes */}
        <Route element={<AuthLayout/>} >
          <Route path='/sign-in' element={<SignInform/>} />
          <Route path='/sign-up' element={<SignUpform/>} />
        </Route>

        {/* private routes */}
        <Route element={<RootLayout/>} >
          <Route index element={<Home/>} />
          <Route path='/create-transactions' element={<CreateTransactions/>} />
          <Route path='/records' element={<Records />} />
          <Route path='/profile/:id/*' element={<Profile />} />
        </Route>
        
      </Routes>
      <Toaster />
    </main>
  )
}

export default App