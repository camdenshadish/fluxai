import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../util/requireAuth.js';
import { startExecution } from '../services/runtime.js';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

export default function createExecRouter(io: Server) {
  const router = Router();
  router.use(requireAuth);

  router.post('/start/:workflowId', async (req, res) => {
    const userId = (req as any).userId as string;
    const workflowId = req.params.workflowId;
    const wf = await prisma.workflow.findUnique({ where: { id: workflowId }, include: { agent: true } });
    if (!wf || wf.agent.ownerId !== userId) return res.status(404).json({ error: 'Not found' });
    const id = await startExecution(io, workflowId);
    res.json({ executionId: id });
  });

  router.get('/status/:executionId', async (req, res) => {
    const exec = await prisma.execution.findUnique({ where: { id: req.params.executionId } });
    if (!exec) return res.status(404).json({ error: 'Not found' });
    res.json({ status: exec.status, logs: exec.logs });
  });

  router.post('/stop/:executionId', async (req, res) => {
    const exec = await prisma.execution.findUnique({ where: { id: req.params.executionId } });
    if (!exec) return res.status(404).json({ error: 'Not found' });
    await prisma.execution.update({ where: { id: exec.id }, data: { status: 'canceled' } });
    res.json({ ok: true });
  });

  return router;
}


