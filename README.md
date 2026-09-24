# Community Organization API

**"Working Together. Growing Together. Winning Together."**

## 1. Project Overview
This is the backend REST API for the Community Organization platform, providing services for authentication, user management, event registrations, blog posts, media management, contact messages, and an admin dashboard.

## 2. Tech Stack
- **Node.js**
- **TypeScript**
- **Express.js**
- **PostgreSQL**
- **Prisma ORM**
- **JWT (JSON Web Tokens)**
- **Cloudinary** (Media management)

## 3. Requirements
- Node.js 18+
- PostgreSQL 14+
- Cloudinary account

## 4. Project Structure
```text
backend/
├── prisma/                 # Prisma schema and migrations
├── src/
│   ├── config/             # Environment, Database, Swagger configurations
│   ├── middleware/         # Express middlewares (auth, errorHandler, etc.)
│   ├── modules/            # Feature modules (auth, users, posts, etc.)
│   │   ├── auth/
│   │   ├── users/
│   │   ├── registrations/
│   │   ├── posts/
│   │   ├── media/
│   │   ├── contact/
│   │   └── dashboard/
│   ├── routes/             # Central API router
│   ├── utils/              # Utility functions, logger, response helpers
│   ├── app.ts              # Express application setup
│   └── server.ts           # HTTP server startup
├── .env                    # Environment variables
├── package.json
└── tsconfig.json
```

## 5. Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment variables:
   Copy `.env.example` to `.env` and fill in the required values.
   ```bash
   cp .env.example .env
   ```

## 6. Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | The port the server runs on | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Allowed frontend origin | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret key for JWT | `your_jwt_secret` |
| `JWT_EXPIRES_IN` | JWT expiration time | `1d` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret | `your_api_secret` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `AUTH_RATE_LIMIT_MAX` | Max auth requests per window | `20` |

## 7. PostgreSQL Setup
Create the database using SQL or a tool like pgAdmin:
```sql
CREATE DATABASE community_db;
```

## 8. Prisma Setup
1. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
2. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
3. Seed the database (optional):
   ```bash
   npx prisma db seed
   ```

## 9. Development
Start the development server with hot-reload:
```bash
npm run dev
```

## 10. Build & Production
Build the TypeScript code:
```bash
npm run build
```
Start the production server:
```bash
npm start
```

## 11. API Routes
| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| GET    | `/health` | No | System health check |
| POST   | `/api/v1/auth/login` | No | User login |
| POST   | `/api/v1/auth/register` | No | User registration |
| GET    | `/api/v1/posts` | No | Get public posts |
| GET    | `/api/v1/registrations`| No | Get public registrations |
| POST   | `/api/v1/contact` | No | Submit contact message |
| GET    | `/api/v1/admin/dashboard`| Yes (Admin) | Get admin dashboard stats |
| CRUD   | `/api/v1/admin/posts` | Yes (Admin) | Manage posts |
| CRUD   | `/api/v1/admin/media` | Yes (Admin) | Manage media |
| CRUD   | `/api/v1/admin/registrations`| Yes (Admin)| Manage registrations |
| CRUD   | `/api/v1/admin/contact-messages`| Yes (Admin)| Manage contact messages |

## 12. Authentication
Authentication is implemented using JSON Web Tokens (JWT). 
To access protected routes, include the JWT token in the `Authorization` header as a Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

## 13. Pagination
Many list endpoints support pagination using query parameters:
- `page`: The page number (default: 1)
- `limit`: Number of items per page (default: 10)
Example: `GET /api/v1/posts?page=2&limit=20`

## 14. Testing
Run the test suite:
```bash
npm run test
```

## 15. Swagger Docs
API documentation is available in non-production environments at:
```
http://localhost:5000/api-docs
```

## 16. Deployment
Ensure the following before deployment:
- Node.js and PostgreSQL are installed on the server.
- Environment variables are properly configured.
- Database migrations are applied.
- The app is built using `npm run build`.
- Use a process manager like PM2 to keep the app running in production.
