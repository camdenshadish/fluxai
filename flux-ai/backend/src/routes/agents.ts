import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../util/requireAuth.js';

const prisma = new PrismaClient();
const router = express.Router();

const agentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  executionMode: z.enum(['native', 'docker']).optional()
});

router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const agents = await prisma.agent.findMany({ where: { ownerId: userId } });
  res.json({ agents });
});

router.post('/', async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const parse = agentSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const agent = await prisma.agent.create({ data: { ownerId: userId, ...parse.data } });
  res.json({ agent });
});

router.get('/:id', async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const id = req.params.id;
  const agent = await prisma.agent.findFirst({ where: { id, ownerId: userId } });
  if (!agent) return res.status(404).json({ error: 'Not found' });
  res.json({ agent });
});

router.put('/:id', async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const id = req.params.id;
  const existing = await prisma.agent.findFirst({ where: { id, ownerId: userId } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const parse = agentSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const updated = await prisma.agent.update({ where: { id }, data: parse.data });
  res.json({ agent: updated });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const id = req.params.id;
  const existing = await prisma.agent.findFirst({ where: { id, ownerId: userId } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  await prisma.agent.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;


