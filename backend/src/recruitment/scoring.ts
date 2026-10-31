// Shared deterministic engine. The workflow generator embeds these exact functions
// in n8n; the API recomputes the result rather than trusting an AI-provided score.
export const SCORING_VERSION = 'hybrid-v1';
export const DEFAULT_WEIGHTS = {
  skills: 40,
  projects: 30,
  production: 20,
  discipline: 10,
};
export const SKILL_ALIASES: Record<string, string> = {
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  'node js': 'Node.js',
  nestjs: 'NestJS',
  'nest.js': 'NestJS',
  reactjs: 'React',
  'react.js': 'React',
  react: 'React',
  nextjs: 'Next.js',
  'next.js': 'Next.js',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  python: 'Python',
  java: 'Java',
  'spring boot': 'Spring Boot',
  docker: 'Docker',
  k8s: 'Kubernetes',
  kubernetes: 'Kubernetes',
  aws: 'AWS',
  redis: 'Redis',
  golang: 'Go',
  go: 'Go',
  mysql: 'MySQL',
  mongodb: 'MongoDB',
  vuejs: 'Vue',
  'vue.js': 'Vue',
  vue: 'Vue',
  angular: 'Angular',
  git: 'Git',
  'ci/cd': 'CI/CD',
  graphql: 'GraphQL',
  'c++': 'C++',
  'c#': 'C#',
};
export function normalizeSkill(value: string): string {
  const text = value.trim().replace(/\s+/g, ' ');
  return SKILL_ALIASES[text.toLowerCase()] || text;
}
export function suggestSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return [
    ...new Set(
      Object.entries(SKILL_ALIASES)
        .filter(([alias]) => {
          const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return new RegExp(
            '(^|[^a-z0-9])' + escaped + '(?=$|[^a-z0-9])',
            'i',
          ).test(lower);
        })
        .map(([, canonical]) => canonical),
    ),
  ];
}
export type Weights = typeof DEFAULT_WEIGHTS;
export interface EvidenceClaim {
  criterion: 'skills' | 'projects' | 'production' | 'discipline';
  skill?: string;
  quote: string;
  segmentId: string;
}
export interface Extraction {
  claims: EvidenceClaim[];
  employmentIntervals: Array<{
    start: string;
    end: string;
    quote: string;
    segmentId: string;
  }>;
  missingInformation: string[];
}
export function validateExtraction(value: unknown): Extraction {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('AI_SCHEMA_INVALID');
  const d = value as any;
  if (
    !Array.isArray(d.claims) ||
    d.claims.length > 200 ||
    !Array.isArray(d.employmentIntervals) ||
    d.employmentIntervals.length > 50 ||
    !Array.isArray(d.missingInformation) ||
    !d.missingInformation.every(
      (x: unknown) => typeof x === 'string' && x.length <= 1000,
    )
  )
    throw new Error('AI_SCHEMA_INVALID');
  for (const c of d.claims) {
    if (
      !c ||
      !['skills', 'projects', 'production', 'discipline'].includes(
        c.criterion,
      ) ||
      typeof c.quote !== 'string' ||
      c.quote.trim().length < 8 ||
      c.quote.length > 1500 ||
      typeof c.segmentId !== 'string' ||
      (c.criterion === 'skills' &&
        (typeof c.skill !== 'string' || !c.skill.trim())) ||
      (c.skill !== undefined &&
        (typeof c.skill !== 'string' || c.skill.length > 100))
    )
      throw new Error('AI_SCHEMA_INVALID');
  }
  for (const e of d.employmentIntervals) {
    if (
      !e ||
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(e.start) ||
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(e.end) ||
      typeof e.quote !== 'string' ||
      e.quote.length < 8 ||
      e.quote.length > 1500 ||
      typeof e.segmentId !== 'string'
    )
      throw new Error('AI_SCHEMA_INVALID');
  }
  return {
    claims: d.claims,
    employmentIntervals: d.employmentIntervals,
    missingInformation: d.missingInformation,
  };
}
export function cleanDocumentText(value: string): string {
  return value.replace(/\u0000/g, '').replace(
    /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g,
    '\uFFFD',
  );
}
export function segmentDocument(
  text: string,
): Array<{ id: string; text: string }> {
  // Preserve source text. Whitespace is normalized only for comparison, not to invent evidence.
  const clean = cleanDocumentText(text).replace(/\r\n/g, '\n').trim();
  const segments: Array<{ id: string; text: string }> = [];
  for (let offset = 0; offset < clean.length; offset += 1800) {
    segments.push({
      id: `s${segments.length + 1}`,
      text: clean.slice(offset, offset + 2000),
    });
  }
  return segments;
}
export function scoreExtraction(
  extraction: Extraction,
  segments: Array<{ id: string; text: string }>,
  requiredSkills: string[],
  weights: Weights,
  referenceDate: string,
) {
  const normalized = (s: string) =>
    s.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
  const segmentMap = new Map(segments.map((s) => [s.id, normalized(s.text)]));
  const supported = (c: { quote: string; segmentId: string }) =>
    !!segmentMap.get(c.segmentId)?.includes(normalized(c.quote));
  const required = [...new Set(requiredSkills.map(normalizeSkill))];
  const unique = new Set<string>();
  const claims = extraction.claims.map((c) => {
    const key = `${c.criterion}:${normalized(c.quote)}:${c.skill ? normalizeSkill(c.skill) : ''}`;
    const duplicate = unique.has(key);
    unique.add(key);
    const quotedSkill =
      c.criterion !== 'skills' ||
      suggestSkills(c.quote).some((s) => s === normalizeSkill(c.skill || '')) ||
      (c.skill &&
        new RegExp(
          '(^|[^a-z0-9])' +
            normalizeSkill(c.skill)
              .toLowerCase()
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
            '(?=$|[^a-z0-9])',
          'i',
        ).test(c.quote));
    return {
      ...c,
      skill: c.skill ? normalizeSkill(c.skill) : undefined,
      supported: supported(c) && !!quotedSkill && !duplicate,
      verification: 'document_supported_only',
    };
  });
  const verified = claims.filter((c) => c.supported);
  const matched = required.filter((s) =>
    verified.some((c) => c.criterion === 'skills' && c.skill === s),
  );
  const action =
    /develop|design|implement|optimi[sz]|built|build|deploy|debug|xây dựng|thiết kế|phát triển|triển khai|tối ưu|xử lý|kiểm thử/i;
  const projectContext =
    /project|application|service|platform|system|dự án|ứng dụng|dịch vụ|hệ thống|sản phẩm/i;
  const production =
    /production|deploy|monitor|latency|throughput|qps|users|kubernetes|vận hành|triển khai|chịu tải|người dùng/i;
  const discipline =
    /unit test|integration test|e2e|ci\/cd|code review|logging|security|kiểm thử|bảo mật|review code/i;
  const quantified =
    /\d+(?:[.,]\d+)?\s*(?:%|ms\b|rps\b|qps\b|users\b|người dùng|giây|requests\b)/i;
  const levelFor = (criterion: string, context: RegExp) => {
    const evidence = verified.filter(
      (c) => c.criterion === criterion && context.test(c.quote),
    );
    return evidence.reduce(
      (best, c) =>
        Math.max(
          best,
          action.test(c.quote) ? (quantified.test(c.quote) ? 4 : 3) : 1,
        ),
      0,
    );
  };
  const levels: Record<string, number> = {
    skills: required.length ? (4 * matched.length) / required.length : 0,
    projects: levelFor('projects', projectContext),
    production: levelFor('production', production),
    discipline: levelFor('discipline', discipline),
  };
  const criteria = Object.entries(weights).map(([id, weight]) => ({
    id,
    weight,
    level: levels[id],
    points: Math.round(((weight * levels[id]) / 4) * 100) / 100,
    evidence: verified.filter((c) => c.criterion === id),
    rule:
      id === 'skills'
        ? 'verified_required_skill_ratio'
        : 'context+action=3; context+action+measured_outcome=4; context_only=1; absent=0',
  }));
  const matchScore =
    Math.round(criteria.reduce((sum, c) => sum + c.points, 0) * 100) / 100;
  const months = new Set<number>();
  let invalidDates = false;
  const reference = new Date(referenceDate);
  const maxMonth = reference.getUTCFullYear() * 12 + reference.getUTCMonth();
  for (const e of extraction.employmentIntervals) {
    const toMonth = (s: string) =>
      Number(s.slice(0, 4)) * 12 + Number(s.slice(5, 7)) - 1;
    const start = toMonth(e.start),
      end = toMonth(e.end);
    // Employment evidence must include the claimed dates; a generic quote is insufficient.
    if (
      !supported(e) ||
      !e.quote.includes(e.start) ||
      !e.quote.includes(e.end) ||
      end < start ||
      end > maxMonth ||
      end - start > 600
    ) {
      invalidDates = true;
      continue;
    }
    for (let m = start; m <= end; m++) months.add(m);
  }
  const reviewReasons: string[] = [];
  if (
    segments.some((s) =>
      /ignore (all |previous )?instructions|give me (100|full)|bỏ qua.*hướng dẫn/i.test(
        s.text,
      ),
    )
  )
    reviewReasons.push('POSSIBLE_PROMPT_INJECTION');
  if (!required.length) reviewReasons.push('NO_APPROVED_REQUIRED_SKILLS');
  if (claims.some((c) => !c.supported))
    reviewReasons.push('UNSUPPORTED_OR_DUPLICATE_EVIDENCE');
  if (!verified.length) reviewReasons.push('NO_VERIFIED_EVIDENCE');
  if (invalidDates) reviewReasons.push('EMPLOYMENT_DATES_UNVERIFIED');
  if (extraction.missingInformation.length)
    reviewReasons.push('AI_REPORTED_MISSING_INFORMATION');
  if ([50, 80].some((t) => Math.abs(matchScore - t) <= 3))
    reviewReasons.push('NEAR_DECISION_THRESHOLD');
  const recommendation = reviewReasons.length
    ? 'MANUAL_REVIEW'
    : matchScore >= 80
      ? 'FAST_TRACK_INTERVIEW'
      : matchScore >= 50
        ? 'MANUAL_REVIEW'
        : 'LOW_MATCH_PENDING_HR';
  return {
    scoringVersion: SCORING_VERSION,
    matchScore,
    criteria,
    skills: matched,
    claims,
    experienceYears: months.size ? Math.floor(months.size / 12) : null,
    experienceMonths: months.size || null,
    evidenceCoverage: claims.length ? verified.length / claims.length : 0,
    reviewReasons,
    recommendation,
    summary: `Điểm đối chiếu hồ sơ: ${matchScore}/100. Kỹ năng yêu cầu có bằng chứng: ${matched.length}/${required.length}. Bằng chứng chỉ xác nhận nội dung tự khai trong CV.${reviewReasons.length ? ' Cần HR xem xét.' : ''}`,
  };
}
