import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Items from './Items';
import ItemDetail from './ItemDetail';
import { DataProvider } from '../state/DataContext';

function App() {
  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold">My Store</Link>
            <nav className="text-sm opacity-90">
              <Link to="/" className="hover:underline">Items</Link>
            </nav>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Items />} />
            <Route path="/items/:id" element={<ItemDetail />} />
          </Routes>
        </main>
        <footer className="mt-12 py-6 text-center text-sm text-gray-500">
          Submitted by Alexandru Mares — Koinos Technical Test
        </footer>
      </div>
    </DataProvider>
  );
}

export default App;