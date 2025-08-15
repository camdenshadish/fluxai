import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import { startExecution } from '../services/runtime.js';

const prisma = new PrismaClient();

export default function createPublicRouter(io: Server) {
  const router = Router();

  router.all('/t/:secret', async (req, res) => {
    const secret = req.params.secret;
    const trig = await prisma.trigger.findUnique({ where: { secret }, include: { workflow: true } });
    if (!trig) return res.status(404).json({ error: 'Not found' });
    const execId = await startExecution(io, trig.workflowId);
    res.json({ ok: true, executionId: execId });
  });

  return router;
}


