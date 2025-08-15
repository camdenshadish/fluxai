"use client";
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function MarketplaceItemPage() {
  const params = useParams();
  const id = params?.id as string;
  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);
  const [item, setItem] = useState<any>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch(`${api}/marketplace/${id}`);
      const d = await res.json();
      if (res.ok) setItem(d.item);
    })();
  }, [id]);

  async function install() {
    const res = await fetch(`${api}/marketplace/install/${id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json();
    if (res.ok && d.installedAgentId) {
      setMsg('Installed. Opening editor...');
      window.location.href = `/agents/${d.installedAgentId}/editor`;
    } else if (res.ok) {
      setMsg('Installed.');
    }
  }

  if (!item) return <main className="p-6">Loading...</main>;

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">{item.name}</h1>
      <div className="text-sm text-gray-500">{item.kind}</div>
      <p>{item.description}</p>
      {msg && <div className="text-sm text-green-600">{msg}</div>}
      <button onClick={install} className="px-4 py-2 rounded bg-light-accent text-white">Install</button>
    </main>
  );
}


