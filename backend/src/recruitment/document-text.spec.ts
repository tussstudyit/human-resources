import { describe, expect, it } from 'vitest';
import { cleanDocumentText, cleanJsonText } from './document-text.js';

describe('PDF text at the PostgreSQL boundary',()=>{
  it('removes NUL and repairs lone surrogates while preserving Vietnamese, emoji and line breaks',()=>{
    expect(cleanDocumentText('Đoàn\u0000 Huy 😀\nNodeJS\ud800')).toBe('Đoàn Huy 😀\nNodeJS\ufffd');
  });
  it('cleans nested evidence without changing numbers, nulls or legitimate literal escapes',()=>{
    const source={score:40,missing:null,segments:[{text:'Node\u0000JS'}],literal:'\\u0000'};
    const clean=cleanJsonText(source);
    expect(clean).toEqual({score:40,missing:null,segments:[{text:'NodeJS'}],literal:'\\u0000'});
    expect(source.segments[0].text).toContain('\u0000');
  });
});
