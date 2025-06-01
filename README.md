# HVAC Management Platform

A modern HVAC service management application built with React, Node.js, and Supabase.

## Features

- **User Authentication** - Secure login with email/password or Google OAuth
- **Team Management** - Support for solo technicians and multi-tech companies
- **Job Scheduling** - Create, manage, and track HVAC service jobs
- **Customer Management** - Comprehensive customer database with equipment tracking
- **Invoicing** - Generate and manage invoices from completed jobs
- **Dashboard** - Real-time overview of business metrics

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **ORM**: Drizzle ORM
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- PostgreSQL database

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - Your PostgreSQL connection string
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SESSION_SECRET` - Random string for session encryption

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

### Deployment

1. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

2. **Set environment variables in Vercel dashboard**

3. **Update Supabase OAuth redirect URLs:**
   - Add your Vercel domain to Supabase Auth settings
   - Set redirect URL to: `https://yourdomain.vercel.app/auth/callback`

## Database Schema

The app uses a multi-tenant architecture where:
- Users belong to Companies
- Solo owners have `solo_owner` role
- Team companies have `admin`, `dispatcher`, `tech` roles
- All data is scoped by company ID

## Architecture

- **Frontend**: Single Page Application with React Router
- **Backend**: Express API with middleware-based authentication
- **Database**: Relational schema with proper foreign keys
- **Authentication**: JWT tokens managed by Supabase
- **File Structure**: Monorepo with `client/` and `server/` directories

## API Endpoints

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/user` - Get current user
- `POST /api/auth/complete-onboarding` - Complete setup

See `server/routes.ts` for full API documentation.