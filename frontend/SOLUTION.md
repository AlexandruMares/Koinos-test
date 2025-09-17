SOLUTION
========

Overview
--------
This small React frontend + simple JSON backend is a technical test submission for Koinos by Alexandru Mares. It demonstrates:

- Search and server-side pagination (page, limit, q)
- Item detail view fetched from `/api/items/:id`
- Create item (POST `/api/items`) with optimistic UI update
- Tailwind CSS-based UI with improved accessibility and focus states
- Virtualized scrolling using `@tanstack/react-virtual` for the items scroll area

Approach
--------
- Architecture: a lightweight React app using a `DataContext` provider to encapsulate API calls (`fetchItems`, `fetchItemDetail`, `createItem`). This keeps data fetching logic separated from UI components.

- Styling: Tailwind CSS (v3) for fast utility-driven UI. `src/index.css` includes Tailwind directives and a tiny `.card` helper.

- Search & Pagination: Client sends `page`, `limit`, and `q` to the backend. Backend performs substring filtering and returns `items` + `total` (server implements pagination so clients only request 10 items per page).

- Create Item: Frontend posts new items to POST `/api/items`. Backend prepends the new item to the dataset. Frontend optimistically prepends the new item to local state and also re-fetches page 1 to ensure consistency.

- Virtualization: The items list area is a fixed-height scrollable container. I used `@tanstack/react-virtual` to only render visible rows for smooth performance when lists grow large.

Trade-offs & Notes
------------------
- Tailwind Version: I used Tailwind v3 to ensure compatibility with CRA (`react-scripts`) and PostCSS. Tailwind v4 requires additional PostCSS integration (`@tailwindcss/postcss`) and can add install complexity.

- Virtualization: I chose `@tanstack/react-virtual` (v3) for React 18 compatibility. It requires a fixed-height scroll container which is fine for this UI, but if you prefer full-page virtualization or windowing, additional layout adjustments are needed.

- Optimistic Update: `createItem` performs an optimistic prepend. This improves perceived performance but requires careful error handling to rollback on failure; currently we show a basic alert on failure.

- Input Validation: Server-side validation is intentionally minimal in the test backend; production code should validate payloads on the server and sanitize inputs.

- Dependency Resolution: There were some peer dependency conflicts (react-window, shadcn). I removed `react-window` and used TanStack virtual instead. I used `npm install --legacy-peer-deps` where needed during setup.

Potential Improvements
----------------------
- Implement server-side validation for POST `/api/items` and return well-formed errors.
- Add unit / integration tests around data fetching and the create flow.
- Replace alert() with user-friendly toasts and better error states.
- Add image handling for items and richer metadata (stock, SKU, etc.).
- Improve accessibility by adding ARIA roles and keyboard interactions for the virtual list.

How to run
----------
- Start backend on port 3001 (server code provided separately).
- In the frontend folder:
  ```bash
  npm install --legacy-peer-deps
  npm start
  ```

Contact
-------
Alexandru Mares
globalarhitect@gmail.com
