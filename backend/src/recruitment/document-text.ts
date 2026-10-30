// PostgreSQL text/jsonb cannot store NUL or unpaired UTF-16 surrogates.
// PDF extractors may emit these even for otherwise readable documents.
import { cleanDocumentText } from './scoring.js';
export { cleanDocumentText } from './scoring.js';

export function cleanJsonText<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (_key, part: unknown) =>
    typeof part === 'string' ? cleanDocumentText(part) : part,
  )) as T;
}
