import { Request, Response } from 'express';
import dbManager from '../db';
import { hashPassword, verifyPassword, generateToken } from '../utils';
import { loginSchema, registerSchema } from '../schema';

const { db } = dbManager;

export const register = async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);

  const existingUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(data.email, data.username);
  if (existingUser) {
    return res.status(400).json({ error: 'User with this email or username already exists' });
  }

  const hashedPassword = await hashPassword(data.password);

  const info = db.prepare(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)'
  ).run(data.username, data.email, hashedPassword, data.role);

  const newUser = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ message: 'User registered successfully', user: newUser });
};

export const login = async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(data.email) as any;
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isValid = await verifyPassword(data.password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken({ id: user.id, role: user.role, email: user.email });

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role }
  });
};
