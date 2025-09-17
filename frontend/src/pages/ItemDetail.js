import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../state/DataContext';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const navigate = useNavigate();
  const { fetchItemDetail } = useData();

  useEffect(() => {
    fetchItemDetail(id)
      .then(setItem)
      .catch(() => navigate('/'));
  }, [id, navigate, fetchItemDetail]);

  if (!item) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="bg-white shadow rounded p-6 md:flex gap-6">
      <div className="w-full md:w-1/3 mb-4 md:mb-0">
        <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">Image</div>
      </div>
      <div className="flex-1">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:underline mb-2 inline-block"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-semibold mb-2">{item.name}</h2>
        <p className="text-gray-600 mb-2"><strong>Category:</strong> {item.category}</p>
        <p className="text-gray-800 text-lg font-semibold mb-4">${item.price}</p>
        {item.description && <p className="mt-2 text-gray-700">{item.description}</p>}
      </div>
    </div>
  );
}

export default ItemDetail;