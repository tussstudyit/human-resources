import { normalizeSkill, suggestSkills } from './scoring.js';

// Only use terms present in the JD. Short, explicitly listed requirements also
// support technologies outside the alias dictionary; prose is never a skill.
export function automaticRequiredSkills(job: {
  title: string; description: string; requirements: string;
}): string[] {
  const listed = job.requirements.split(/[\n,;•]+/).map(s=>s.replace(/^\s*[-*]\s*/, '').trim());
  const skills = listed.flatMap(term => {
    const known = suggestSkills(term);
    if (known.length) return known;
    return term.length <= 60 && /^[A-Za-z][A-Za-z0-9 .+#/()-]*$/.test(term)
      && term.split(/\s+/).length <= 4
      && !/\b(years?|experience|required|must|preferred|knowledge|ability|familiar|strong)\b/i.test(term)
      ? [normalizeSkill(term)] : [];
  });
  const inferred = skills.length ? skills : suggestSkills(job.title + ' ' + job.requirements + ' ' + job.description);
  return [...new Set(inferred)].slice(0, 40);
}
