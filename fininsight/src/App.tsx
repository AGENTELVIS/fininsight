import { Route, Routes } from 'react-router-dom';
import './index.css';
import { CreateReminders, CreateTransactions, Home, Profile, RecordDetails, Records, UpdateProfile, UpdateReminders, UpdateTransactions } from './_root/pages';
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
          <Route path='/create-transactions' element={<CreateTransactions />} />
          <Route path='/update-transactions' element={<UpdateTransactions />} />
          <Route path='/create-reminders' element={<CreateReminders />} />
          <Route path='/update-reminders' element={<UpdateReminders />} />
          <Route path='/records' element={<Records />} />
          <Route path='/record-details/:id' element={<RecordDetails />} />
          <Route path='/profile/:id/*' element={<Profile />} />
          <Route path='/update-profile/:id' element={<UpdateProfile />} />
        </Route>
        
      </Routes>
      <Toaster />
    </main>
  )
}

export default App