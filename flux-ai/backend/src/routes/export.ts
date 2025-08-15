import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import archiver from 'archiver';
import { exportAgentAsSaaS } from '../services/exporter.js';
import { requireAuth } from '../util/requireAuth.js';

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);

router.get('/agent/:agentId', async (req, res) => {
  const userId = (req as any).userId as string;
  const agentId = req.params.agentId;
  const agent = await prisma.agent.findFirst({ where: { id: agentId, ownerId: userId }, include: { workflows: true } });
  if (!agent) return res.status(404).json({ error: 'Not found' });
  const bundle = {
    name: agent.name,
    description: agent.description,
    workflows: agent.workflows
  };
  res.setHeader('Content-Disposition', `attachment; filename="${agent.name.replace(/[^a-z0-9_-]/gi, '_')}.zip"`);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => res.status(500).end(err.message));
  archive.pipe(res);
  archive.append(JSON.stringify(bundle, null, 2), { name: 'agent.json' });
  await archive.finalize();
});

export default router;

export const addSaaSRoutes = (routerBase: typeof router) => {
  routerBase.get('/agent/:agentId/saas', async (req, res) => {
    const userId = (req as any).userId as string;
    const agentId = req.params.agentId;
    const agent = await prisma.agent.findFirst({ where: { id: agentId, ownerId: userId } });
    if (!agent) return res.status(404).json({ error: 'Not found' });
    await exportAgentAsSaaS(agentId, res);
  });
};


