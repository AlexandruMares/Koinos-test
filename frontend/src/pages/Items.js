import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';

function SkeletonItem() {
  return (
    <div className="h-16 px-2 flex items-center bg-gray-100 animate-pulse rounded mb-2" aria-hidden="true">
      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
    </div>
  );
}

function Items() {
  const { items, total, fetchItems, createItem } = useData();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const limit = 10;
  const debounceRef = useRef();
  const parentRef = useRef(null);

  // virtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 84,
    overscan: 5,
  });

  // Debounced search (1s)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQ(searchInput);
      setPage(1);
    }, 1000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  // Fetch items with AbortController to avoid memory leaks
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchItems({ page, limit, q, signal: controller.signal })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [fetchItems, page, q]);

  const totalPages = Math.ceil(total / limit);

  // no virtualization: pagination keeps items small (10 per page)

  // Renderer for react-window
  const Row = ({ index, style }) => {
    const item = items[index];
    if (!item) {
      return (
        <div style={style} className="px-2">
          <SkeletonItem />
        </div>
      );
    }
    return (
      <div style={style} className="px-2">
        <div className="bg-white shadow rounded p-3 h-full flex items-center transition hover:shadow-lg">
          <Link
            to={`/items/${item.id}`}
            className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            aria-label={`View details for ${item.name}`}
          >
            {item.name}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <section aria-labelledby="items-heading" className="max-w-md mx-auto mt-8">
      <h2 id="items-heading" className="text-xl font-semibold mb-4 text-gray-800">
        Items
      </h2>

      <div className="mb-4">
        <form
          onSubmit={e => e.preventDefault()}
          role="search"
          aria-label="Search items"
          className="flex gap-2 mb-3"
        >
          <input
            type="search"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search items..."
            className="flex-1 border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <details className="bg-white p-3 rounded shadow mb-3">
          <summary className="cursor-pointer font-medium">+ Add product</summary>
          <AddProductForm onCreate={async (payload) => {
            try {
              const newItem = await createItem(payload);
              // reset search and go to first page so the created item appears on top
              setSearchInput('');
              setQ('');
              setPage(1);
              // fetch page 1 (backend prepends new items)
              await fetchItems({ page: 1, limit, q: '' });
              // ensure the context includes the new item at top (createItem already prepends)
              // (no-op) if needed, we could update local state here
            } catch (err) {
              console.error(err);
              alert('Failed to create item');
            }
          }} />
        </details>
      </div>

      {loading ? (
        // show small virtualized skeleton block for consistency
        <div className="space-y-2">
          {Array.from({ length: limit }).map((_, i) => <SkeletonItem key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No items found.</p>
      ) : (
        <div>
          <div ref={parentRef} className="overflow-auto mb-4" style={{height: 360}}>
            <div style={{height: rowVirtualizer.getTotalSize(), position: 'relative'}}>
              {rowVirtualizer.getVirtualItems().map(virtualRow => {
                const item = items[virtualRow.index];
                return (
                  <div
                    key={item.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`
                    }}
                  >
                    <div className="bg-white shadow rounded p-4 hover:shadow-lg transition flex items-center gap-4 mb-3" style={{height: 72}}>
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">📦</div>
                      <div className="flex-1">
                        <Link
                          to={`/items/${item.id}`}
                          className="text-lg font-medium text-gray-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                          aria-label={`View details for ${item.name}`}
                        >
                          {item.name}
                        </Link>
                        <div className="text-sm text-gray-500">{item.category || 'General'}</div>
                      </div>
                      <div className="text-right">
                        <div className="inline-block bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">${item.price}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="flex justify-between items-center mt-4" aria-label="Pagination">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Previous page"
        >
          Prev
        </button>
        <span className="mx-2 text-sm text-gray-700">
          Page {page} of {totalPages || 1}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Next page"
        >
          Next
        </button>
      </nav>
    </section>
  );
}

export default Items;

function AddProductForm({ onCreate }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) return alert('Name and price required');
    await onCreate({ name, category, price: parseFloat(price) });
    setName(''); setCategory(''); setPrice('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid gap-2">
      <input className="border px-2 py-1 rounded" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input className="border px-2 py-1 rounded" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
      <input className="border px-2 py-1 rounded" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
      <div>
        <button className="bg-blue-600 text-white px-3 py-1 rounded">Create</button>
      </div>
    </form>
  );
}