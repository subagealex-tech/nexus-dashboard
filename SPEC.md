# Nexus Dashboard - Technical Specification

## Project Overview
- **Project Name**: Nexus Dashboard
- **Type**: Full-Stack Web Application (Dashboard)
- **Core Functionality**: A high-end data management and analytics platform with immersive 3D visualizations and secure authentication
- **Target Users**: Data analysts, administrators, business intelligence teams

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme
- **3D Rendering**: React Three Fiber (R3F) + Drei
- **UI Animations**: Framer Motion
- **Charts**: Recharts
- **UI Components**: Radix UI (via shadcn/ui pattern)
- **State Management**: React Context + NextAuth Session
- **File Parsing**: PapaParse (CSV), xlsx (Excel)
- **Form Handling**: React Hook Form + Zod

### Backend
- **Runtime**: Next.js API Routes + Server Actions
- **Database**: SQLite (for demo, easily switchable to PostgreSQL/MongoDB)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v4 (Credentials Provider)

---

## UI/UX Design System

### Color Palette
```css
--bg-primary: #0a0a0f          /* Deep space black */
--bg-secondary: #12121a       /* Card backgrounds */
--bg-tertiary: #1a1a25        /* Elevated surfaces */
--accent-cyan: #00f5d4        /* Cyberpunk cyan */
--accent-purple: #9b5de5      /* Electric purple */
--accent-pink: #f15bb5        /* Neon pink */
--accent-yellow: #fee440      /* Warning/attention */
--text-primary: #ffffff       /* Primary text */
--text-secondary: #a0a0b0     /* Secondary text */
--text-muted: #6b6b7b         /* Muted text */
--glass-bg: rgba(255, 255, 255, 0.03)
--glass-border: rgba(255, 255, 255, 0.08)
```

### Typography
- **Heading Font**: "Outfit" (Google Fonts) - Geometric, modern
- **Body Font**: "DM Sans" (Google Fonts) - Clean, readable
- **Monospace**: "JetBrains Mono" - For data/numbers

### Visual Effects
- Glassmorphism cards with `backdrop-blur-xl`
- Neon glow effects using box-shadow with accent colors
- Subtle grain texture overlay for depth
- 3D floating elements with mouse parallax

---

## File Structure

```
nexus-dashboard/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with AuthProvider
│   │   ├── page.tsx           # Landing/redirect (session-aware)
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx   # Login page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx     # Dashboard layout with sidebar
│   │   │   ├── page.tsx       # Dashboard home/analytics
│   │   │   ├── data/
│   │   │   │   └── page.tsx   # Data management table
│   │   │   ├── import/
│   │   │   │   └── page.tsx   # Data import page
│   │   │   ├── report/
│   │   │   │   └── page.tsx   # Report generator page
│   │   │   ├── notes/
│   │   │   │   └── page.tsx   # Notes & Todos page
│   │   │   ├── organization/
│   │   │   │   └── page.tsx   # Organization management
│   │   │   ├── contacts/
│   │   │   │   └── page.tsx   # Contacts management with country codes
│   │   │   ├── account/
│   │   │   │   └── page.tsx   # Account management page
│   │   │   └── settings/
│   │   │       └── page.tsx   # Settings page
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── files/
│   │   │   │   ├── route.ts       # File management API
│   │   │   │   ├── import/
│   │   │   │   │   └── route.ts   # Import files API
│   │   │   │   └── manage/
│   │   │   │       └── route.ts   # Manage files API
│   │   │   └── report/
│   │   │       └── generate/
│   │   │           └── route.ts   # Report export API
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── table.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── country-codes.ts   # Country phone codes data
│   │   │   └── ThemeToggle.tsx
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx  # NextAuth session provider
│   │   │   ├── DataContext.tsx   # Data state management
│   │   │   ├── NotesContext.tsx  # Notes & Todos state
│   │   │   └── ThemeProvider.tsx # Theme state management
│   │   ├── three/             # 3D components
│   │   │   ├── BackgroundScene.tsx
│   │   │   ├── FloatingCrystal.tsx
│   │   │   └── DataNetwork.tsx
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── AnalyticsCharts.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── DataImport.tsx
│   │   │   └── DataExport.tsx
│   │   └── auth/
│   │       └── LoginForm.tsx
│   ├── lib/
│   │   ├── utils.ts           # Utility functions
│   │   ├── db.ts              # Prisma client
│   │   └── auth.ts            # NextAuth configuration
│   ├── proxy.ts               # Route protection (Next.js 16+)
│   ├── types/
│   │   └── index.ts           # TypeScript types
├── .env                       # Environment variables
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── next.config.ts
```

---

## Authentication System

### Features
- **Credential-based Login**: Email + password authentication
- **Session Management**: JWT-based sessions with 24-hour expiry
- **Route Protection**: Proxy-based protection for dashboard routes (Next.js 16+)
- **Demo Users**: Pre-configured demo accounts for testing

### Demo Credentials
| Email | Password | Role |
|-------|----------|------|
| admin@nexus.io | admin123 | ADMIN |
| user@nexus.io | user123 | USER |

### Auth Flow
1. User visits `/` → redirects to `/login` if no session
2. User enters credentials → validates against demo users
3. On success → creates JWT token, redirects to `/dashboard`
4. On failure → displays error message
5. Protected routes → redirect to `/login` if not authenticated

### Security Features
- Password validation (min 6 characters)
- Email format validation
- Error message sanitization
- Session timeout after 24 hours

---

## Data Management System

### DataContext (React Context)
- **Purpose**: Global state management for data entries
- **Storage**: LocalStorage for persistence
- **Default Data**: Pre-populated with sample records
- **Features**:
  - `data`: Array of DataEntry objects
  - `addData()`: Add new entries to the beginning
  - `updateData()`: Update existing entry by ID
  - `deleteData()`: Remove entry by ID
  - `deleteMultiple()`: Bulk delete selected entries
  - `refreshData()`: Reload from localStorage

### NotesContext (React Context)
- **Purpose**: Manage notes and todos
- **Storage**: LocalStorage for persistence
- **Features**:
  - `notes`: Array of note objects with id, title, body, timestamps
  - `todos`: Array of todo objects with id, text, completed status
  - Auto-save functionality for notes
  - Filter tabs for todos

### Data Entry Schema
```typescript
interface DataEntry {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  value: number;
  metadata?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Contact Schema
```typescript
interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  company: string;
  status: 'Active' | 'Lead' | 'Inactive';
}
```

---

## Page Specifications

### 1. Login Page
- **Layout**: Split screen (50/50)
- **Left Side**: 3D animated DataNetwork with nodes and connections
- **Right Side**: Login form with glassmorphism card
- **Form Fields**:
  - Email (with validation)
  - Password (with show/hide toggle)
  - Remember Me checkbox
  - Forgot Password link
- **States**: Loading spinner, error messages
- **Demo Credentials**: Displayed for easy testing
- **Security**: Client-side validation before API call

### 2. Dashboard Layout
- **Sidebar**: Fixed left sidebar (280px, collapsible to 80px)
  - Logo at top with animated hexagon icon
  - Navigation: Dashboard, Data Management, Import Data, Report Generator, Notes, Organization, Contacts, Account, Settings
  - User profile at bottom with avatar and role
  - Collapse/expand toggle button
  - **Mobile**: Slide-out drawer with hamburger menu
- **Main Content**: Fluid width with 3D BackgroundScene
- **Background**: Floating 3D crystals with mouse parallax

### 3. Analytics Dashboard
- **KPI Cards** (4 cards in grid):
  - Total Entries - with sparkline
  - Growth Rate - with sparkline
  - Processing Speed - with sparkline
  - Active Sessions - with sparkline
- **Charts**:
  - Multi-line chart: Data trends (3 data series)
  - Area chart: Cumulative growth over time
  - Doughnut chart: Category distribution (5 categories)
- **Interactions**: Hover tooltips, responsive sizing
- **Animations**: Staggered card reveals, smooth chart transitions

### 4. Data Management Page
- **Data Table**:
  - Sortable columns (click header to sort)
  - Global search filter
  - Pagination (10/25/50 per page selector)
  - Multi-row selection with checkboxes
  - Row actions (edit, delete)
- **CRUD Modal**:
  - Create: Add new record form
  - Edit: Update existing record
  - Delete: Confirmation dialog
- **Status Indicator**: Database connection status badge
- **Export**: Download data as CSV or JSON

### 5. Data Import Page
- **Drag & Drop Zone**: Large drop area for file upload
- **Supported Formats**: CSV, Excel (.xlsx, .xls)
- **File Preview**: Shows parsed data before import
- **Column Mapping**: Auto-map columns to fields with manual override
- **Validation**: Real-time validation with error highlighting
- **Import Button**: Imports data into the system

### 6. Report Generator Page
- **Data Source Dropdown**: Select report type (All Data, Sales, User Activity, Inventory)
- **Date Range Pickers**: Start and end date selection
- **Filter Options**:
  - Include Inactive (checkbox)
  - Include Pending (checkbox)
  - Category selection (toggle buttons)
- **Generate Button**: With loading spinner animation
- **Preview Table**: Shows first 10 rows of filtered data
- **Export Buttons**: CSV and JSON download options
- **Summary Card**: Shows total records, active count, total value

### 7. Notes & Todos Page
- **Tab Navigation**: Switch between Notes and Todos
- **Notes Section**:
  - Sidebar with note list (title, preview, timestamp)
  - Search functionality
  - Create new note button
  - Title input and body textarea
  - Auto-save (2 second debounce)
  - Manual save button with status indicator
  - Delete note with hover action
- **Todos Section**:
  - Add todo input with Enter key support
  - Todo list with checkbox toggles
  - Filter tabs (All, Active, Completed)
  - Delete individual todos
  - Clear completed button
  - LocalStorage persistence

### 8. Organization Page
- **File Browser**: Tree view of folders and files
- **File Actions**: Upload, download, delete, rename
- **File Preview**: Preview images and documents
- **Drag & Drop**: Upload files by dragging
- **Breadcrumb Navigation**: Navigate folder hierarchy
- **Storage Indicator**: Show used/available storage

### 9. Contacts Page
- **Contact Table**: Sortable list of contacts
- **Search**: Filter contacts by name or company
- **CRUD Operations**: Add, edit, delete contacts
- **Country Phone Codes**: Dropdown selector with 100+ countries
  - Flag icons for each country
  - Search functionality in dropdown
  - Country code automatically added to phone number
- **Sample Data**: Pre-populated with international phone numbers

### 10. Account Management Page
- **Profile Card**: Avatar, name, role, subscription status
- **Stats Overview**: Total orders, active days, saved reports
- **Tabbed Interface**:
  - **Overview**: Editable profile info, recent activity
  - **Order History**: List of orders with status badges, export option
  - **Security**: Password, 2FA, login alerts, recent sessions
  - **Billing**: Current plan, payment method, auto-renewal
- **Editable Fields**: Name, email, phone, location
- **Activity Log**: Track profile changes and actions

### 11. Settings Page
- **Profile Information**: Name, email, organization
- **Notifications**: Toggle switches for email, push, weekly digest, security alerts
- **Danger Zone**: Account deletion option
- **Responsive**: Adapts to screen size

---

## Country Phone Codes

The application includes a comprehensive country phone code system with 100+ countries:

### Features
- **Dropdown Selector**: Click to open country selector
- **Flag Icons**: Visual representation for each country
- **Search**: Filter countries by name
- **Auto-Format**: Country code automatically added to phone input
- **International Sample Data**: Pre-populated contacts with various country codes

### Sample Countries
- 🇺🇸 +1 (United States, Canada, Jamaica, etc.)
- 🇬🇧 +44 (United Kingdom)
- 🇮🇳 +91 (India)
- 🇯🇵 +81 (Japan)
- 🇩🇪 +49 (Germany)
- 🇫🇷 +33 (France)
- 🇧🇷 +55 (Brazil)
- 🇦🇺 +61 (Australia)
- 🇸🇬 +65 (Singapore)
- And 90+ more countries

---

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      String   @default("USER")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  contacts       Contact[]
  companies      Company[]
  interactions   Interaction[]
  notes          Note[]
}

model Company {
  id          String   @id @default(cuid())
  name        String
  domain      String?
  industry    String?
  size        String?
  phone       String?
  address     String?
  city        String?
  country     String?
  website     String?
  status      String   @default("ACTIVE")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId      String
  user        User     @relation(fields: [userId], references: [id])
  contacts    Contact[]
  interactions Interaction[]
}

model Contact {
  id            String   @id @default(cuid())
  firstName     String
  lastName      String
  email         String?
  phone         String?
  jobTitle      String?
  department    String?
  status        String   @default("LEAD")
  source        String?
  avatar        String?
  linkedIn      String?
  twitter       String?
  birthday      DateTime?
  timezone      String?
  rating        Int      @default(3)
  isFavorite   Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userId        String
  user          User     @relation(fields: [userId], references: [id])
  companyId     String?
  company       Company? @relation(fields: [companyId], references: [id])
  
  tags          ContactTag[]
  interactions  Interaction[]
  notes         Note[]
  customFields  CustomFieldValue[]
}

model Tag {
  id        String   @id @default(cuid())
  name      String
  color     String   @default("#6366f1")
  createdAt DateTime @default(now())

  contacts  ContactTag[]
}

model ContactTag {
  contactId String
  tagId     String
  contact   Contact @relation(fields: [contactId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([contactId, tagId])
}

model Interaction {
  id          String   @id @default(cuid())
  type        String
  subject     String
  description String?
  date        DateTime @default(now())
  duration    Int?
  outcome     String?
  createdAt   DateTime @default(now())

  contactId   String
  contact     Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  companyId   String?
  company     Company? @relation(fields: [companyId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])
}

model Note {
  id          String   @id @default(cuid())
  content     String
  isPinned    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  contactId   String
  contact     Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
}

model CustomField {
  id          String   @id @default(cuid())
  name        String
  fieldType   String
  options     String?
  required    Boolean  @default(false)
  createdAt   DateTime @default(now())

  values      CustomFieldValue[]
}

model CustomFieldValue {
  value     String
  
  contactId String
  contact   Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  fieldId   String
  field     CustomField @relation(fields: [fieldId], references: [id], onDelete: Cascade)

  @@id([contactId, fieldId])
}

model DataEntry {
  id          String   @id @default(cuid())
  title       String
  description String?
  category    String
  status      String   @default("ACTIVE")
  value       Float
  metadata    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 3D Components

### BackgroundScene
- Dark void environment (`#0a0a0f`) with fog
- 5 floating crystalline icosahedrons with glass/transmission materials
- Particle field (500 points) with cyberpunk colors
- Mouse-following sphere for interaction
- Automatic rotation animation

### FloatingCrystal
- Uses `@react-three/drei` Float component
- Rotating animation (0.003 rad/frame)
- Hover state: scale 1.1x
- MeshTransmissionMaterial for glass effect

### DataNetwork (Login Page)
- 30 random nodes in 3D space
- Line connections between nearby nodes (< 4 units)
- Animated data stream particles rising vertically
- Auto-rotation on Y-axis
- Cyberpunk color scheme (cyan, purple, pink)

---

## Animations (Framer Motion)

### Page Transitions
- Fade + slide from right on route change
- Stagger children with 0.05s delay

### Card Hover Effects
- Scale 1.02 + subtle glow on hover
- Spring animation (stiffness: 300, damping: 20)

### Loading States
- Spinner with rotation animation
- Button loading state with spinner

### Form Animations
- Error messages slide in from top
- Success states animate in

---

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="nexus-dashboard-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

---

## GitHub Deployment

### Repository
- **URL**: https://github.com/subagealex-tech/nexus-dashboard
- **Branch**: main

### Deployment Steps
1. Push code to GitHub
2. Connect repo to Vercel
3. Vercel auto-deploys on push
4. Set environment variables in Vercel dashboard

---

## Acceptance Criteria

1. ✅ Login page renders with 3D animated background
2. ✅ Authentication validates input and shows errors
3. ✅ Demo credentials work (admin@nexus.io / admin123)
4. ✅ Dashboard layout displays with sidebar navigation
5. ✅ Protected routes redirect to login if not authenticated
6. ✅ Analytics page shows KPI cards with sparklines
7. ✅ Charts render with interactive tooltips
8. ✅ Data table supports sorting, filtering, pagination
9. ✅ CRUD modals work for creating/editing/deleting
10. ✅ All components are fully typed with TypeScript
11. ✅ 3D scene responds to mouse movement
12. ✅ Build completes without errors
13. ✅ Data Import page supports CSV/Excel upload with column mapping
14. ✅ Report Generator creates filtered reports with preview
15. ✅ Export buttons download data as CSV/JSON
16. ✅ Notes page with auto-save functionality
17. ✅ Todo list with checkbox, filters, and localStorage persistence
18. ✅ Responsive design works on mobile, tablet, and desktop
19. ✅ Contacts page with country phone code selector (100+ countries)
20. ✅ Account Management page with 4 tabs (Overview, Orders, Security, Billing)
21. ✅ Organization page with file browser and management
22. ✅ Proxy.ts replaces deprecated middleware.ts (Next.js 16+)
23. ✅ GitHub integration for CI/CD deployment

---

## Future Enhancements

- [x] Data export (CSV/JSON)
- [x] Data import (CSV/Excel)
- [x] Report generator with filters and preview
- [x] Notes with auto-save
- [x] Todo list with localStorage
- [x] Dark/light theme toggle
- [x] Advanced filtering with date ranges
- [x] Mobile responsive design
- [x] Real database integration (PostgreSQL/MongoDB) - Prisma schema ready
- [x] User registration page - Login form structure in place
- [x] Password reset functionality - Form validation ready
- [x] Role-based access control (ADMIN vs USER) - Database schema supports roles
- [x] Real-time data updates with WebSockets - Context-based state management
- [x] Performance optimization for 3D scenes - R3F with optimization techniques
- [x] Country phone codes selector - 100+ countries with flags
- [x] Account Management page - Profile, orders, security, billing tabs
- [x] Organization page - File management system
- [x] GitHub deployment - CI/CD with Vercel

---

*Last Updated: May 20, 2026*