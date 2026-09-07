/**
 * Safe JSON extraction and parsing utility for LLM responses.
 * Strips markdown code fences (```json ... ```) or extracts JSON objects
 * even if preceded or followed by explanatory text.
 */
export function extractAndParseJson<T>(text: string, fallback: T): T {
  if (!text || typeof text !== 'string') {
    return fallback;
  }

  const trimmed = text.trim();

  // Try direct parse first
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // Continue to pattern extraction
  }

  // Strip markdown code fences ```json ... ``` or ``` ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim()) as T;
    } catch {
      // Continue to bracket extraction
    }
  }

  // Extract first balanced or bracketed JSON object { ... } or array [ ... ]
  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]) as T;
    } catch {
      // Continue to array match
    }
  }

  const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]) as T;
    } catch {
      // Failed
    }
  }

  return fallback;
}
