# Supabase Setup Guide

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Install Supabase CLI: `npm install -g supabase`

## Database Setup

### Option 1: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `migrations/001_initial_schema.sql`
4. Paste and run the SQL in the editor

### Option 2: Using Supabase CLI

1. Login to Supabase:
   ```bash
   supabase login
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Apply migrations:
   ```bash
   supabase db push
   ```

## Get Your Credentials

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy the following values to your `.env` file:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon/Public Key** → `VITE_SUPABASE_ANON_KEY`

## Generate TypeScript Types

After creating the schema, generate TypeScript types:

```bash
supabase gen types typescript --linked > src/lib/types/database.ts
```

## Database Schema Overview

### Tables

- **companies**: Company profiles (linked to auth.users)
- **visit_slots**: Visit time slots created by companies
- **applications**: Student applications for visit slots
- **status_change_history**: Audit trail of application status changes

### Storage

- **cvs**: Bucket for storing student CV PDFs (5 MB limit, PDF only)

### Security

- Row Level Security (RLS) is enabled on all tables
- Companies can only access their own data
- Public users can view open visit slots and create applications
- CVs are private and only accessible to the company that owns the visit slot

## Testing

To test the database setup:

1. Create a test user via Supabase Auth
2. Insert a test company record
3. Create a test visit slot
4. Submit a test application

## Backup

Supabase provides automatic daily backups for Pro plan and above. For free tier projects, consider:

- Regular exports to Airtable (built into this app)
- Manual SQL dumps via `supabase db dump`
