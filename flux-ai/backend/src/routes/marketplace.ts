import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../util/requireAuth.js';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (_req, res) => {
  const items = await prisma.marketplaceItem.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ items });
});

router.post('/', requireAuth, async (req, res) => {
  const userId = (req as any).userId as string;
  const schema = z.object({ kind: z.string(), name: z.string(), description: z.string().optional(), payload: z.any(), priceCents: z.number().int().optional() });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const item = await prisma.marketplaceItem.create({ data: { ownerId: userId, ...parse.data } });
  res.json({ item });
});

router.post('/publish/agent/:agentId', requireAuth, async (req, res) => {
  const userId = (req as any).userId as string;
  const agentId = req.params.agentId;
  const agent = await prisma.agent.findFirst({ where: { id: agentId, ownerId: userId }, include: { workflows: true } });
  if (!agent) return res.status(404).json({ error: 'Not found' });
  const payload = { name: agent.name, description: agent.description, workflows: agent.workflows };
  const item = await prisma.marketplaceItem.create({ data: { ownerId: userId, kind: 'agent', name: agent.name, description: agent.description ?? undefined, payload } });
  res.json({ item });
});

router.get('/:itemId', async (req, res) => {
  const item = await prisma.marketplaceItem.findUnique({ where: { id: req.params.itemId } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ item });
});

router.post('/purchase/:itemId', requireAuth, async (req, res) => {
  // Stub: payment handling would go here
  const item = await prisma.marketplaceItem.findUnique({ where: { id: req.params.itemId } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.post('/install/:itemId', requireAuth, async (req, res) => {
  const userId = (req as any).userId as string;
  const item = await prisma.marketplaceItem.findUnique({ where: { id: req.params.itemId } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  const payload: any = item.payload as any;
  if (item.kind === 'agent') {
    const agent = await prisma.agent.create({ data: { ownerId: userId, name: payload.name || item.name, description: payload.description || item.description } });
    if (Array.isArray(payload.workflows)) {
      for (const wf of payload.workflows) {
        await prisma.workflow.create({ data: { agentId: agent.id, name: wf.name || 'Workflow', graph: wf.graph || { nodes: [], edges: [] } } });
      }
    }
    return res.json({ installedAgentId: agent.id });
  }
  // nodes/workflows could be handled similarly
  res.json({ ok: true });
});

export default router;


