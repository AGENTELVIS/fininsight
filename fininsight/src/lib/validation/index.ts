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
    amount: z.coerce.number().positive().min(1,"Amount must be greater than 0").max(9999999),
    category: z.string().min(1,"Please select a category"),
    note: z.string().max(2200),
    date: z.coerce.date()
        .refine((date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const inputDate = new Date(date);
            inputDate.setHours(0, 0, 0, 0);
            return inputDate <= today;
        }, "Cannot add transactions for future dates"),
    type: z.string(),
    account: z.string().min(1,"Please select an Account"),
    imageId: z.string().optional(),
    imageUrl: z.string().optional().refine((val) => {
      return !val || /^https?:\/\/.+$/.test(val);
    }, { message: "Invalid url" }),
});

export const AccountValidation = z.object({
      name: z.string().min(1,"Name is required"),
      amount: z.coerce.number().positive().min(1).max(9999999),
})

export const BudgetValidation = z.object({
  amount: z.coerce.number().positive().min(1).max(9999999),
  category: z.string().min(1,"Please select a category"),
  period: z.string(),
  periodNumber: z.coerce.number().min(1),
  startDate: z.coerce.date().optional(),
})

export const ProfileValidation = z.object({
  file: z.custom<File[]>(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email(),
});
