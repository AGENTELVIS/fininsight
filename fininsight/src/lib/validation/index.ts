import * as z from 'zod';

export const SignupValidation = z.object({
    name: z.string().min(3,{message: 'Name must be atleast 3 letters'} ),
    username: z.string().min(3,{message:'Username must be atleast 3 letters'}),
    email: z.string().email({message: 'Invalid email'}),
    password: z.string().min(8, {message:'Password must be 8 letters'})
  })

export const SigninValidation = z.object({
    email: z.string().email({message: 'Invalid email'}),
    password: z.string().min(8, {message:'Password must be 8 letters'})
  })

export const CardValidation = z.object({
    amount: z.coerce.number().positive().min(1),
    category: z.string().min(1,"Please select a category"),
    note:  z.string().max(2200),
    date: z.coerce.date(),
    type: z.string(),
})