import { Route, Routes } from 'react-router-dom';
import './index.css';
import { CreateTransactions, Home, Profile, RecordDetails, Records, UpdateProfile, UpdateTransactions } from './_root/pages/Index.ts';
import SignInform from './_auth/_forms/SignInform';
import SignUpform from './_auth/_forms/SignUpform';
import AuthLayout from './_auth/AuthLayout';
import RootLayout from './_root/RootLayout';
import { Toaster } from "@/components/ui/toaster"
import UploadTransactions from './_root/pages/UploadTransactions.tsx';

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
          <Route path='/update-transactions' element={<UpdateTransactions />} />
          <Route path='/records' element={<Records />} />
          <Route path='/record-details/:id' element={<RecordDetails />} />
          <Route path='/upload-transactions'  element={<UploadTransactions/>}/>
          <Route path='/profile/:id/*' element={<Profile />} />
          <Route path='/update-profile/:id' element={<UpdateProfile />} />
        </Route>
        
      </Routes>
      <Toaster />
    </main>
  )
}

export default App