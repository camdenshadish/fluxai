"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Agent = { id: string; name: string; description?: string };

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  async function load() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/agents`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setAgents(data.agents);
  }

  useEffect(() => { load(); }, []);

  async function createAgent() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, description })
    });
    if (res.ok) { setName(''); setDescription(''); load(); }
  }

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Agents</h1>
      <div className="flex gap-2">
        <input className="border rounded p-2 flex-1" placeholder="Agent name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border rounded p-2 flex-1" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="px-4 py-2 rounded bg-light-accent text-white" onClick={createAgent}>Create</button>
      </div>
      <ul className="grid md:grid-cols-2 gap-3">
        {agents.map((a) => (
          <li key={a.id} className="border rounded p-3 space-y-2">
            <div className="font-medium">{a.name}</div>
            <div className="text-sm text-gray-500">{a.description}</div>
            <div className="flex gap-3 text-sm">
              <Link href={`/agents/${a.id}/editor`} className="underline">Open Editor</Link>
              <Link href={`/agents/${a.id}`} className="underline">Details</Link>
              <a className="underline" href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/export/agent/${a.id}`}>Export</a>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}


