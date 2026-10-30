import { describe, it, expect } from 'vitest';
import {
  DEFAULT_WEIGHTS,
  normalizeSkill,
  suggestSkills,
  validateExtraction,
  segmentDocument,
  scoreExtraction,
} from './scoring.js';

describe('Hybrid scoring safety and evidence', () => {
  it('removes PDF NUL bytes before creating source segments without altering valid text',()=>{
    expect(segmentDocument('Developed Node\u0000JS ứng dụng 😀.')[0].text).toBe('Developed NodeJS ứng dụng 😀.');
  });
  const score = (claims: any[], text: string, intervals: any[] = []) =>
    scoreExtraction(
      validateExtraction({
        claims,
        employmentIntervals: intervals,
        missingInformation: [],
      }),
      segmentDocument(text),
      ['Node.js', 'PostgreSQL'],
      DEFAULT_WEIGHTS,
      '2026-10-30',
    );
  it('rejects invalid AI output instead of inventing score 75', () => {
    for (const value of [null, [], {}, { matchScore: 90 }, { claims: 'bad' }])
      expect(() => validateExtraction(value)).toThrow('AI_SCHEMA_INVALID');
  });
  it('scores zero when no evidence exists and routes to human review', () => {
    const result = score([], 'No relevant claims in this document.');
    expect(result.matchScore).toBe(0);
    expect(result.recommendation).toBe('MANUAL_REVIEW');
    expect(result.experienceYears).toBeNull();
  });
  it('normalizes aliases without substring matches', () => {
    expect(normalizeSkill(' NodeJS ')).toBe('Node.js');
    expect(
      suggestSkills('Django DjangoLang and GitHub, not Go or Git'),
    ).toEqual(['Go', 'Git']);
    expect(suggestSkills('Django and GitHub')).toEqual([]);
  });
  it('does not accept a real quote as evidence for an unrelated skill', () => {
    const r = score(
      [
        {
          criterion: 'skills',
          skill: 'PostgreSQL',
          quote: 'Developed a NodeJS application.',
          segmentId: 's1',
        },
      ],
      'Developed a NodeJS application.',
    );
    expect(r.matchScore).toBe(0);
    expect(r.reviewReasons).toContain('UNSUPPORTED_OR_DUPLICATE_EVIDENCE');
  });
  it('rejects invented quotes and duplicate evidence', () => {
    const c = {
      criterion: 'skills',
      skill: 'NodeJS',
      quote: 'Developed a NodeJS application.',
      segmentId: 's1',
    };
    const r = score(
      [
        c,
        c,
        {
          criterion: 'production',
          quote: 'Deployed to production for 10000 users.',
          segmentId: 's1',
        },
      ],
      c.quote,
    );
    expect(r.matchScore).toBe(20);
    expect(r.claims.map((x) => x.supported)).toEqual([true, false, false]);
  });
  it('ignores AI-provided scores and applies a reproducible formula', () => {
    const text =
      'Developed a NodeJS application. Optimized PostgreSQL system latency by 50%.';
    const claims = [
      {
        criterion: 'skills',
        skill: 'NodeJS',
        quote: 'Developed a NodeJS application.',
        segmentId: 's1',
      },
      {
        criterion: 'skills',
        skill: 'PostgreSQL',
        quote: 'Optimized PostgreSQL system latency by 50%.',
        segmentId: 's1',
      },
      {
        criterion: 'projects',
        quote: 'Developed a NodeJS application.',
        segmentId: 's1',
      },
      {
        criterion: 'production',
        quote: 'Optimized PostgreSQL system latency by 50%.',
        segmentId: 's1',
      },
    ];
    const result = score(claims, text);
    expect(result.matchScore).toBe(82.5);
    expect(result.criteria.reduce((s, c) => s + c.points, 0)).toBe(
      result.matchScore,
    );
    expect(score(claims, text)).toEqual(result);
  });
  it('unions overlapping employment dates and requires dates inside evidence', () => {
    const quote = 'Worked 2024-01 to 2024-12 and 2024-06 to 2025-05.';
    const result = score([], quote, [
      { start: '2024-01', end: '2024-12', quote, segmentId: 's1' },
      { start: '2024-06', end: '2025-05', quote, segmentId: 's1' },
    ]);
    expect(result.experienceMonths).toBe(17);
    expect(result.experienceYears).toBe(1);
    const bad = score([], 'Developed software for a company.', [
      {
        start: '2020-01',
        end: '2025-01',
        quote: 'Developed software for a company.',
        segmentId: 's1',
      },
    ]);
    expect(bad.experienceYears).toBeNull();
    expect(bad.reviewReasons).toContain('EMPLOYMENT_DATES_UNVERIFIED');
  });
});
