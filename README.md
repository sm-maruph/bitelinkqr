# BiteLink Frontend

Frontend-first React/Vite demo for the BiteLink restaurant SaaS platform. It uses deterministic mock data and a persistent local mock store. No backend, database, authentication provider, or real payment integration is included.

## Run

```bash
npm install
npm run dev
```

Open `/` for the restaurant owner portal, `/kacchivai/dhanmondi/table/12` for the customer QR experience, or `/super-admin` for the platform portal.

## Demo controls

The fixed Demo mode toolbar switches role, restaurant, and outlet. Available roles are restaurant owner, restaurant manager, outlet manager, order staff, kitchen staff, super admin, and guest customer. Changing a restaurant selects its first valid outlet automatically.

## Architecture

- `src/App.jsx` coordinates view state and URL entry points.
- `src/components/` contains shared chrome and portal/page components.
- `src/data/mockData.js` contains deterministic seed data.
- `src/services/mockStore.js` is the persistence and synchronization boundary.
- `src/services/*Service.js` are API-shaped service adapters.
- `src/hooks/useMockStore.js` subscribes components to shared mock changes.
- `src/types/domain.js` contains domain status and permission rules.

The intended future flow is `UI -> service adapter -> REST API -> Node/Express -> relational database`. Replacing mock services should not require rewriting portal components.

## Persistence

The mock store uses `localStorage` under `bitelink-demo-store` and dispatches a `bitelink:store` browser event. This allows menu availability and new orders to be shared by the demo surfaces in the current browser.

Images are remote Unsplash demo assets and should be replaced by restaurant-managed uploads later.
