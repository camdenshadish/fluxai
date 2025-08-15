import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';
import { requireAuth } from '../util/requireAuth.js';

const prisma = new PrismaClient();
const router = Router();

const createSchema = z.object({ workflowId: z.string(), type: z.string(), config: z.any() });

router.use(requireAuth);

router.post('/', async (req, res) => {
  const userId = (req as any).userId as string;
  const parse = createSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const wf = await prisma.workflow.findUnique({ where: { id: parse.data.workflowId }, include: { agent: true } });
  if (!wf || wf.agent.ownerId !== userId) return res.status(404).json({ error: 'Not found' });
  const secret = crypto.randomBytes(16).toString('hex');
  const trig = await prisma.trigger.create({ data: { ...parse.data, secret } });
  res.json({ trigger: trig, url: `${req.protocol}://${req.get('host')}/t/${trig.secret}` });
});

router.get('/list/:agentId', async (req, res) => {
  const userId = (req as any).userId as string;
  const agentId = req.params.agentId;
  const wfs = await prisma.workflow.findMany({ where: { agentId }, include: { agent: true } });
  if (!wfs.length || wfs[0].agent.ownerId !== userId) return res.status(404).json({ error: 'Not found' });
  const ids = wfs.map((w) => w.id);
  const triggers = await prisma.trigger.findMany({ where: { workflowId: { in: ids } } });
  const base = `${req.protocol}://${req.get('host')}`;
  res.json({ triggers: triggers.map((t) => ({ id: t.id, type: t.type, url: `${base}/t/${t.secret}` })) });
});

export default router;


