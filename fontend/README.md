# NexSplit Frontend

Modern, responsive frontend for NexSplit - an expense splitting and group management application built with React, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Form Handling**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Authentication**: Google OAuth (@react-oauth/google)
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend README)

## 🛠️ Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Backend API URL
   VITE_API_URL=http://localhost:5000
   
   # Google OAuth Client ID
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
The app will start on `http://localhost:5173` with hot module replacement.

### Build for Production
```bash
npm run build
```
Builds the app for production to the `dist` folder.

### Preview Production Build
```bash
npm run preview
```
Locally preview the production build.

### Other Scripts
```bash
npm run lint        # Run ESLint
```

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
│   └── vite.svg
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/         # shadcn/ui components
│   │   └── layout/     # Layout components (SideNav, etc.)
│   ├── features/        # Feature-based modules
│   │   ├── auth/       # Authentication (Login, Signup)
│   │   ├── dashboard/  # Dashboard, stats, recent activity
│   │   ├── groups/     # Group management, details
│   │   ├── transactions/ # Expense/income forms
│   │   ├── activity/   # Activity feed
│   │   ├── debts/      # Debts overview
│   │   └── profile/    # User profile, settings
│   ├── hooks/           # Custom React hooks
│   │   └── use-media-query.ts
│   ├── services/        # API service layer
│   │   └── api.ts      # All API calls
│   ├── store/           # Zustand stores
│   │   └── ui.store.ts # UI state management
│   ├── lib/             # Utility libraries
│   │   └── utils.ts    # Helper functions
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles & Tailwind imports
├── .env                 # Environment variables
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) - a collection of re-usable components built with Radix UI and Tailwind CSS.

### Available Components
- **Avatar** - User profile pictures
- **Button** - Various button styles
- **Card** - Content containers
- **Dialog/Drawer** - Modal interfaces
- **Dropdown Menu** - Contextual menus
- **Input** - Form inputs
- **Label** - Form labels
- **Progress** - Progress indicators
- **Radio Group** - Radio button groups
- **Select** - Dropdown selects
- **Tabs** - Tabbed interfaces

## 🔑 Key Features

### Authentication
- Email/password authentication
- Google OAuth integration
- Persistent login with JWT tokens
- Protected routes

### Dashboard
- Monthly spending summary
- Recent activity feed
- Quick stats (total expenses, groups, debts)
- Visual progress indicators

### Group Management
- Create and manage expense groups
- Add/remove members
- View group expenses and settlements
- Real-time balance calculations

### Expense Tracking
- Add expenses with split options:
  - **Equal Split**: Split evenly among members
  - **Exact Amount**: Specify exact amounts per person
  - **Percentage**: Split by percentage
- Support for personal expenses and income
- Transaction history

### Debt Settlement
- View all debts at a glance
- Settle debts with one click
- Settlement suggestions
- Settlement history

### User Profile
- Update profile information
- Change currency preference
- Set monthly spending limit
- View statistics

## 🎯 API Integration

The frontend communicates with the backend API through a centralized service layer (`src/services/api.ts`).

### Key Features:
- Automatic JWT token attachment
- ID mapping (MongoDB `_id` to `id`)
- Error handling
- Type-safe API calls

### Example Usage:
```typescript
import { api } from '@/services/api';

// Get current user
const user = await api.getCurrentUser();

// Create expense
const transaction = await api.addTransaction({
  description: 'Dinner',
  amount: 100,
  type: 'EXPENSE',
  groupId: 'group-id',
  paidByUserId: 'user-id',
  splitType: 'EQUAL',
  splitDetails: []
});
```

## 🔄 State Management

### Zustand (UI State)
Located in `src/store/ui.store.ts`:
- Side navigation state
- Add transaction drawer state
- Settle debt drawer state

### TanStack Query (Server State)
Used for:
- Data fetching and caching
- Optimistic updates
- Automatic refetching
- Query invalidation

Example:
```typescript
const { data: groups } = useQuery({
  queryKey: ['groups'],
  queryFn: api.getGroups
});
```

## 🎨 Styling Guide

### Tailwind CSS
- Utility-first CSS framework
- Custom theme configuration in `tailwind.config.js`
- Dark mode support
- Custom color palette

### Color Scheme
- **Primary**: Vibrant purple/blue gradient
- **Accent**: Bright green for positive actions
- **Destructive**: Red for negative amounts/deletions
- **Muted**: Subtle grays for secondary content

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Optimized for phones, tablets, and desktops

## 🔐 Authentication Flow

1. User signs in via email/password or Google OAuth
2. Backend returns JWT token
3. Token stored in `localStorage`
4. Token automatically attached to all API requests
5. On 401 response, user redirected to login

## 📱 Responsive Features

- **Desktop**: Full sidebar navigation
- **Mobile**: Bottom navigation bar
- **Tablet**: Optimized layout
- **Drawers**: Slide-up on mobile, side drawer on desktop

## 🐛 Debugging

### Development Tools
```bash
npm run dev --debug  # Verbose logging
```

### React DevTools
Install React DevTools browser extension for component inspection.

### TanStack Query DevTools
Automatically enabled in development mode for query debugging.

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Manual Deployment
1. Build: `npm run build`
2. Deploy `dist/` folder to any static hosting
3. Configure environment variables on hosting platform

### Environment Variables for Production
```env
VITE_API_URL=https://your-backend-api.com
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id
```

## ⚠️ Common Issues

### API Connection Error
- Verify `VITE_API_URL` in `.env`
- Ensure backend is running
- Check CORS configuration on backend

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Google OAuth Not Working
- Verify `VITE_GOOGLE_CLIENT_ID`
- Add authorized JavaScript origins in Google Console:
  - http://localhost:5173 (development)
  - https://your-domain.com (production)

### Routing Issues in Production
Ensure your hosting platform supports SPA routing (index.html fallback).

For Vercel, this is in `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## 📝 Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API base URL | Yes | http://localhost:5000 |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes | xxx.apps.googleusercontent.com |

## 🎨 Customization

### Add New UI Component
```bash
npx shadcn-ui@latest add [component-name]
```

### Modify Theme
Edit `tailwind.config.js` to customize:
- Colors
- Fonts
- Spacing
- Border radius
- Breakpoints

### Add New Feature
1. Create feature folder in `src/features/`
2. Add components, hooks, and types
3. Integrate with routing in `App.tsx`
4. Add API calls in `src/services/api.ts`

## 🧪 Best Practices

- **Components**: Keep components small and focused
- **Hooks**: Extract reusable logic into custom hooks
- **Types**: Define TypeScript interfaces for all data
- **API**: Centralize all API calls in `api.ts`
- **State**: Use Zustand for UI state, TanStack Query for server state
- **Styling**: Use Tailwind utility classes, avoid inline styles

## 📄 License

ISC

## 👨‍💻 Developer Notes

- Always use TypeScript for type safety
- Follow React best practices (hooks, functional components)
- Use React Hook Form + Zod for forms
- Invalidate queries after mutations for fresh data
- Add loading and error states to all data-fetching components
