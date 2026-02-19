/**
 * Unit tests for the kvenno-app Express backend server.
 *
 * Covers: health check, input validation, CORS, and security headers.
 */

import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import type { HealthResponse, ErrorResponse } from '../types/index.js';

// Capture original env so we can restore after tests
const ORIGINAL_CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// Set test API key before importing app, so the "API key not configured" check
// does not interfere with validation tests. The server reads this at request
// time inside route handlers, not at module load, but we set it early for clarity.
process.env.CLAUDE_API_KEY = 'test-key-for-validation-tests';

// Import the Express app (server does not call listen() when imported)
const { app } = await import('../index.js');

afterAll(() => {
  // Restore original env
  if (ORIGINAL_CLAUDE_API_KEY === undefined) {
    delete process.env.CLAUDE_API_KEY;
  } else {
    process.env.CLAUDE_API_KEY = ORIGINAL_CLAUDE_API_KEY;
  }
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    const body = res.body as HealthResponse;
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('timestamp');
    // Verify timestamp is a valid ISO string
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });
});

// ---------------------------------------------------------------------------
// Input validation -- POST /api/analyze
// ---------------------------------------------------------------------------
describe('POST /api/analyze -- input validation', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ content: 'hello' }); // missing systemPrompt and mode

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when mode is invalid', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        content: 'test content',
        systemPrompt: 'test prompt',
        mode: 'hacker', // invalid -- must be "teacher" or "student"
      });

    expect(res.status).toBe(400);
    const body = res.body as ErrorResponse;
    expect(body.error).toMatch(/[Ii]nvalid mode/);
  });

  it('returns 400 when systemPrompt exceeds 30000 characters', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        content: 'test',
        systemPrompt: 'x'.repeat(30001),
        mode: 'teacher',
      });

    expect(res.status).toBe(400);
    const body = res.body as ErrorResponse;
    expect(body.error).toMatch(/systemPrompt/i);
  });
});

// ---------------------------------------------------------------------------
// Input validation -- POST /api/analyze-2ar
// ---------------------------------------------------------------------------
describe('POST /api/analyze-2ar -- input validation', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/analyze-2ar')
      .send({ systemPrompt: 'hello' }); // missing userPrompt

    expect(res.status).toBe(400);
    const body = res.body as ErrorResponse;
    expect(body.error).toMatch(/[Mm]issing required fields/);
  });

  it('returns 400 when systemPrompt exceeds 30000 characters', async () => {
    const res = await request(app)
      .post('/api/analyze-2ar')
      .send({
        systemPrompt: 'x'.repeat(30001),
        userPrompt: 'valid prompt',
      });

    expect(res.status).toBe(400);
    const body = res.body as ErrorResponse;
    expect(body.error).toMatch(/systemPrompt/i);
  });

  it('returns 400 when userPrompt exceeds 100000 characters', async () => {
    const res = await request(app)
      .post('/api/analyze-2ar')
      .send({
        systemPrompt: 'valid prompt',
        userPrompt: 'x'.repeat(100001),
      });

    expect(res.status).toBe(400);
    const body = res.body as ErrorResponse;
    expect(body.error).toMatch(/userPrompt/i);
  });
});

// ---------------------------------------------------------------------------
// Input validation -- GET /api/islenskubraut/pdf
// ---------------------------------------------------------------------------
describe('GET /api/islenskubraut/pdf -- input validation', () => {
  it('returns 400 when query params are missing', async () => {
    const res = await request(app).get('/api/islenskubraut/pdf');

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when only flokkur is provided', async () => {
    const res = await request(app).get('/api/islenskubraut/pdf?flokkur=dyr');

    expect(res.status).toBe(400);
  });

  it('returns 400 when stig is invalid', async () => {
    const res = await request(app).get('/api/islenskubraut/pdf?flokkur=dyr&stig=C1');

    expect(res.status).toBe(400);
    const body = res.body as ErrorResponse;
    expect(body.error).toMatch(/stig/i);
  });

  it('returns 404 when category does not exist', async () => {
    const res = await request(app).get(
      '/api/islenskubraut/pdf?flokkur=nonexistent&stig=A1'
    );

    expect(res.status).toBe(404);
    const body = res.body as ErrorResponse;
    expect(body.error).toMatch(/[Ff]lokkur/);
  });
});

// ---------------------------------------------------------------------------
// Input validation -- POST /api/process-document
// ---------------------------------------------------------------------------
describe('POST /api/process-document -- input validation', () => {
  it('returns 400 or 500 when no file is uploaded', async () => {
    const res = await request(app)
      .post('/api/process-document')
      .send();

    // The server returns 400 for "No file uploaded" after parsing,
    // or 500 if LibreOffice is not installed. Either is acceptable in
    // this test environment since we cannot guarantee LibreOffice is present.
    expect([400, 500]).toContain(res.status);
  });
});

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
describe('CORS', () => {
  it('allows requests from https://kvenno.app', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'https://kvenno.app');

    expect(res.headers['access-control-allow-origin']).toBe('https://kvenno.app');
  });

  it('blocks requests from http://evil.com', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://evil.com');

    // When CORS blocks, the cors middleware passes an error to Express,
    // which triggers the error handler (500) and no CORS header is set.
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    expect(res.status).toBe(500);
  });

  it('allows localhost origins in development mode', async () => {
    // The server defaults to non-production (NODE_ENV is not 'production'
    // in the test environment), so localhost:5173 should be allowed.
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});

// ---------------------------------------------------------------------------
// Security headers (helmet)
// ---------------------------------------------------------------------------
describe('Security headers', () => {
  it('includes X-Content-Type-Options: nosniff', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('includes X-Frame-Options header', async () => {
    const res = await request(app).get('/health');

    // Helmet sets X-Frame-Options to SAMEORIGIN by default
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  it('includes Content-Security-Policy header', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('includes X-DNS-Prefetch-Control header', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
  });

  it('includes Strict-Transport-Security header', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['strict-transport-security']).toBeDefined();
  });
});
