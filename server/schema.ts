import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']).optional().default('user') // allow setting role for demo purposes
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const taskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional().default('pending')
});

export const taskUpdateSchema = taskSchema.partial();
