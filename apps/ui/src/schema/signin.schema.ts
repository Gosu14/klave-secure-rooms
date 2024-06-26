import { z } from 'zod';

export const signinSchema = z.object({
    name: z.string().min(4, {
        message: 'Name must be at least 4 characters.'
    }),
    password: z.string().min(4, {
        message: 'Password must be at least 4 characters.'
    })
});

export type SigninFormType = z.infer<typeof signinSchema>;
