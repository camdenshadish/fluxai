import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@flux.local';
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, name: 'Demo User' },
    update: {}
  });

  const agent = await prisma.agent.create({ data: { ownerId: user.id, name: 'Sample Agent', description: 'Demo agent' } });
  const graph = {
    nodes: [
      { id: 'trigger-1', type: 'trigger', data: { event: 'http' } },
      { id: 'brain-1', type: 'brain', data: { prompt: 'Process input' } },
      { id: 'api-1', type: 'api', data: { url: 'https://api.example.com/data' } },
      { id: 'output-1', type: 'output', data: {} }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'brain-1' },
      { id: 'e2', source: 'brain-1', target: 'api-1' },
      { id: 'e3', source: 'api-1', target: 'output-1' }
    ]
  };
  await prisma.workflow.create({ data: { agentId: agent.id, name: 'Main Workflow', graph } });
  // eslint-disable-next-line no-console
  console.log('Seeded: demo@flux.local / password123');
}

main().finally(() => prisma.$disconnect());


