import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../util/requireAuth.js';

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);

router.get('/:agentId', async (req, res) => {
  const userId = (req as any).userId as string;
  const agentId = req.params.agentId;
  const agent = await prisma.agent.findFirst({ where: { id: agentId, ownerId: userId } });
  if (!agent) return res.status(404).json({ error: 'Not found' });
  const messages = await prisma.chatMessage.findMany({ where: { agentId }, orderBy: { createdAt: 'asc' } });
  res.json({ messages });
});

router.post('/:agentId', async (req, res) => {
  const userId = (req as any).userId as string;
  const agentId = req.params.agentId;
  const agent = await prisma.agent.findFirst({ where: { id: agentId, ownerId: userId } });
  if (!agent) return res.status(404).json({ error: 'Not found' });
  const schema = z.object({ content: z.string().min(1) });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const msg = await prisma.chatMessage.create({ data: { agentId, role: 'user', content: parse.data.content } });
  // Placeholder assistant echo
  await prisma.chatMessage.create({ data: { agentId, role: 'assistant', content: `Echo: ${parse.data.content}` } });
  res.json({ ok: true });
});

export default router;


