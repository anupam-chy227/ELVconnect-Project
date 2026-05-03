import { getOpenAIClient } from '../utils/openaiClient';

export async function assistantAction(message: string) {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are an ELV Connect assistant. Choose the right action for the user request.',
      },
      { role: 'user', content: message },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'parse_requirement',
          description: 'Parse ELV requirement text into structured JSON',
          parameters: {
            type: 'object',
            properties: {
              text: { type: 'string' },
            },
            required: ['text'],
            additionalProperties: false,
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'generate_boq',
          description: 'Generate a draft BOQ for a project',
          parameters: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              site_type: { type: 'string' },
              item_count: { type: 'number' },
              notes: { type: 'string' },
            },
            required: ['category', 'site_type'],
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: 'auto',
  });

  return response;
}
