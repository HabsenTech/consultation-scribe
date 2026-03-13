# MedScribe Backend

Express.js backend API layer for MedScribe AI.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (from project settings)
- `SUPABASE_JWT_SECRET` - JWT secret (from Supabase project settings → API → JWT Secret)
- `PORT` - Server port (default: 3001)
- `CORS_ORIGIN` - Frontend URL (default: http://localhost:5173)

3. Run in development:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

All endpoints (except health) require `Authorization: Bearer <supabase_access_token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update user profile |
| GET | `/api/consultations` | List consultations (paginated) |
| GET | `/api/consultations/recent` | Get 5 recent consultations |
| POST | `/api/consultations` | Create consultation |
| GET | `/api/credits` | Get user credits |
| POST | `/api/credits/deduct` | Deduct one credit |
| GET | `/api/preferences` | Get consultation preferences |
| PUT | `/api/preferences` | Update preferences |
| GET | `/api/admin/users` | List all users (admin) |
| POST | `/api/admin/credits` | Add credits to user (admin) |
| POST | `/api/admin/make-admin` | Promote user to admin (admin) |
| POST | `/api/admin/create-user` | Create new user (admin) |

## Deployment

Deploy as a standard Node.js application. Recommended platforms:
- Railway
- Render
- DigitalOcean App Platform
- AWS ECS / EC2
- Any VPS with Node.js 18+
