"use client";
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AgentSettingsPage() {
  const params = useParams();
  const id = params?.id as string;
  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);
  const [mode, setMode] = useState<'native' | 'docker'>('native');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id || !token) return;
      const res = await fetch(`${api}/agents/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (res.ok) setMode(d.agent.executionMode || 'native');
      setLoaded(true);
    })();
  }, [id, token]);

  async function save() {
    const res = await fetch(`${api}/agents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ executionMode: mode }) });
    if (res.ok) alert('Saved');
  }

  if (!loaded) return <main className="p-6">Loading...</main>;

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Agent Settings</h1>
      <label className="block text-sm">Execution Mode</label>
      <select className="border rounded p-2" value={mode} onChange={(e) => setMode(e.target.value as any)}>
        <option value="native">Native</option>
        <option value="docker">Docker Sandbox</option>
      </select>
      <button onClick={save} className="block mt-3 px-4 py-2 rounded bg-light-accent text-white">Save</button>
    </main>
  );
}


