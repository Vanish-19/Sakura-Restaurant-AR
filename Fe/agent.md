# Frontend System Guide (agent.md)

This document defines the frontend baseline for this project so new code follows one style and scales safely.

## 1) Tech Stack

- Framework: React 19 (Vite)
- Routing: react-router-dom
- UI library: Ant Design (antd) + @ant-design/icons
- Styling: Tailwind CSS v4 + utility classes
- Data fetch: native fetch (wrapped by service layer)
- State (local app): React Context + useReducer (CartContext)
- Build tool: Vite
- Linting: ESLint (react-hooks + react-refresh)

## 2) Runtime Config

Use environment variables for deploy flexibility:

- `VITE_API_BASE_URL` -> backend REST base URL

If missing, app falls back to:

- `http://localhost:3000/api/v1`

## 3) Current Folder Structure

```txt
src/
  components/
    atoms/
    molecules/
    organisms/
    templates/
      admin/
  contexts/
  data/
    admin/
  pages/
    admin/
  services/
  utils/
  styles/
  App.jsx
  main.jsx
```

## 4) Naming Conventions

### 4.1 Files and Folders

- React component files: `PascalCase.jsx`
  - Example: `MenuItemCard.jsx`, `AppHeader.jsx`
- Context files: `PascalCase.jsx`
  - Example: `CartContext.jsx`
- Service and utility files: `camelCase.js`
  - Example: `apiClient.js`, `orderApi.js`, `orderSource.js`
- Page files: `PascalCase.jsx`
  - Example: `HomePage.jsx`, `CartPage.jsx`
- Folder names: `lowercase`
  - Example: `services`, `utils`, `pages`

### 4.2 Symbols

- Component names: `PascalCase`
- Hook names: `useXxx`
- Event handlers: `handleXxx`
- Booleans: `isXxx`, `hasXxx`, `canXxx`
- Constant values: `UPPER_SNAKE_CASE` for fixed global constants

## 5) Atomic Design Rules

- `atoms`: smallest reusable UI parts (badge, icon label, brand mark)
- `molecules`: combinations of atoms (item card row, feature pill)
- `organisms`: larger sections (header, category bar, footer)
- `templates`: layout wrappers (AppLayout, AndroidFrame)
- `pages`: route-level screens only, no heavy low-level UI duplication

Rule: if UI repeats 2+ times, extract it to `components/`.

## 6) Routing Rules

Define routes in `App.jsx` only.

Current client routes:

- `/` -> home (delivery mode)
- `/order` -> home (dine-in QR entry)
- `/cart` -> cart

Current admin routes:

- `/admin/dashboard`
- `/admin/food`
- `/admin/orders`
- `/admin/content`
- `/admin/users`
- `/admin/admins`

Order source is derived from query params (for example `?table=A12`).

Rule: client and admin layouts must remain separated by route group.

## 7) API Integration Rules

### 7.1 Service Layer Only

Do not call `fetch` directly inside reusable UI components.

- `services/apiClient.js`: low-level request utility
- `services/orderApi.js`: domain endpoints (menu, order, table scan, takeaway)

### 7.2 Error Handling

- Service functions throw `Error` with status + payload when possible
- UI layer handles user-friendly messages via `antd` message

### 7.3 Auth/Session

- Table token is obtained from `/tables/scan`
- Store table token per table in `sessionStorage`
- For dine-in order API, always send `Authorization: Bearer <table_token>`

### 7.4 FE-BE Contract Baseline

Backend should keep response envelopes stable for frontend scaling:

- List APIs: `{ data: [...] }`
- Detail/Create APIs: `{ data: {...} }` or documented direct object
- Error APIs: `{ message: string, code?: string, details?: any }`

Recommended minimal backend fields for menu item:

- `id` or `_id`
- `name`
- `price`
- `category`
- `description`
- `assets.image_url`
- `assets.ar_models.glb|usdz` (optional)

Recommended minimal order creation contract:

- Dine-in request item: `{ menu_item_id, quantity, note }`
- Takeaway request: `{ customer_name, customer_phone, delivery_address, items[] }`

Status codes FE expects:

- `200/201` success
- `400` validation input invalid
- `401` token invalid/expired
- `403` forbidden
- `404` not found
- `500` internal server error

## 8) State Management Rules

`CartContext` manages cart state with scoped carts:

- `delivery` scope
- `table:<TABLE_CODE>` scope

Never mix items from different scopes.

When scope changes (table change or delivery mode), UI should reflect that immediately.

## 9) UI and Styling Rules

- Keep page base background in white/washi tone (`#FFFFFF` / `#F9F9F6`)
- Keep deep red as accent (`#8B0000` / close variants)
- Use consistent hover transitions:
  - subtle translateY
  - soft shadow
  - smooth color shift
- Use Tailwind utility classes first; use custom CSS only when utility classes are insufficient

## 10) New Feature Workflow (Required)

When adding new features, follow this flow:

1. Add/extend API calls in `services/*`
2. Add/extend pure helpers in `utils/*`
3. Add state handling in `contexts/*` if global/shared
4. Build UI in Atomic levels (`atoms` -> `molecules` -> `organisms`)
5. Add/update page route in `App.jsx`
6. Add user feedback (loading/success/error)
7. Run lint/build before merge

Admin feature workflow adds:

8. Build page-level section in `pages/admin/*`
9. Reuse `AdminDataTable` and `AdminStatCard` before creating custom variants
10. Keep responsive behavior for `< 992px` (tablet/mobile)

## 11) Code Quality Checklist

Before finishing any task, verify:

- No direct business logic duplicated across pages
- No direct `fetch` in visual-only components
- Naming follows conventions above
- Route/query behavior preserved (`preview`, `table`, etc.)
- `pnpm build` passes
- Important flows tested:
  - delivery checkout
  - dine-in checkout with table token
  - cart scope isolation by table

## 12) Suggested Next Scale Steps

- Introduce typed DTOs (TypeScript or JSDoc typedefs) for API payloads
- Add React Query for cache/retry/invalidation
- Add form layer for checkout (replace `prompt`)
- Add socket.io-client integration for real-time order updates
- Add role-based route groups for admin/kitchen/cashier

## 13) Admin UI Conventions

- Sidebar and topbar use Ant Design components and custom style from `src/styles/admin.css`
- Tables in admin pages must use Ant Design `Table` via shared wrapper `AdminDataTable`
- Global admin palette:
  - background: `#f5f5f6`
  - panel: `#ffffff`
  - accent red: `#900020` or `#bc1a2f`
- Use compact stat cards and section headers to keep dashboards scannable

## 14) Backend Collaboration Notes (For BE Team)

When backend adds new modules, follow these rules so frontend can integrate quickly:

1. Keep endpoint naming resource-first and versioned under `/api/v1`
2. Avoid breaking field names in existing payloads
3. Return machine-readable status transitions for orders (`pending`, `cooking`, `served`, `paid`)
4. Emit socket events with stable event names and object payloads
5. Include primary IDs in all rows for table rendering actions
6. Document any auth changes and token expiry behavior

If backend changes payload shape, update API docs and this file in the same PR.

---

If a new code change conflicts with this guide, update this file in the same PR so the guide remains the single source of truth.
