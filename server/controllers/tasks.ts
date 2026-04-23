import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares';
import dbManager from '../db';
import { taskSchema, taskUpdateSchema } from '../schema';

const { db } = dbManager;

export const getTasks = async (req: AuthRequest, res: Response) => {
  // Admins see all tasks, users see their own
  if (req.user?.role === 'admin') {
    const tasks = db.prepare('SELECT * FROM tasks').all();
    return res.json(tasks);
  }
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(req.user?.id);
  res.json(tasks);
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (req.user?.role !== 'admin' && task.user_id !== req.user?.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(task);
};

export const createTask = async (req: AuthRequest, res: Response) => {
  const data = taskSchema.parse(req.body);
  const info = db.prepare(
    'INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)'
  ).run(data.title, data.description || null, data.status, req.user?.id);

  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(newTask);
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (req.user?.role !== 'admin' && task.user_id !== req.user?.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const data = taskUpdateSchema.parse(req.body);
  const updatedTitle = data.title !== undefined ? data.title : task.title;
  const updatedDesc = data.description !== undefined ? data.description : task.description;
  const updatedStatus = data.status !== undefined ? data.status : task.status;

  db.prepare(
    'UPDATE tasks SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(updatedTitle, updatedDesc, updatedStatus, req.params.id);

  const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json(updatedTask);
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (req.user?.role !== 'admin' && task.user_id !== req.user?.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.status(204).send();
};
