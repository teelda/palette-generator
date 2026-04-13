import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import Anthropic from '@anthropic-ai/sdk';

// ─── Config ──────────────────────────────────────────────────────────────────
const PORT = 3001;

// Only accept requests from the local Vite dev server
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]);

// Input limits
const LIMITS = {
  description: 500,
  brandName: 100,
  productName: 80,
  maxProducts: 5,
};

// ─── Claude client (server-side only) ────────────────────────────────────────
function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set');
  return new Anthropic({ apiKey: key });
}

// ─── Input sanitization ───────────────────────────────────────────────────────
// Strip characters that could break prompt structure or inject instructions
function sanitize(input: unknown, maxLen: number): string {
  if (typeof input !== 'string') throw new Error('Expected string');
  return input
    .slice(0, maxLen)
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '') // control chars
    .replace(/```/g, '')                                   // no code fence escapes
    .trim();
}

function validateString(val: unknown, field: string, maxLen: number): string {
  const s = sanitize(val, maxLen);
  if (s.length < 2) throw new Error(`${field} is too short`);
  return s;
}

// ─── Prompts (server-side only) ──────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert color designer and brand identity specialist. You generate thoughtful, harmonious color palettes.

Always respond with valid JSON only — no markdown fences, no explanation, just raw JSON.

Rules:
- Color names must be evocative and memorable (e.g. "Dusk Ember", "Salt Fog", "Velvet Moss") — never generic (e.g. "Light Blue")
- All hex values must be valid 6-character codes starting with #
- Consider contrast ratios and real-world usability
- Palettes should feel cohesive, not random`;

function cleanJSON(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

// ─── App ─────────────────────────────────────────────────────────────────────
const app = express();

// Body limit — prevent large-payload attacks
app.use(express.json({ limit: '16kb' }));

// Security headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// CORS — localhost only
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin ?? '';
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Rate limiting — 20 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — slow down' },
});
app.use('/api', limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/mood
app.post('/api/mood', async (req: Request, res: Response) => {
  let description: string;
  try {
    description = validateString(req.body?.description, 'description', LIMITS.description);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
    return;
  }

  try {
    const client = getClient();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `Generate a color palette for this mood/scene: "${description}"

Return JSON with this exact shape:
{
  "name": "palette name (evocative, 2-4 words)",
  "description": "one sentence on its character",
  "mood": "2-3 mood words separated by commas",
  "colors": [
    { "hex": "#RRGGBB", "name": "evocative color name", "role": "primary|secondary|accent|background|neutral", "usage": "brief usage note" }
  ],
  "gradients": [
    { "name": "gradient name", "from": "#RRGGBB", "to": "#RRGGBB", "direction": "135deg", "usage": "brief usage note" }
  ]
}

Generate 5–7 colors and 2–3 gradients. Make them cohesive and beautiful.`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const palette = JSON.parse(cleanJSON(text));
    res.json(palette);
  } catch (e) {
    console.error('[/api/mood]', e);
    res.status(500).json({ error: 'Palette generation failed' });
  }
});

// POST /api/brand
app.post('/api/brand', async (req: Request, res: Response) => {
  let brandName: string;
  let description: string;
  let products: string[];

  try {
    brandName = validateString(req.body?.brandName, 'brandName', LIMITS.brandName);
    description = validateString(req.body?.description, 'description', LIMITS.description);

    const rawProducts = req.body?.products;
    if (!Array.isArray(rawProducts)) throw new Error('products must be an array');
    if (rawProducts.length > LIMITS.maxProducts) throw new Error(`Max ${LIMITS.maxProducts} products`);
    products = rawProducts
      .map((p: unknown) => sanitize(p, LIMITS.productName))
      .filter(p => p.length > 0);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
    return;
  }

  const productsNote = products.length > 0
    ? `Products: ${products.join(', ')}`
    : 'Single product brand';

  try {
    const client = getClient();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3500,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `Generate a complete brand color system.
Brand name: ${brandName}
Brand personality: ${description}
${productsNote}

Return JSON with this exact shape:
{
  "brandName": "brand name",
  "personality": "brand personality summary",
  "primary": [{ "hex": "#RRGGBB", "name": "name", "role": "primary", "usage": "usage" }],
  "secondary": [{ "hex": "#RRGGBB", "name": "name", "role": "secondary", "usage": "usage" }],
  "neutrals": [{ "hex": "#RRGGBB", "name": "name", "role": "neutral", "usage": "usage" }],
  "products": [
    {
      "name": "product name",
      "accent": { "hex": "#RRGGBB", "name": "name", "role": "accent", "usage": "usage" },
      "supportingColors": [{ "hex": "#RRGGBB", "name": "name", "role": "support", "usage": "usage" }]
    }
  ],
  "gradients": [{ "name": "name", "from": "#RRGGBB", "to": "#RRGGBB", "direction": "135deg", "usage": "usage" }]
}

Include: 2–3 primary, 2–3 secondary, 5 neutrals (near-white to near-black), one product entry per product listed, 2–3 gradients.`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const brand = JSON.parse(cleanJSON(text));
    res.json(brand);
  } catch (e) {
    console.error('[/api/brand]', e);
    res.status(500).json({ error: 'Brand palette generation failed' });
  }
});

// Reject all other routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Start (loopback only — not exposed to network) ───────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[palette-api] running on http://127.0.0.1:${PORT}`);
});
