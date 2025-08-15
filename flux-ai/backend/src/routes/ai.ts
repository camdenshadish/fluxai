import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../util/requireAuth.js';
import { generateAgentBackend, suggestWorkflow, listNodeTemplates } from '../services/ai/orchestrator.js';
import { z } from 'zod';

const router = Router();
router.use(requireAuth);

const genSchema = z.object({ prompt: z.string().min(1) });

router.post('/generate', async (req, res) => {
  const parse = genSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const result = await generateAgentBackend(parse.data.prompt);
  res.json(result);
});

router.post('/suggest-workflow', async (req, res) => {
  const parse = genSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const result = await suggestWorkflow(parse.data.prompt);
  res.json(result);
});

router.get('/templates', async (_req, res) => {
  res.json({ templates: await listNodeTemplates() });
});

const genNodeSchema = z.object({ provider: z.string(), name: z.string(), description: z.string().optional() });
router.post('/generate-node', async (req, res) => {
  const parse = genNodeSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  // Placeholder: return a simple custom node template
  res.json({ template: { id: `${parse.data.provider}-custom`, name: parse.data.name, type: 'custom', schema: { apiKey: 'string' } } });
});

export default router;
