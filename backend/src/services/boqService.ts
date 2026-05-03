import { getOpenAIClient } from '../utils/openaiClient';

export type BOQInput = {
  category: string;
  site_type: string;
  item_count?: number;
  area?: string;
  notes?: string;
};

export type BOQDraftItem = {
  item_name: string;
  quantity: number;
  unit: string;
  notes: string;
};

export type BOQDraft = {
  items: BOQDraftItem[];
  estimated_total: number;
  currency: string;
};

export async function generateBOQ(input: BOQInput): Promise<BOQDraft> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Generate a draft BOQ for ELV projects in strict JSON only. Do not add explanations.',
      },
      {
        role: 'user',
        content: JSON.stringify(input),
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'boq_draft',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  item_name: { type: 'string' },
                  quantity: { type: 'number' },
                  unit: { type: 'string' },
                  notes: { type: 'string' },
                },
                required: ['item_name', 'quantity', 'unit', 'notes'],
              },
            },
            estimated_total: { type: 'number' },
            currency: { type: 'string' },
          },
          required: ['items', 'estimated_total', 'currency'],
        },
        strict: true,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty BOQ response');

  return JSON.parse(content) as BOQDraft;
}
