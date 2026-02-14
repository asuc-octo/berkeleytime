# Staff Dashboard

<!-- toc -->

The Staff Dashboard is an administrative interface for managing Berkeleytime staff, viewing analytics, and configuring platform settings. It is accessible only to users with staff status.

**URL:** [staff.berkeleytime.com](https://staff.berkeleytime.com)

## Stack

- **Framework:** React with TypeScript
- **Build Tool:** Vite
- **Data Fetching:** Apollo Client (GraphQL)
- **UI:** @repo/theme design system
- **Charts:** Recharts

## Structure

```
apps/staff-frontend/
├── src/
│   ├── app/                   # Feature pages
│   │   ├── Dashboard/         # Staff management
│   │   ├── Analytics/         # Analytics dashboards
│   │   ├── Banners/           # Banner management
│   │   └── RouteRedirects/    # URL redirect management
│   ├── components/
│   │   ├── Layout/            # Main layout wrapper
│   │   ├── NavigationBar/     # Tab navigation
│   │   └── Chart/             # Chart components
│   ├── hooks/api/             # GraphQL hooks
│   └── lib/api/               # GraphQL queries & mutations
├── package.json
└── vite.config.ts
```

## Features

### Staff Management

The main dashboard provides tools for managing Berkeleytime team members:

- **Staff Directory:** View all staff members with search and filter options
- **Add Staff:** Promote existing users to staff status
- **Edit Staff:** Update staff info, photos, and semester roles
- **Pod Management:** Organize staff into teams/pods by semester

Each staff member can have multiple semester roles with:
- Role type (Engineering, Design, etc.)
- Leadership flag
- Pod/team assignment
- Profile photos

### Analytics

The analytics section provides insights into platform usage:

| Dashboard | Metrics |
|-----------|---------|
| General | Unique visitors, requests, user growth, signup patterns |
| Scheduler | Schedules created, daily trends, classes per schedule |
| Ratings | Rating counts, course distribution, score trends |
| GradTrak | Plans created, major/minor distribution |
| Bookmarks | Collection usage, bookmark trends |

### Banners

Create and manage platform-wide announcements:

- Rich text content with HTML support
- Optional link with custom text
- Persistent vs. dismissible banners
- Create/update/delete operations

### Route Redirects

Configure URL redirects for the platform:

- Map internal paths to external URLs
- Useful for legacy links or shortlinks

## Local Development

The staff dashboard runs on port 3002:

```bash
# Start with docker compose
docker compose up staff-frontend

# Or run standalone
cd apps/staff-frontend
npm run dev
```

Access at `http://localhost:3002`

## Authentication

The dashboard uses OAuth authentication through the backend:

1. User visits staff dashboard
2. If not authenticated, redirected to `/api/login`
3. After OAuth flow, backend validates staff status
4. Non-staff users see a sign-in prompt

> [!NOTE]
> You must be added as a staff member by an existing staff member to access the dashboard.
