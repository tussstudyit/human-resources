import { expect, it } from 'vitest';
import { automaticRequiredSkills } from './automatic-rubric.js';
it('uses explicit JD requirements, including technologies outside the alias map',()=>{
 expect(automaticRequiredSkills({title:'Flutter engineer',description:'Team uses AWS too',requirements:'Flutter\nDart\nNodeJS, PostgreSQL\nPlaywright'})).toEqual(['Flutter','Dart','Node.js','PostgreSQL','Playwright']);
});
it('does not invent requirements for an empty or generic JD',()=>{
 expect(automaticRequiredSkills({title:'Engineer',description:'Work with our team.',requirements:'Có tinh thần học hỏi và giao tiếp tốt.'})).toEqual([]);
});
it('normalizes aliases, deduplicates and caps the number of explicit requirements',()=>{
 expect(automaticRequiredSkills({title:'',description:'',requirements:'NodeJS, node.js, TypeScript'})).toEqual(['Node.js','TypeScript']);
 expect(automaticRequiredSkills({title:'',description:'',requirements:Array.from({length:45},(_,i)=>`Tool${i}`).join('\n')})).toHaveLength(40);
});
