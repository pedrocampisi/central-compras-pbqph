/**
 * Cliente OpenRouter para extração de itens de pedidos via visão computacional.
 * Usa Claude Haiku 4.5 (anthropic/claude-haiku-4.5) via API OpenRouter.
 * Portado de CentralCompras-PBQPH.html linhas 2433-2481.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-haiku-4.5';
const MAX_TOKENS = 4000;

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content:
    | string
    | Array<
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string } }
      >;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: { content: string };
  }>;
}

/**
 * Chama a API OpenRouter com as mensagens fornecidas.
 * Lança erro em caso de resposta HTTP não-OK.
 */
export async function callOpenRouter(
  apiKey: string,
  messages: OpenRouterMessage[],
): Promise<string> {
  const resp = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof location !== 'undefined' ? location.origin : 'https://central-compras.local',
      'X-Title': 'Central de Compras PBQP-H',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0,
      max_tokens: MAX_TOKENS,
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`OpenRouter ${resp.status}: ${txt.slice(0, 200)}`);
  }

  const data = (await resp.json()) as OpenRouterResponse;
  return data?.choices?.[0]?.message?.content ?? '';
}
