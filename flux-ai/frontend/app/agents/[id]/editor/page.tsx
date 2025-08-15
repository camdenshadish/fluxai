"use client";
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import 'react-flow-renderer/dist/style.css';
import ReactFlow, { addEdge, Background, Controls, MiniMap, Node, Edge, Connection } from 'react-flow-renderer';
import io from 'socket.io-client';

const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AgentEditorPage() {
  const params = useParams();
  const agentId = params?.id as string;
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [workflowId, setWorkflowId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [inspector, setInspector] = useState<{ id: string; type: string } | null>(null);
  const [code, setCode] = useState('');
  const [expr, setExpr] = useState('1 + 2');
  const [testResult, setTestResult] = useState<string>('');

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);

  async function loadOrCreate() {
    const res = await fetch(`${api}/workflows/${agentId}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok && data.workflows.length) {
      const wf = data.workflows[0];
      setWorkflowId(wf.id);
      setNodes(wf.graph?.nodes ?? []);
      setEdges(wf.graph?.edges ?? []);
    } else {
      const createRes = await fetch(`${api}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agentId, name: 'Main', graph: { nodes: [], edges: [] } })
      });
      const createData = await createRes.json();
      setWorkflowId(createData.workflow.id);
    }
  }

  useEffect(() => { if (agentId && token) loadOrCreate(); }, [agentId, token]);
  useEffect(() => {
    (async () => {
      const res = await fetch(`${api}/ai/templates`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setTemplates(data.templates);
    })();
  }, [token]);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge({ ...(params as Edge), type: 'smoothstep' }, eds)), []);

  async function save() {
    if (!workflowId) return;
    setSaving(true);
    await fetch(`${api}/workflows/${workflowId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ graph: { nodes, edges } })
    });
    setSaving(false);
  }

  async function run() {
    if (!workflowId) return;
    const res = await fetch(`${api}/exec/start/${workflowId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) return;
    const execId = data.executionId as string;
    const socket = io(api);
    socket.on(`exec:${execId}:log`, (m: any) => setLogs((l) => [...l, `${m.level.toUpperCase()}: ${m.message}`]));
    socket.on(`exec:${execId}:done`, (m: any) => setLogs((l) => [...l, `DONE: ${m.status}`]));
    socket.on(`exec:${execId}:node`, (m: any) => setLogs((l) => [...l, `NODE ${m.nodeId}: ${JSON.stringify(m.output)}`]));
  }

  async function sendChat() {
    if (!agentId || !chatInput.trim()) return;
    await fetch(`${api}/chat/${agentId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: chatInput }) });
    setChatInput('');
  }

  function addTemplate(t: any) {
    const id = `${t.id}-${Date.now()}`;
    setNodes((prev) => [...prev, { id, type: t.type as any, data: {}, position: { x: 100, y: 100 } }]);
  }

  function selectNode(nodeId: string) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setInspector({ id: node.id, type: node.type || 'default' });
  }

  async function testExpression() {
    if (!workflowId) return;
    const res = await fetch(`${api}/workflows/${workflowId}/test-node`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ mode: 'expr', codeOrExpr: expr, contextOrInput: {} }) });
    const data = await res.json();
    setTestResult(JSON.stringify(data));
  }

  async function testCode() {
    if (!workflowId) return;
    const res = await fetch(`${api}/workflows/${workflowId}/test-node`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ mode: 'code', codeOrExpr: code, contextOrInput: {} }) });
    const data = await res.json();
    setTestResult(JSON.stringify(data));
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-[calc(100vh-2rem)] m-4 gap-2">
      <div className="flex items-center gap-2">
        <button onClick={save} className="px-3 py-2 rounded bg-light-accent text-white disabled:opacity-60" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button onClick={run} className="px-3 py-2 rounded border">Run</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 rounded border overflow-hidden">
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={setNodes as any} onEdgesChange={setEdges as any} onConnect={onConnect} onNodeClick={(_, n) => selectNode(n.id)}>
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>
        <div className="rounded border p-2 overflow-auto space-y-4">
          <div>
            <div className="font-medium mb-2">Logs</div>
            <pre className="text-xs whitespace-pre-wrap">{logs.join('\n')}</pre>
          </div>
          <div>
            <div className="font-medium mb-2">Add Node from Template</div>
            <ul className="text-sm space-y-1">
              {templates.map((t) => (
                <li key={t.id}>
                  <button className="underline" onClick={() => addTemplate(t)}>{t.name}</button>
                </li>
              ))}
            </ul>
          </div>
          {inspector && (
            <div className="space-y-2">
              <div className="font-medium">Node Inspector</div>
              <div className="text-xs text-gray-500">{inspector.id} ({inspector.type})</div>
              <div className="space-y-2">
                <div>
                  <div className="text-sm mb-1">Quick Expression</div>
                  <input className="border rounded p-2 w-full" value={expr} onChange={(e) => setExpr(e.target.value)} />
                  <button onClick={testExpression} className="mt-2 px-3 py-2 rounded border">Test</button>
                </div>
                <div>
                  <div className="text-sm mb-1">Custom Code</div>
                  <textarea className="border rounded p-2 w-full h-24" value={code} onChange={(e) => setCode(e.target.value)} placeholder={'function run(input) {\n  return input;\n}'} />
                  <button onClick={testCode} className="mt-2 px-3 py-2 rounded border">Run</button>
                </div>
                {testResult && (
                  <pre className="text-xs whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-2 rounded">{testResult}</pre>
                )}
              </div>
            </div>
          )}
          <div>
            <div className="font-medium mb-2">Side Chat</div>
            <div className="flex gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="border rounded p-2 flex-1" placeholder="Ask to modify nodes..." />
              <button onClick={sendChat} className="px-3 py-2 rounded border">Send</button>
            </div>
          </div>
        </div>
      </div>
      <div />
    </div>
  );
}
