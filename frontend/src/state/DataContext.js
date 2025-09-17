import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // fetchItems supports search and pagination
  const fetchItems = useCallback(async ({ page = 1, limit = 20, q = '' } = {}) => {
    const params = new URLSearchParams({ page, limit, q });
    const res = await fetch(`http://localhost:3001/api/items?${params}`);
    const json = await res.json();
    setItems(json.items);
    setTotal(json.total);
    return json;
  }, []);

  // fetchItemDetail fetches a single item's details by id
  const fetchItemDetail = useCallback(async (id) => {
    const res = await fetch(`http://localhost:3001/api/items/${id}`);
    if (!res.ok) throw new Error('Item not found');
    return await res.json();
  }, []);

  // createItem posts a new item to the backend and updates local state
  const createItem = useCallback(async (item) => {
    const res = await fetch('http://localhost:3001/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to create item');
    const newItem = await res.json();
    // optimistic update: append to local items
    setItems(prev => [newItem, ...prev]);
    setTotal(prev => prev + 1);
    return newItem;
  }, []);

  return (
    <DataContext.Provider value={{ items, total, fetchItems, fetchItemDetail, createItem }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);