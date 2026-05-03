import { getOpenAIClient } from '../utils/openaiClient';

export type ParsedRequirement = {
  category: string;
  site_type: string;
  urgency: "low" | "medium" | "high";
  budget_range: string;
  item_count?: number | null;
  location?: string | null;
  summary: string;
};

export async function parseRequirement(text: string): Promise<ParsedRequirement> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You convert ELV project requirement text into strict JSON only. No markdown, no explanation.",
      },
      {
        role: "user",
        content: `Parse this ELV requirement:\n\n${text}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "parsed_requirement",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            category: { type: "string" },
            site_type: { type: "string" },
            urgency: { type: "string", enum: ["low", "medium", "high"] },
            budget_range: { type: "string" },
            item_count: { type: ["integer", "null"] },
            location: { type: ["string", "null"] },
            summary: { type: "string" },
          },
          required: [
            "category",
            "site_type",
            "urgency",
            "budget_range",
            "item_count",
            "location",
            "summary",
          ],
        },
        strict: true,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");

  return JSON.parse(content) as ParsedRequirement;
}
