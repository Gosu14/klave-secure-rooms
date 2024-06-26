import { z } from 'zod';

export const registerSchema = z
    .object({
        name: z
            .string()
            .min(4, {
                message: 'Name must be at least 4 characters.'
            })
            .max(16, { message: 'Name must be at most 16 characters.' }),
        password: z.string().min(4, {
            message: 'Password must be at least 4 characters.'
        }),
        confirmPassword: z.string().min(4, {
            message: 'Confirm password must be at least 4 characters.'
        })
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match.",
        path: ['confirmPassword'] // path of error
    });

export type RegisterFormType = z.infer<typeof registerSchema>;
