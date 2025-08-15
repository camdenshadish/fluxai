import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { json } from 'express';
import authRouter from './routes/auth';
import agentsRouter from './routes/agents';
import workflowsRouter from './routes/workflows';
import credentialsRouter from './routes/credentials';
import createExecRouter from './routes/exec';
import triggersRouter from './routes/triggers';
import marketplaceRouter from './routes/marketplace';
import exportRouter, { addSaaSRoutes } from './routes/export';
import chatRouter from './routes/chat';
import aiRouter from './routes/ai';
import createPublicRouter from './routes/public';
import analyticsRouter from './routes/analytics';
import integrationsRouter from './routes/integrations';

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
app.use(cors());
app.use(json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use('/auth', authRouter);
app.use('/agents', agentsRouter);
app.use('/workflows', workflowsRouter);
app.use('/credentials', credentialsRouter);
app.use('/exec', createExecRouter(io));
app.use('/triggers', triggersRouter);
app.use('/marketplace', marketplaceRouter);
app.use('/export', exportRouter);
addSaaSRoutes(exportRouter);
app.use('/chat', chatRouter);
app.use('/ai', aiRouter);
app.use('/', createPublicRouter(io));
app.use('/analytics', analyticsRouter);
app.use('/integrations', integrationsRouter);

io.on('connection', (socket: any) => {
  socket.emit('welcome', { message: 'Flux AI realtime connected' });
});

const port = Number(process.env.PORT || 4000);
httpServer.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Flux AI backend listening on http://localhost:${port}`);
});


