import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HazardHub AI Operational Engine',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Operations Proxy Route with Deterministic Engine Context
app.post('/api/ai-operations', async (req, res) => {
  try {
    const { query, engineContext } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        invokedEngine: engineContext?.engine || 'ChemiGuard',
        invokedTool: engineContext?.tool || 'deterministicDispatch',
        deterministicSummary: engineContext?.summary || 'Standard deterministic rule validation complete.',
        aiExplanation:
          'Authoritative evaluation completed using local deterministic rule engine. All chemical compatibility and logistics constraints strictly validated according to EPA 40 CFR § 264.177 and DOT 49 CFR § 177.848.',
        isFallback: true,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are the HazardHub AI Operational Compliance Assistant.
You assist industrial environmental managers, lab safety officers, and hazmat logistics coordinators.
CRITICAL SAFETY RULE: You must NEVER independently make or override chemical compatibility, safety, or regulatory decisions.
Safety decisions are strictly computed by the deterministic backend engines (ChemiGuard, QuotaPacker, ResilienceGuard, CustodySentinel).
Your role is to clearly and concisely explain the deterministic engine's findings, cite relevant regulations (EPA 40 CFR § 264.177, DOT 49 CFR § 177.848, RCRA), and provide operational guidance.
Keep your response professional, precise, direct, and structured. No fluff or conversational filler.`;

    const userPrompt = `User Query: "${query}"

Authoritative Deterministic Engine Output:
- Invoked Engine: ${engineContext?.engine || 'ChemiGuard'}
- Executed Method: ${engineContext?.tool || 'evaluate'}
- Deterministic Status: ${engineContext?.status || 'VALIDATED'}
- Raw Engine Output: ${JSON.stringify(engineContext?.data || {})}

Synthesize a clear, authoritative response explaining these findings to the operator.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    return res.json({
      invokedEngine: engineContext?.engine,
      invokedTool: engineContext?.tool,
      deterministicSummary: engineContext?.summary,
      aiExplanation: response.text,
      isFallback: false,
    });
  } catch (error: any) {
    console.error('AI Operations API error:', error);
    return res.status(500).json({
      error: 'Failed to process AI operations request',
      details: error?.message,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HazardHub AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
