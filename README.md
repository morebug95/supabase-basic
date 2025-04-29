# Next.js Registration Form with Supabase

This is a simple registration form application built with Next.js and Supabase for authentication.

## Features

- User registration with email and password
- User login with email and password
- Simple UI using Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://svkkfcdvutpbhijjlazm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2tmY2R2dXRwYmhpampsYXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MjM3ODcsImV4cCI6MjA2MTM5OTc4N30.8v7qLSaA3vUWAgSPl2JZHEXgmDVQsc6P8MFIEy5d6Mo
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `src/app/page.tsx` - Home page with navigation links
- `src/app/register/page.tsx` - Registration form page
- `src/app/login/page.tsx` - Login form page
- `src/lib/supabase.ts` - Supabase client configuration

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase features and API.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS.
