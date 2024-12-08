import * as z from 'zod';

export const SignupValidation = z.object({
    name: z.string().min(3,{message: 'Name must be atleast 3 letters'} ),
    username: z.string().min(3,{message:'Username must be atleast 3 letters'}),
    email: z.string().email({message: 'Invalid email'}),
    password: z.string().min(8, {message:'Password must be 8 letters'})
  })