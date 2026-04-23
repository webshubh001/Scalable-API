# Scalable REST API with Authentication & React Frontend

## 🚀 Project Overview

A full-stack project featuring a scalable Node.js/Express REST API and a basic React dashboard to manage users and tasks.

### 🌟 Key Features
- **Backend**: Express.js with `better-sqlite3` mimicking a relational DBMS behavior.
- **Authentication**: JWT-based login with hashed passwords via `bcryptjs`.
- **Role-Based Access**: Distinguishes between `user` and `admin` roles. Admins can view all tasks; users see only their tasks.
- **Security**: Utilizes `helmet` for HTTP headers, `cors` for safe origins, and Zod for robust input validation/sanitization.
- **Documentation**: Swagger API docs available out of the box.
- **Frontend**: A React.js SPA utilizing Tailwind CSS for styling.

---

## 🛠️ Scalability & Infrastructure Note

For a production environment, this application structure should be expanded:

1. **Database Migration**: Currently running Local SQLite for convenience. In production, connect an ORM like **Prisma** or **TypeORM** pointing to **PostgreSQL** or **MongoDB**.
2. **Caching Strategy**: Introduce **Redis** to cache frequent endpoints (e.g., retrieving lists of tasks or user configuration) to decrease database load.
3. **Microservices Architecture**: The `/tasks` and `/auth` routes are decoupled at the controller level. These can be separated into different microservices (e.g., an Auth Service and a Task Service) communicating via gRPC or message queues like RabbitMQ.
4. **Load Balancing & Docker**: Containerize the app using Docker. Run multiple instances orchestrated by Kubernetes, behind an NGINX or AWS ALB load balancer to handle vast sequential request volumes.
5. **Observability**: Use tools like ELK stack (Elasticsearch, Logstash, Kibana) or Datadog for centralized logging, currently bootstrapped with `morgan` for simple request logging.

---

## 📖 API Documentation

Once the server is running, the Swagger documentation is accessible at:
\`http://localhost:3000/api-docs\`

### Core API Endpoints

- \`POST /api/v1/auth/register\` - Create a new user account (Supports adding "admin" role for demo).
- \`POST /api/v1/auth/login\` - Receive a JWT token by logging in.
- \`GET /api/v1/tasks\` - Fetch tasks (Requires JWT).
- \`POST /api/v1/tasks\` - Create a task (Requires JWT).
- \`PUT /api/v1/tasks/:id\` - Edit a task (Requires JWT).
- \`DELETE /api/v1/tasks/:id\` - Remove a task (Requires JWT).

---

## 💡 Frontend Features

The React application connects seamlessly to the backend APIs:
1. **Registration & Login Layout**: Sign up quickly.
2. **Protected Dashboard layout**: Requires active JWT token (Stored in `localStorage` for simplicity).
3. **CRUD Operations**: Directly manage secondary items (tasks).
4. **Error Handling**: Form validation catches and properly propagates backend standard errors.

