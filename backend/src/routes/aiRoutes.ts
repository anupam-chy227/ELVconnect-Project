import { Router } from 'express';
import { parseRequirement } from '../services/aiService';

const router = Router();

router.post('/parse-requirement', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }

    const result = await parseRequirement(text);
    return res.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse requirement';
    return res.status(500).json({ success: false, error: message });
  }
});

export default router;
