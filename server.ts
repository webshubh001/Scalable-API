import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { createServer as createViteServer } from 'vite';
import * as path from 'path';
import 'express-async-errors';

import apiRoutes from './server/routes';
import swaggerDocs from './server/swagger';
import db from './server/db';
import { errorHandler } from './server/middlewares';

const PORT = 3000;

async function startServer() {
  const app = express();

  // Initialize DB Schema
  db.init();

  // Middlewares
  app.use(helmet({ contentSecurityPolicy: false })); // Disabled CSP for Swagger/React dev
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());

  // API Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // API Routes
  app.use('/api/v1', apiRoutes);

  // Global Error Handler for API
  app.use('/api', errorHandler);

  // Vite middleware for frontend development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built frontend files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Fallback for unhandled API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
  });
}

startServer();
