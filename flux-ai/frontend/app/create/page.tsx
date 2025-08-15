"use client";
import { useState } from 'react';

const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function CreateAgentPage() {
  const [prompt, setPrompt] = useState('An agent that monitors a feed and posts to Slack');
  const [name, setName] = useState('New Agent');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function create() {
    setCreating(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const suggest = await fetch(`${api}/ai/suggest-workflow`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ prompt }) });
      const s = await suggest.json();
      if (!suggest.ok) throw new Error('Suggest failed');
      const agentRes = await fetch(`${api}/agents`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, description: prompt }) });
      const a = await agentRes.json();
      if (!agentRes.ok) throw new Error('Agent create failed');
      const wfRes = await fetch(`${api}/workflows`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ agentId: a.agent.id, name: 'Main', graph: { nodes: s.nodes, edges: s.edges } }) });
      if (!wfRes.ok) throw new Error('Workflow create failed');
      window.location.href = `/agents/${a.agent.id}/editor`;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Create Agent</h1>
      <input className="border rounded p-2 w-full" placeholder="Agent name" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea className="border rounded p-2 w-full h-40" placeholder="Describe your agent" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button onClick={create} disabled={creating} className="px-4 py-2 rounded bg-light-accent text-white">{creating ? 'Creating...' : 'Create Agent'}</button>
    </main>
  );
}


