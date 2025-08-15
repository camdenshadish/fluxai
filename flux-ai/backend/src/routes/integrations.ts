import { Router } from 'express';
import { requireAuth } from '../util/requireAuth.js';
import { z } from 'zod';

const router = Router();

const providers = [
  { id: 'openai', name: 'OpenAI', fields: [{ key: 'apiKey', label: 'API Key' }] },
  { id: 'claude', name: 'Anthropic Claude', fields: [{ key: 'apiKey', label: 'API Key' }] },
  { id: 'google', name: 'Google', fields: [{ key: 'oauth', label: 'OAuth Token' }] },
  { id: 'slack', name: 'Slack', fields: [{ key: 'botToken', label: 'Bot Token' }] },
  { id: 'discord', name: 'Discord', fields: [{ key: 'botToken', label: 'Bot Token' }] },
  { id: 'stripe', name: 'Stripe', fields: [{ key: 'secretKey', label: 'Secret Key' }] },
  { id: 'zapier', name: 'Zapier', fields: [{ key: 'auth', label: 'Auth Token' }] },
  { id: 'make', name: 'Make.com', fields: [{ key: 'auth', label: 'Auth Token' }] }
];

router.get('/providers', (_req, res) => {
  res.json({ providers });
});

router.post('/test', requireAuth, async (req, res) => {
  const schema = z.object({ provider: z.string(), credentials: z.record(z.string(), z.any()) });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  // Placeholder: accept all creds
  res.json({ ok: true });
});

export default router;


