import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import { WorkflowGraph } from '../types/graph.js';

type ExecutionLog = Array<{ ts: number; level: 'info' | 'error'; message: string; data?: any }>;

const prisma = new PrismaClient();

export async function startExecution(io: Server, workflowId: string): Promise<string> {
  const wf = await prisma.workflow.findUnique({ where: { id: workflowId }, include: { agent: true } });
  if (!wf) throw new Error('Workflow not found');
  const graph = wf.graph as unknown as WorkflowGraph;
  const logs: ExecutionLog = [];
  const execution = await prisma.execution.create({ data: { workflowId, status: 'running', logs: [] } });
  const execId = execution.id;

  function log(level: 'info' | 'error', message: string, data?: any) {
    logs.push({ ts: Date.now(), level, message, data });
    io.emit(`exec:${execId}:log`, { level, message, data });
  }

  try {
    log('info', `Execution mode: ${(wf as any).agent?.executionMode || 'native'}`);
    const outputs = new Map<string, any>();
    for (const node of graph.nodes) {
      log('info', `Executing node ${node.id} (${node.type})`);
      switch (node.type) {
        case 'trigger':
          outputs.set(node.id, { triggered: true });
          break;
        case 'brain':
          outputs.set(node.id, { response: `Brain processed: ${JSON.stringify(node.data)}` });
          break;
        case 'api':
          outputs.set(node.id, { result: { ok: true } });
          break;
        case 'compute':
          outputs.set(node.id, { value: node.data?.value ?? null });
          break;
        case 'output':
          outputs.set(node.id, { done: true });
          break;
        default:
          outputs.set(node.id, {});
      }
      io.emit(`exec:${execId}:node`, { nodeId: node.id, output: outputs.get(node.id) });
      // track usage
      await prisma.nodeUsage.upsert({
        where: { workflowId_nodeId: { workflowId: wf.id, nodeId: node.id } },
        update: { count: { increment: 1 } },
        create: { workflowId: wf.id, nodeId: node.id, count: 1 }
      });
    }
    await prisma.execution.update({ where: { id: execId }, data: { status: 'completed', logs } });
    io.emit(`exec:${execId}:done`, { status: 'completed' });
  } catch (err: any) {
    log('error', err.message);
    await prisma.execution.update({ where: { id: execId }, data: { status: 'failed', logs } });
    io.emit(`exec:${execId}:done`, { status: 'failed' });
  }

  return execId;
}


