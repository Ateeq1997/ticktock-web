# ticktock – Timesheet Management App

A SaaS-style Timesheet Management application built for the TenTwenty Frontend Developer Assessment.

---

## 🚀 Live Demo

> Deploy to Vercel: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 📸 Screenshots

| Login | Dashboard (Table View) | Week Detail (List View) | Add Entry Modal |
|-------|----------------------|------------------------|----------------|
| Split-panel login with brand panel | Paginated timesheet list with filters | Day-grouped entries with progress | Form with validation |

---

## 🛠 Tech Stack

| Category | Choice |
|----------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Auth | NextAuth.js v4 (Credentials Provider) |
| Styling | Tailwind CSS |
| Date utils | date-fns |
| Testing | Jest + React Testing Library |
| Font | Inter (Google Fonts) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   │   └── timesheets/
│   │       ├── route.ts                  # GET /api/timesheets (list + filter + paginate)
│   │       └── [id]/
│   │           ├── route.ts              # GET /api/timesheets/:id
│   │           └── entries/
│   │               ├── route.ts          # GET, POST entries
│   │               └── [entryId]/route.ts # PUT, DELETE entry
│   ├── dashboard/
│   │   ├── layout.tsx                    # Auth-guarded layout with Navbar
│   │   ├── page.tsx                      # Table view (timesheet list)
│   │   └── [weekId]/page.tsx             # List view (week detail)
│   ├── login/page.tsx                    # Login page
│   ├── layout.tsx                        # Root layout with SessionProvider
│   ├── page.tsx                          # Root redirect
│   ├── providers.tsx                     # NextAuth SessionProvider wrapper
│   └── globals.css                       # Global styles + Tailwind
├── components/
│   ├── Navbar.tsx                        # Top navigation with user dropdown
│   ├── TimesheetTable.tsx                # Paginated table with filters
│   ├── WeekDetail.tsx                    # Week detail with day-grouped entries
│   ├── EntryModal.tsx                    # Add/Edit entry modal with validation
│   ├── StatusBadge.tsx                   # Status pill (Completed/Incomplete/Missing)
│   └── __tests__/
│       ├── StatusBadge.test.tsx
│       └── dateUtils.test.ts
├── hooks/
│   └── useFetch.ts                       # Generic fetch hook
├── lib/
│   ├── store.ts                          # In-memory mock data store
│   └── dateUtils.ts                      # Date formatting helpers
└── types/
    └── index.ts                          # Shared TypeScript interfaces
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ticktock.git
cd ticktock
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXTAUTH_SECRET=your-random-secret-string
NEXTAUTH_URL=http://localhost:3000
```

> Generate a secret: `openssl rand -base64 32`

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Login credentials (demo)

| Email | Password |
|-------|----------|
| john@example.com | password123 |
| jane@example.com | password123 |

---

## 🧪 Running Tests

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
```

---

## 🏗 Build for Production

```bash
npm run build
npm start
```

---

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables:
   - `NEXTAUTH_SECRET` — a random secret
   - `NEXTAUTH_URL` — your Vercel deployment URL (e.g. `https://ticktock.vercel.app`)
4. Deploy

---

## 📝 Assumptions & Notes

### Data Layer
- The app uses an **in-memory store** (`src/lib/store.ts`) to simulate a database. All API calls go through internal Next.js API routes — no data is fetched directly from components.
- Data resets on server restart. In production, replace with a real database (e.g. PostgreSQL via Prisma).

### Authentication
- Uses **NextAuth.js Credentials Provider** with a mock user list.
- JWT session strategy — tokens stored in HTTP-only cookies (secure by default in production).
- All API routes are protected server-side with `getServerSession`.

### Status Logic
- `COMPLETED` = 40+ total hours logged for the week
- `INCOMPLETE` = 1–39 hours logged
- `MISSING` = 0 hours logged

### Pagination & Filtering
- Server-side pagination via query params (`?page=1&perPage=5`)
- Status filter applied server-side
- Date range filter UI is present; full filtering by date would require a date-picker library in production

### Responsive Design
- Mobile-first layout using Tailwind CSS
- Table scrolls horizontally on small screens
- Login right panel hidden on mobile (`hidden md:flex`)
- Navbar collapses user name on small screens

### API Routes (internal)
All client-side data fetching goes through internal API routes:

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/timesheets` | List timesheets (paginated, filterable) |
| GET | `/api/timesheets/:id` | Get single timesheet |
| GET | `/api/timesheets/:id/entries` | List entries for a week |
| POST | `/api/timesheets/:id/entries` | Create new entry |
| PUT | `/api/timesheets/:id/entries/:entryId` | Update entry |
| DELETE | `/api/timesheets/:id/entries/:entryId` | Delete entry |

---

## ⏱ Time Spent

| Task | Time |
|------|------|
| Project setup & configuration | 30 min |
| Authentication (NextAuth) | 45 min |
| API routes | 60 min |
| UI Components (Login, Table, Week Detail) | 2.5 hrs |
| Modal + Form validation | 45 min |
| Tests | 30 min |
| README + polish | 30 min |
| **Total** | **~6.5 hours** |

---

## 👤 Author

Built for TenTwenty Frontend Developer Assessment 2025.
