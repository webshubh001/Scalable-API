import { Router } from 'express';
import { register, login } from './controllers/auth';
import { getTasks, getTaskById, createTask, updateTask, deleteTask } from './controllers/tasks';
import { authenticate } from './middlewares';

const router = Router();

// Auth Routes (Public)
router.post('/auth/register', register);
router.post('/auth/login', login);

// Task Routes (Protected)
router.get('/tasks', authenticate, getTasks);
router.post('/tasks', authenticate, createTask);
router.get('/tasks/:id', authenticate, getTaskById);
router.put('/tasks/:id', authenticate, updateTask);
router.delete('/tasks/:id', authenticate, deleteTask);

export default router;
