import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { signAction, verifyAction } from './action-links.js';
describe('Signed candidate actions', () => {
  const original = process.env.JWT_SECRET;
  beforeEach(() => {
    process.env.JWT_SECRET = 'synthetic-test-key-not-a-production-credential';
  });
  afterEach(() => {
    if (original === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = original;
  });
  it('binds link to candidate and purpose and detects tampering', () => {
    const token = signAction('candidate', 'evaluation', 'rsvp');
    expect(verifyAction(token, 'candidate', 'rsvp').evaluationId).toBe(
      'evaluation',
    );
    expect(() => verifyAction(token, 'other', 'rsvp')).toThrow();
    expect(() => verifyAction(token, 'candidate', 'cx')).toThrow();
    expect(() => verifyAction(token + 'x', 'candidate', 'rsvp')).toThrow();
  });
});
