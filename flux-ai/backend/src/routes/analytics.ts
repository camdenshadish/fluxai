import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../util/requireAuth.js';

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);

router.get('/agent/:agentId', async (req, res) => {
  const userId = (req as any).userId as string;
  const agentId = req.params.agentId;
  const agent = await prisma.agent.findFirst({ where: { id: agentId, ownerId: userId } });
  if (!agent) return res.status(404).json({ error: 'Not found' });

  const workflows = await prisma.workflow.findMany({ where: { agentId }, select: { id: true } });
  const workflowIds = workflows.map((w) => w.id);
  const execCount = await prisma.execution.groupBy({ by: ['status'], _count: { _all: true }, where: { workflowId: { in: workflowIds } } });
  const nodeUsage = await prisma.nodeUsage.groupBy({ by: ['nodeId'], _sum: { count: true }, where: { workflowId: { in: workflowIds } } });
  res.json({ executionsByStatus: execCount, nodeUsage });
});

export default router;


