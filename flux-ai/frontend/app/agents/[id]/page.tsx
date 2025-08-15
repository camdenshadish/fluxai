"use client";
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AgentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);
  const [agent, setAgent] = useState<any>(null);
  const [provider, setProvider] = useState('openai');
  const [value, setValue] = useState('');
  const [creds, setCreds] = useState<any[]>([]);
  const [triggers, setTriggers] = useState<any[]>([]);

  async function load() {
    const a = await fetch(`${api}/agents/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    const aj = await a.json();
    if (a.ok) setAgent(aj.agent);
    const c = await fetch(`${api}/credentials/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    const cj = await c.json();
    if (c.ok) setCreds(cj.credentials);
    const t = await fetch(`${api}/triggers/list/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    const tj = await t.json();
    if (t.ok) setTriggers(tj.triggers);
  }

  useEffect(() => { if (id && token) load(); }, [id, token]);

  async function saveCred() {
    await fetch(`${api}/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ agentId: id, provider, value })
    });
    setValue('');
    load();
  }

  if (!agent) return <main className="p-6">Loading...</main>;

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{agent.name}</h1>
        <p className="text-sm text-gray-500">{agent.description}</p>
        <div className="mt-2 flex gap-3 text-sm">
          <a className="underline" href={`/agents/${id}/editor`}>Open Editor</a>
          <a className="underline" href={`/agents/${id}/analytics`}>Analytics</a>
          <a className="underline" href={`${api}/export/agent/${id}`}>Export</a>
          <a className="underline" href={`${api}/export/agent/${id}/saas`}>Export SaaS</a>
          <button className="underline" onClick={async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${api}/marketplace/publish/agent/${id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) alert('Published to marketplace');
          }}>Publish</button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="font-medium">Credentials</div>
        <div className="flex gap-2">
          <input className="border rounded p-2" placeholder="Provider" value={provider} onChange={(e) => setProvider(e.target.value)} />
          <input className="border rounded p-2 flex-1" placeholder="API Key / Secret" value={value} onChange={(e) => setValue(e.target.value)} />
          <button className="px-3 py-2 rounded bg-light-accent text-white" onClick={saveCred}>Add</button>
        </div>
        <ul className="text-sm list-disc pl-5">
          {creds.map((c) => (<li key={c.id}>{c.provider}</li>))}
        </ul>
      </div>
      <div className="space-y-2">
        <div className="font-medium">Triggers</div>
        <ul className="text-sm list-disc pl-5">
          {triggers.map((t) => (<li key={t.id}><span className="font-mono">{t.type}</span> - <a className="underline" href={t.url}>{t.url}</a></li>))}
        </ul>
      </div>
    </main>
  );
}


