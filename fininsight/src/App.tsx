import { Route, Routes } from 'react-router-dom';
import './index.css';
import { Dashboard } from './_root/pages';
import SignInform from './_auth/_forms/SignInform';
import SignUpform from './_auth/_forms/SignUpform';
import AuthLayout from './_auth/AuthLayout';
import RootLayout from './_root/RootLayout';

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
          <Route index element={<Dashboard/>} />
        </Route>
        
      </Routes>
    </main>
  )
}

export default App