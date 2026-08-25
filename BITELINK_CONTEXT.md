# BiteLink Working Context

## Scope
Frontend-only React/Vite demo. The backend, database, real authentication, and real payment gateway are intentionally not implemented yet.

## Run and validate

```bash
npm run dev
npm run build
npm run lint
```

## Entry points

- `/` opens the restaurant portal.
- `/admin` opens the restaurant portal.
- `/super-admin` opens the platform portal.
- `/:restaurant/:outlet/table/:table` opens the customer portal.
- The fixed Demo mode bar switches role, restaurant, and outlet.

## Architecture

- `src/App.jsx`: application coordinator and portal selection.
- `src/components/PortalChrome.jsx`: shared button, header, sidebar, stat card, and demo context controls.
- `src/components/AdminPages.jsx`: restaurant operations pages.
- `src/components/SuperAdminPortal.jsx`: platform-wide portal.
- `src/pages/customer/CustomerPortalPage.jsx`: customer page composition only.
- `src/components/customer/`: customer header, hero, category tabs, food cards, detail modal, cart, tracker, bill/payment, requests, and bottom navigation.
- `src/data/mockData.js`: deterministic restaurant, role, menu, order, and team seeds.
- `src/services/mockStore.js`: localStorage-backed shared mock state and browser event synchronization.
- `src/services/*Service.js`: API-shaped adapters for future REST services.
- `src/hooks/useMockStore.js`: subscribes React components to mock state.
- `src/types/domain.js`: role/status constants and permission helper.

## Demo roles

- Restaurant owner: full restaurant business view.
- Restaurant manager: restaurant operations and menu view.
- Outlet manager: one outlet's orders, tables, menu, and payments.
- Order staff: orders, tables, and customer requests only.
- Kitchen staff: kitchen queue and preparation status only.
- Super admin: global platform metrics and restaurants.
- Guest customer: QR menu, cart, order tracking, bill, payment, and assistance.

Role and tenant checks in this demo are visual only. Real authorization must be enforced server-side later.

## Shared mock flows

Menu availability, orders, payments, and customer requests persist under localStorage key `bitelink-demo-store`. Components subscribe to the `bitelink:store` browser event. Orders snapshot item details when created. Real API replacement should happen in `src/services`, not inside UI components.

## Design notes

Customer pages are full-width and responsive, with a sticky shortcut bar, food detail modal, cart drawer, payment controls, and request actions. Admin views are information-dense and role-specific. Use Lucide icons and preserve the green, terracotta, and paper visual language.

## Next backend phase

Build a Node/Express API with PostgreSQL, shared-database multi-tenancy, server-side RBAC, additive migrations, order price snapshots, payment audit history, rate limiting, validation, and tenant-scoped queries.
