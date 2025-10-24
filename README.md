# 🥗 BonApp

**Plan your week deliciously**

BonApp is a modern meal planning application that helps you organize your weekly meals with ease. Create recipes, plan your week, and never wonder "what's for dinner?" again.

## Features

- ✅ **Weekly Meal Planner** - Visual calendar view for planning lunch and dinner
- ✅ **Recipe Management** - Create and store recipes with Markdown formatting
- ✅ **Calendar Timeline** - Browse through past and future weeks
- ✅ **Authentication** - Secure sign-in with Clerk
- ✅ **Cloud Database** - Your data synced with Supabase

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI, Lucide Icons
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **Markdown**: react-markdown with GitHub Flavored Markdown

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Clerk account
- Supabase account

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Clerk and Supabase credentials

# Run database migrations
# See supabase/README.md for instructions

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Documentation

- 📖 [Setup Guide](./SETUP.md) - Detailed setup instructions
- 📋 [Product Requirements](./PRD.md) - Feature specifications
- 🗄️ [Database Schema](./supabase/README.md) - Supabase setup and schema

## Project Structure

```
bonapp/
├── app/                  # Next.js app router pages
│   ├── api/             # API routes (recipes, meal plans)
│   ├── home/            # Protected app pages
│   ├── calendar/        # Calendar timeline view
│   └── page.tsx         # Landing page
├── components/          # React components
│   ├── meal-planner/    # Week view, meal cells
│   └── recipes/         # Recipe cards, editor
├── lib/                 # Utilities and configuration
│   ├── brand.ts         # Brand constants
│   ├── supabase/        # Supabase client & types
│   └── providers/       # React Query provider
└── supabase/           # Database migrations
```

## Key Routes

- `/` - Landing page
- `/home` - Weekly meal planner (authenticated)
- `/home/recipes` - Recipe management (authenticated)
- `/home/recipes/new` - Create new recipe (authenticated)
- `/home/calendar` - Calendar timeline view (authenticated)

## Development

```bash
# Run dev server
npm run dev

# Type check
npm run build

# Lint
npm run lint
```

## Deployment

This app is designed to be deployed on [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Environment Variables

Required environment variables (see `.env.example`):

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Contributing

Contributions are welcome! Please read the PRD to understand the product vision before making significant changes.

## License

MIT

## Author

Arthur Papailhau

---

Built with ❤️ using Next.js, Clerk, and Supabase
