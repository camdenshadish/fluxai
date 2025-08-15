"use client";
import React, { useCallback, useState } from 'react';
import 'react-flow-renderer/dist/style.css';
import ReactFlow, { addEdge, Background, Controls, MiniMap, Node, Edge, Connection } from 'react-flow-renderer';

const initialNodes: Node[] = [
  { id: 'brain-1', data: { label: 'Brain' }, position: { x: 100, y: 100 }, type: 'default' },
  { id: 'memory-1', data: { label: 'Memory' }, position: { x: 400, y: 100 }, type: 'default' }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'brain-1', target: 'memory-1', type: 'smoothstep' }
];

export default function EditorPage() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [prompt, setPrompt] = useState('');

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep' } as any, eds)), []);

  async function suggest() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/ai/suggest-workflow`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (res.ok) {
      setNodes(data.nodes);
      setEdges(data.edges);
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] m-4 rounded border overflow-hidden">
      <div className="p-2 flex gap-2 border-b">
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} className="border rounded p-2 flex-1" placeholder="Describe your agent..." />
        <button onClick={suggest} className="px-3 py-2 rounded bg-light-accent text-white">Suggest</button>
      </div>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={setNodes as any} onEdgesChange={setEdges as any} onConnect={onConnect}>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}


