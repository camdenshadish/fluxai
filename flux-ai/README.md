Flux AI

Monorepo for an AI agent creation and SaaS platform.

Structure:
- backend: Express + Prisma + JWT + Socket.IO
- frontend: Next.js + Tailwind + React Flow
- nodes, integrations, utils: shared packages

Quickstart:
1) docker compose up -d postgres
2) cp backend/.env.example backend/.env && cp frontend/.env.example frontend/.env.local
3) npm install
4) npm run dev


