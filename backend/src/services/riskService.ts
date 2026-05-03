import { getOpenAIClient } from '../utils/openaiClient';

export type DelayRiskInput = {
  project_size: string;
  vendor_score: number;
  site_type: string;
  urgency: string;
  history_notes?: string;
};

export type DelayRiskPrediction = {
  risk_level: 'low' | 'medium' | 'high';
  probability: number;
  reasons: string[];
};

export async function predictDelayRisk(input: DelayRiskInput): Promise<DelayRiskPrediction> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Predict project delay risk for ELV execution. Return strict JSON only.',
      },
      {
        role: 'user',
        content: JSON.stringify(input),
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'delay_risk',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            risk_level: { type: 'string', enum: ['low', 'medium', 'high'] },
            probability: { type: 'number' },
            reasons: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['risk_level', 'probability', 'reasons'],
        },
        strict: true,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty risk response');

  return JSON.parse(content) as DelayRiskPrediction;
}
