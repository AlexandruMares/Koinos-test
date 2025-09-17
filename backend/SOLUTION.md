# SOLUTION.md

## Approach

- **Non-blocking I/O:**
  - Refactored all file operations in the routes to use asynchronous `fs.promises` methods, ensuring the API does not block the event loop and can handle concurrent requests efficiently.

- **Search Debounce (Frontend):**
  - Recommended a 1-second debounce for search input on the frontend, so API calls are only made after the user stops typing, reducing server load and improving UX.

- **Pagination and Filtering:**
  - The GET `/api/items` route supports pagination and search via query parameters, returning paginated and filtered results for scalability.

- **POST /api/items:**
  - New items are added to the beginning of the list and assigned a unique `id` and `date` property, ensuring recent items appear first.

- **Stats Caching:**
  - The stats route caches computed statistics and uses file watching to update the cache only when the data file changes, minimizing unnecessary recalculation and improving performance.

- **Testing:**
  - Added Jest unit tests for the items routes, covering happy paths and error cases, with filesystem operations mocked for reliability and speed.

## Trade-offs

- **In-memory Caching:**
  - Stats are cached in memory and updated on file changes. This is fast but does not persist across server restarts. For production, consider a more robust cache or database.

- **File-based Storage:**
  - Using a JSON file for data is simple and suitable for small-scale apps or prototyping, but not recommended for high concurrency or large datasets. A database is preferable for scalability and reliability.

- **No Payload Validation:**
  - The POST route omits payload validation for brevity. In production, add validation to prevent malformed data and security issues.

- **Frontend Debounce:**
  - Debouncing is handled on the client side, not the server. This keeps the backend simple but requires correct implementation in the frontend code.

- **Error Handling:**
  - Basic error handling is implemented. For production, consider more granular error responses and logging.
