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
    amount: z.coerce.number().positive().min(1).max(9999999),
    category: z.string().min(1,"Please select a category"),
    note:  z.string().max(2200),
    date: z.coerce.date(),
    type: z.string(),
    account: z.string().min(1),
    isRecurring:z.boolean().default(false),
    interval: z.string().optional(),
    enddate: z.coerce.date().optional()
  })
    .superRefine((data, ctx) => {
      const today = new Date();
      const date = new Date(data.date); // Convert to Date object
      today.setHours(0, 0, 0, 0); // Normalize today's date to remove time part
    
      // Start date validation: If recurring, date must be today or future
      if (data.isRecurring && date.getTime() < today.getTime()) {
        ctx.addIssue({
          code: "custom",
          path: ["date"],
          message: "Start date cannot be in the past for recurring transactions.",
        });
      }
    
      // End date validation: Must be after start date
      if (data.enddate) {
        const enddate = new Date(data.enddate); // Convert to Date object
    
        if (enddate.getTime() <= date.getTime()) {
          ctx.addIssue({
            code: "custom",
            path: ["enddate"],
            message: "End date must be after the start date.",
          });
        }
      }
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
  startDate:z.coerce.date().optional(),
})