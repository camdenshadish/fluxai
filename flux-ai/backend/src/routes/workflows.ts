import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../util/requireAuth.js';
import { runExpression, runCustomCode } from '../services/sandbox.js';

const prisma = new PrismaClient();
const router = express.Router();

const workflowSchema = z.object({
  agentId: z.string(),
  name: z.string().min(1),
  graph: z.any()
});

router.use(requireAuth);

router.get('/:agentId', async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const agentId = req.params.agentId;
  const agent = await prisma.agent.findFirst({ where: { id: agentId, ownerId: userId } });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  const workflows = await prisma.workflow.findMany({ where: { agentId } });
  res.json({ workflows });
});

router.post('/', async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const parse = workflowSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { agentId } = parse.data;
  const agent = await prisma.agent.findFirst({ where: { id: agentId, ownerId: userId } });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  const workflow = await prisma.workflow.create({ data: parse.data });
  res.json({ workflow });
});

router.put('/:id', async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const id = req.params.id;
  const wf = await prisma.workflow.findUnique({ where: { id }, include: { agent: true } });
  if (!wf || wf.agent.ownerId !== userId) return res.status(404).json({ error: 'Not found' });
  const { name, graph } = req.body ?? {};
  const updated = await prisma.workflow.update({ where: { id }, data: { name: name ?? wf.name, graph: graph ?? wf.graph } });
  res.json({ workflow: updated });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const id = req.params.id;
  const wf = await prisma.workflow.findUnique({ where: { id }, include: { agent: true } });
  if (!wf || wf.agent.ownerId !== userId) return res.status(404).json({ error: 'Not found' });
  await prisma.workflow.delete({ where: { id } });
  res.json({ ok: true });
});

router.post('/:id/test-node', async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const id = req.params.id;
  const wf = await prisma.workflow.findUnique({ where: { id }, include: { agent: true } });
  if (!wf || wf.agent.ownerId !== userId) return res.status(404).json({ error: 'Not found' });
  const { mode, codeOrExpr, contextOrInput } = req.body as { mode: 'expr' | 'code'; codeOrExpr: string; contextOrInput: any };
  if (mode === 'expr') {
    const out = await runExpression(codeOrExpr, contextOrInput || {});
    return res.json(out);
  }
  const out = await runCustomCode(codeOrExpr, contextOrInput);
  return res.json(out);
});

export default router;


