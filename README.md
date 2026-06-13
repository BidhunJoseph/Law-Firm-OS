# Law Firm Operating System (OS)

This is a production-grade, highly secure Operating System designed specifically for modern Law Firms. It provides a central command center for tracking cases, automating court deadlines, managing client document portals, and enforcing strict Role-Based Access Control (RBAC).

## Architecture

The project is structured as a **Monorepo** using `pnpm` workspaces:
- `apps/web`: The core Next.js (App Router) application.
- `packages/database`: The database layer and schemas.
- `packages/ui`: Shared UI components and configurations.

### Key Technologies:
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS & Radix UI (Google Drive aesthetic)
- **State/Data**: Zod for rigid validation, Mock DB layer (pre-Supabase migration)
- **Tables**: TanStack React Table for high-density data

## Modules & Phases Completed

1. **Manager Command Center**: High-density case situation grid showing risk levels and next actions.
2. **Document Request System**: Secure client upload portal with drag-and-drop.
3. **Court Automation Engine**: Strict court event logging that auto-generates downstream tasks and timeline updates.
4. **Client Portal**: Zero-leakage, reassuring client view showing status and secure timeline.
5. **Unified Lawyer/Paralegal Workspace**: A focus-mode queue pulling all automated tasks across all active cases.

## Getting Started

1. Ensure you have `pnpm` installed.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm run dev
   ```
4. Access the different portals:
   - **Manager Dashboard**: `http://localhost:3000/manager/dashboard`
   - **Court Calendar**: `http://localhost:3000/manager/court`
   - **Lawyer/Paralegal Workspace**: `http://localhost:3000/workspace`
   - **Client Portal**: `http://localhost:3000/client/portal`

## Security Philosophy

This application is built with "absolute paranoia" regarding data leakage. The `mock-db` layer uses `Zod` schemas and custom DTOs to mathematically guarantee that internal lawyer notes and risk scores are physically stripped from the data payloads before reaching client views. This prepares the architecture for strict Row Level Security (RLS) in production.
