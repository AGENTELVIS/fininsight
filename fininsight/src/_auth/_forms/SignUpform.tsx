import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { SignupValidation } from '@/lib/validation'
import Loader from '@/components/shared/Loader';
import { Link } from 'react-router-dom';
 
const SignUpform = () => {
  const isLoading = false;  
      // 1. Define your form.
  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name:'',
      username: "",
      email: "",
      password: "",
    },
  })
 
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof SignupValidation>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <html className="">
      <body className="">  
        <div className="">
            <Form {...form}>
              <div className='sm:w-420 flex-center flex-col'>
                <img src="" alt="logo"/>
                <h2 className='h3-bold md:h2-bold pt-5 sm:pt-12'>Create a new account</h2>
                
              
                <form onSubmit={form.handleSubmit(onSubmit)} className=" flex flex-col gap-5 w-full mt-4">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input type='text' className='shadow-lg' {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                            <Input type='text' className='shadow-lg' {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="Email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type='email' className='shadow-lg' {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="Password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type='password' className='shadow-lg' {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className='bg-blue-600 hover:bg-blue-800'>
                      {isLoading?(
                        <div className=''>
                          <Loader/>
                          
                        </div>
                      ): "Sign up"}
                    </Button>
                    <p className='text-sm text-black '> Already have an account ? 
                      <Link to='/sign-in' className="text-blue-700 font-semibold"> Sign in</Link>
                    </p>
                </form>
              </div>
            </Form>
        </div>
      </body>
    </html>
  )
}

export default SignUpform