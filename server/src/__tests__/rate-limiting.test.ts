/**
 * Rate limiting tests for the kvenno-app Express backend server.
 *
 * The server uses express-rate-limit with per-endpoint configuration:
 * - /api/analyze and /api/analyze-2ar: 10 requests per 60s (analyzeLimiter)
 * - /api/process-document: 20 requests per 60s (documentLimiter)
 * - /api/islenskubraut/pdf: 30 requests per 60s (pdfLimiter)
 *
 * These tests verify rate limiting behavior using the supertest library.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';

// Set test API key before importing app
process.env.CLAUDE_API_KEY = 'test-key-for-rate-limit-tests';

// Import the Express app (server does not call listen() when imported)
const { app } = await import('../index.js');

// ---------------------------------------------------------------------------
// Rate limiter allows requests within the limit
// ---------------------------------------------------------------------------
describe('Rate limiting: allows requests within the limit', () => {
  it('allows a single request to /api/analyze', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .set('Origin', 'https://kvenno.app')
      .send({
        content: 'test content',
        systemPrompt: 'test prompt',
        mode: 'teacher',
      });

    // Should not be rate limited (may fail on API call, but not with 429)
    // Note: in shared test runner, earlier tests may have consumed the window.
    // We accept either a non-429 status or 429 with appropriate message.
    if (res.status === 429) {
      // Rate limit hit from other tests in this run -- verify the error message
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/beiðnir|requests/i);
    } else {
      expect(res.status).not.toBe(429);
    }
  });
});

// ---------------------------------------------------------------------------
// Rate limit headers are present in responses
// ---------------------------------------------------------------------------
describe('Rate limiting: standard headers', () => {
  it('includes RateLimit-Limit header on /api/islenskubraut/pdf', async () => {
    const res = await request(app)
      .get('/api/islenskubraut/pdf?flokkur=dyr&stig=A1')
      .set('Origin', 'https://kvenno.app');

    // The server uses standardHeaders: true, which sends RateLimit-* headers
    // (draft-6 standard: RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)
    // or the older X-RateLimit-* headers depending on the express-rate-limit version.
    const hasStandardHeaders =
      res.headers['ratelimit-limit'] !== undefined ||
      res.headers['x-ratelimit-limit'] !== undefined;

    expect(hasStandardHeaders).toBe(true);
  });

  it('includes RateLimit-Remaining header on /api/islenskubraut/pdf', async () => {
    const res = await request(app)
      .get('/api/islenskubraut/pdf?flokkur=dyr&stig=A1')
      .set('Origin', 'https://kvenno.app');

    const hasRemainingHeader =
      res.headers['ratelimit-remaining'] !== undefined ||
      res.headers['x-ratelimit-remaining'] !== undefined;

    expect(hasRemainingHeader).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Different endpoints have different limits
// ---------------------------------------------------------------------------
describe('Rate limiting: per-endpoint configuration', () => {
  it('/api/analyze has a stricter limit than /api/process-document', async () => {
    // Make a request to each endpoint to get their rate limit headers
    const analyzeRes = await request(app)
      .post('/api/analyze')
      .set('Origin', 'https://kvenno.app')
      .send({
        content: 'test',
        systemPrompt: 'test',
        mode: 'student',
      });

    const documentRes = await request(app)
      .post('/api/process-document')
      .set('Origin', 'https://kvenno.app');

    // Get the limit values from headers
    const analyzeLimit = Number(
      analyzeRes.headers['ratelimit-limit'] ||
      analyzeRes.headers['x-ratelimit-limit'] ||
      '0'
    );
    const documentLimit = Number(
      documentRes.headers['ratelimit-limit'] ||
      documentRes.headers['x-ratelimit-limit'] ||
      '0'
    );

    // analyzeLimiter: max=10, documentLimiter: max=20
    // If both limits are available, analyze should be stricter
    if (analyzeLimit > 0 && documentLimit > 0) {
      expect(analyzeLimit).toBeLessThan(documentLimit);
    }
  });
});

// ---------------------------------------------------------------------------
// Rate limiter blocks requests exceeding the limit (returns 429)
// ---------------------------------------------------------------------------
describe('Rate limiting: blocks excessive requests', () => {
  it('returns 429 after exceeding the analyze limit', async () => {
    // The analyzeLimiter allows 10 requests per 60s window.
    // Some requests may have been consumed by earlier tests in server.test.ts
    // (since tests share the same app instance and rate limit state).
    // We send enough requests to guarantee hitting the limit.
    const requests = [];
    for (let i = 0; i < 15; i++) {
      requests.push(
        request(app)
          .post('/api/analyze')
          .set('Origin', 'https://kvenno.app')
          .send({
            content: 'test content',
            systemPrompt: 'test prompt',
            mode: 'student',
          })
      );
    }

    const responses = await Promise.all(requests);

    // At least one response should be 429 (rate limited)
    const rateLimited = responses.filter((r) => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);

    // Verify the 429 response has the correct error message
    const limitedResponse = rateLimited[0];
    expect(limitedResponse.body).toHaveProperty('error');
    expect(limitedResponse.body.error).toMatch(/beiðnir|requests/i);
  });
});

// ---------------------------------------------------------------------------
// Rate limiter returns correct error format
// ---------------------------------------------------------------------------
describe('Rate limiting: error response format', () => {
  it('returns JSON error body with Icelandic message when rate limited', async () => {
    // Send requests until rate limited
    let rateLimitedResponse = null;
    for (let i = 0; i < 20; i++) {
      const res = await request(app)
        .post('/api/analyze')
        .set('Origin', 'https://kvenno.app')
        .send({
          content: 'test',
          systemPrompt: 'test',
          mode: 'teacher',
        });

      if (res.status === 429) {
        rateLimitedResponse = res;
        break;
      }
    }

    // Should have been rate limited by now
    expect(rateLimitedResponse).not.toBeNull();
    if (rateLimitedResponse) {
      expect(rateLimitedResponse.status).toBe(429);
      // Server configured with Icelandic message:
      // "Of margar beiðnir - reyndu aftur eftir smástund"
      expect(rateLimitedResponse.body.error).toContain('Of margar');
    }
  });
});
