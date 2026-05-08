# Moshtarikeen Hub PRO

نظام إدارة المشتركين المتقدم — منصة SaaS لإدارة المشتركين مع قسم إداري متقدم PRO بمستوى Enterprise.

## Run & Operate

- `pnpm --filter @workspace/moshtarikeen-pro run dev` — run the PRO web app (port 18929)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TailwindCSS 4 + Shadcn/UI
- Animations: Framer Motion
- Charts: Recharts
- Storage: localStorage only (no backend)
- Language: Arabic (RTL)

## Where things live

- `artifacts/moshtarikeen-pro/src/` — main web application
- `artifacts/moshtarikeen-pro/src/pages/Index.tsx` — base subscriber management system (3500+ lines)
- `artifacts/moshtarikeen-pro/src/pro/` — PRO advanced system
- `artifacts/moshtarikeen-pro/src/pro/ProApp.tsx` — PRO entry point
- `artifacts/moshtarikeen-pro/src/pro/ProLayout.tsx` — PRO sidebar + navigation
- `artifacts/moshtarikeen-pro/src/pro/store/` — state management + localStorage engine
- `artifacts/moshtarikeen-pro/src/pro/pages/` — all PRO pages (12 pages)
- `artifacts/moshtarikeen-pro/src/pro/components/` — shared PRO components
- `artifacts/moshtarikeen-pro/src/types/index.ts` — all shared TypeScript types
- `artifacts/moshtarikeen-pro/src/index.css` — luxury dark theme (gold/purple/blue)

## Architecture decisions

- Frontend-only: all data stored in localStorage under key `moshtarikeen_pro_v3`
- Data migration system with version tracking (v1→v2→v3)
- PRO system is isolated from base system — they share localStorage but have separate UI
- Base system uses existing Index.tsx (adapted from cloned-project, replacing `motion/react` with `framer-motion`)
- PRO section accessible via floating button on base system

## Product

- **Base System**: Full subscriber management (add/edit/delete subscribers + operations + profit inquiry + system config)
- **PRO Dashboard**: Executive KPI cards + live charts (area, bar, pie, radar)
- **Analytics Center**: Deep analytics with period filters
- **Subscriber Management**: Advanced CRUD with VIP levels, bulk actions, search/filter
- **Operations Log**: Full operations history with status tracking
- **Financial Center**: Revenue breakdowns by bank, currency, subscriber
- **Reports Center**: One-click CSV/JSON exports
- **Profit Inquiry**: Branded search system with progress animation
- **Audit Logs**: Full activity log with categories and search
- **System Health**: Data integrity gauges + backup manager
- **Task Manager**: Priority-based task system
- **Notification Center**: Multi-type notification hub
- **Settings**: Theme customization + session lock + auto-save

## User preferences

- Arabic RTL layout
- Glassmorphism luxury dark theme (gold + purple + blue)
- No backend — localStorage only
- Framer Motion for animations (NOT motion/react)

## Gotchas

- The base Index.tsx was copied from `cloned-project/` with `motion/react` → `framer-motion` replacement
- Storage key: `moshtarikeen_pro_v3` (v3 supports VIP levels, tasks, backups, etc.)
- PRO system uses dark background by default; switching to light mode changes CSS class on `document.documentElement`
- The Ctrl+K shortcut opens the command palette in PRO mode
