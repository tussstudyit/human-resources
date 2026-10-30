import { createHmac, timingSafeEqual } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';

export function signAction(
  candidateId: string,
  evaluationId: string,
  purpose: 'rsvp' | 'cx',
) {
  const secret = process.env.JWT_SECRET;
  if (!secret)
    throw new Error('JWT_SECRET is required for candidate action links');
  const payload = Buffer.from(
    JSON.stringify({
      candidateId,
      evaluationId,
      purpose,
      exp: Date.now() + 14 * 86400000,
    }),
  ).toString('base64url');
  return (
    payload +
    '.' +
    createHmac('sha256', secret).update(payload).digest('base64url')
  );
}
export function verifyAction(
  token: string,
  candidateId: string,
  purpose: 'rsvp' | 'cx',
) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || typeof token !== 'string' || token.length > 2000)
      throw Error();
    const [payload, signature, ...extra] = token.split('.');
    if (extra.length || !payload || !signature) throw Error();
    const expected = createHmac('sha256', secret).update(payload).digest();
    const supplied = Buffer.from(signature, 'base64url');
    if (
      expected.length !== supplied.length ||
      !timingSafeEqual(expected, supplied)
    )
      throw Error();
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (
      data.candidateId !== candidateId ||
      data.purpose !== purpose ||
      !data.evaluationId ||
      typeof data.exp !== 'number' ||
      data.exp < Date.now()
    )
      throw Error();
    return data as {
      candidateId: string;
      evaluationId: string;
      purpose: string;
      exp: number;
    };
  } catch {
    throw new UnauthorizedException('Action link is invalid or expired');
  }
}
