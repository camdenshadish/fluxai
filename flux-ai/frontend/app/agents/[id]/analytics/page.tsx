"use client";
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AgentAnalyticsPage() {
  const params = useParams();
  const agentId = params?.id as string;
  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!agentId || !token) return;
      const res = await fetch(`${api}/analytics/agent/${agentId}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (res.ok) setData(d);
    })();
  }, [agentId, token]);

  if (!data) return <main className="p-6">Loading...</main>;

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Analytics</h1>
      <section>
        <h2 className="font-medium mb-2">Executions by status</h2>
        <ul className="list-disc pl-5 text-sm">
          {data.executionsByStatus.map((s: any) => (
            <li key={s.status}>{s.status}: {s._count._all}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-medium mb-2">Node usage</h2>
        <ul className="list-disc pl-5 text-sm">
          {data.nodeUsage.map((u: any) => (
            <li key={u.nodeId}>{u.nodeId}: {u._sum.count}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}


