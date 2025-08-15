import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../util/requireAuth.js';
import { encryptSecret } from '../services/encryption.js';

const prisma = new PrismaClient();
const router = Router();

const schema = z.object({
  agentId: z.string(),
  provider: z.string(),
  value: z.string()
});

router.use(requireAuth);

router.post('/', async (req, res) => {
  const userId = (req as any).userId as string;
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { agentId, provider, value } = parse.data;
  const agent = await prisma.agent.findFirst({ where: { id: agentId, ownerId: userId } });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  const { ciphertext, iv } = encryptSecret(value);
  const cred = await prisma.credential.create({ data: { agentId, provider, encryptedValue: ciphertext, iv } });
  res.json({ credentialId: cred.id, provider: cred.provider });
});

router.get('/:agentId', async (req, res) => {
  const userId = (req as any).userId as string;
  const agentId = req.params.agentId;
  const agent = await prisma.agent.findFirst({ where: { id: agentId, ownerId: userId } });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  const creds = await prisma.credential.findMany({ where: { agentId }, select: { id: true, provider: true, createdAt: true } });
  res.json({ credentials: creds });
});

export default router;


