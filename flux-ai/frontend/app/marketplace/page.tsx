"use client";
import { useEffect, useState } from 'react';

const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function MarketplacePage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${api}/marketplace`);
      const data = await res.json();
      if (res.ok) setItems(data.items);
    })();
  }, []);

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Marketplace</h1>
      <ul className="grid md:grid-cols-3 gap-3">
        {items.map((i) => (
          <li key={i.id} className="border rounded p-3">
            <div className="font-medium">{i.name}</div>
            <div className="text-sm text-gray-500">{i.kind}</div>
            <p className="text-sm mt-2">{i.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}


