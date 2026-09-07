import { extractAndParseJson } from './jsonParser';

/**
 * Self-verifying tests for JSON extraction and parsing edge cases.
 * Returns true if all test cases pass.
 */
export function runJsonParserTests(): { passed: boolean; results: { name: string; success: boolean; error?: string }[] } {
  const results: { name: string; success: boolean; error?: string }[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, success: true });
    } catch (err: any) {
      results.push({ name, success: false, error: err?.message || String(err) });
    }
  }

  // Test 1: Direct JSON parsing
  test('parses clean JSON string', () => {
    const input = '{"score": 95, "name": "test"}';
    const parsed = extractAndParseJson<{ score: number; name: string }>(input, { score: 0, name: '' });
    if (parsed.score !== 95 || parsed.name !== 'test') {
      throw new Error(`Expected score 95, got ${parsed.score}`);
    }
  });

  // Test 2: Code fence with ```json
  test('extracts JSON from markdown code fence', () => {
    const input = 'Here is the report:\n```json\n{"score": 88, "summary": "Great session"}\n```\nHope that helps!';
    const parsed = extractAndParseJson<{ score: number; summary: string }>(input, { score: 0, summary: '' });
    if (parsed.score !== 88 || parsed.summary !== 'Great session') {
      throw new Error(`Failed to extract from code fence`);
    }
  });

  // Test 3: Raw brackets without fences
  test('extracts bracketed JSON embedded in conversational text', () => {
    const input = 'Sure, here is your object: { "accuracy": 92 } That was your evaluation.';
    const parsed = extractAndParseJson<{ accuracy: number }>(input, { accuracy: 0 });
    if (parsed.accuracy !== 92) {
      throw new Error(`Expected accuracy 92, got ${parsed.accuracy}`);
    }
  });

  // Test 4: Malformed JSON returns fallback
  test('returns fallback on invalid JSON text', () => {
    const input = 'Not valid json at all { unclosed bracket';
    const fallback = { fallback: true };
    const parsed = extractAndParseJson(input, fallback);
    if (!parsed.fallback) {
      throw new Error(`Expected fallback to be returned`);
    }
  });

  // Test 5: Empty/null text returns fallback
  test('handles null/empty text safely', () => {
    const fallback = { safe: true };
    const parsed = extractAndParseJson('', fallback);
    if (!parsed.safe) {
      throw new Error(`Expected fallback on empty string`);
    }
  });

  const passed = results.every(r => r.success);
  return { passed, results };
}
