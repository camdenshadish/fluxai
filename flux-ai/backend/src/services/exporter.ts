import { PrismaClient } from '@prisma/client';
import archiver from 'archiver';
import type { Response } from 'express';

const prisma = new PrismaClient();

export async function exportAgentAsSaaS(agentId: string, res: Response) {
  const agent = await prisma.agent.findUnique({ where: { id: agentId }, include: { workflows: true } });
  if (!agent) throw new Error('Agent not found');
  res.setHeader('Content-Disposition', `attachment; filename="${agent.name.replace(/[^a-z0-9_-]/gi, '_')}-saas.zip"`);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => res.status(500).end(err.message));
  archive.pipe(res);

  const pkg = {
    name: `${agent.name}-saas`.toLowerCase().replace(/\s+/g, '-'),
    private: true,
    scripts: { start: 'node server/index.js' },
    dependencies: { express: '^4.19.2' }
  };

  archive.append(JSON.stringify(pkg, null, 2), { name: 'package.json' });
  archive.append(`const express = require('express');\nconst app = express();\napp.use(express.json());\nconst workflow = ${JSON.stringify(agent.workflows[0]?.graph || { nodes: [], edges: [] })};\napp.get('/health', (_req,res)=>res.json({ok:true}));\napp.post('/run', (req,res)=>{ res.json({ ok: true, workflow }); });\napp.listen(process.env.PORT||8080, ()=>console.log('SaaS app ready'));\n`, { name: 'server/index.js' });
  archive.append(`# ${agent.name}\n\n${agent.description || ''}\n`, { name: 'README.md' });
  await archive.finalize();
}


