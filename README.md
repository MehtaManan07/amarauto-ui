# Amar Automobiles - Manufacturing ERP Frontend

React + TypeScript + MUI frontend for the Amar Automobiles Manufacturing ERP system.

## Tech Stack

- **React** 19.2.0 + **TypeScript** 5.9.3
- **Vite** 7.2.4
- **Material-UI** 7.3.7
- **TanStack React Query** 5.90.16 (data fetching)
- **Zustand** 5.0.9 (state management)
- **React Hook Form** + **Zod** (forms & validation)
- **Axios** 1.13.2 (HTTP client)
- **React Router** 7.12.0

## Project Structure

```
src/
├── api/                  # API layer (axios + endpoints)
├── components/
│   ├── common/          # Reusable components
│   └── layout/          # MainLayout
├── constants/           # API URLs, query keys, roles
├── features/            # Feature-based modules
│   ├── auth/           # Login page
│   ├── dashboard/      # Dashboard with metrics
│   ├── products/       # Products & BOM
│   ├── raw-materials/  # Raw materials inventory
│   ├── bom/            # BOM management
│   └── users/          # User management
├── hooks/               # React Query hooks
├── routes/              # Route definitions
├── stores/              # Zustand stores
├── theme/               # MUI theme (teal/amber)
└── types/               # TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- Backend server running on `http://localhost:8000`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

App will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Environment Variables

Create `.env` file:

```
VITE_API_URL=http://localhost:8000/api
```

## Features

### Implemented

- ✅ Authentication (Login, JWT token management)
- ✅ Dashboard with metrics
- ✅ Theme switcher (light/dark mode)
- ✅ Responsive layout with sidebar navigation
- ✅ API layer with interceptors
- ✅ React Query hooks for all domains
- ✅ Type-safe API calls
- ✅ Notification system (toast messages)
- ✅ Auth guards & role-based access control

### To Be Implemented

- Products CRUD with BOM tab
- Raw Materials CRUD with stock management
- BOM CRUD with production calculator
- Users management (Admin-only)

## API Endpoints

Backend at: `http://localhost:8000/api`

- `/users/login` - Login
- `/users/me` - Current user
- `/products` - Products CRUD
- `/raw-materials` - Raw materials CRUD
- `/bom` - BOM lines CRUD
- `/users` - Users CRUD (Admin)

## Theme

- **Primary Color**: Teal (#0D7377)
- **Secondary Color**: Amber (#E8AA42)
- **Font**: DM Sans
- **Responsive**: Mobile-first design

## Authentication

- JWT token stored in localStorage
- Auto-redirect on 401
- Role-based access control (Admin, Supervisor, Staff, Worker)

## License

Private - Amar Automobiles
