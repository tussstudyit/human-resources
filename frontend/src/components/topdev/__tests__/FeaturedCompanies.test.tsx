import { expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { FeaturedCompanies } from '../FeaturedCompanies';
import { adaptJobPostToTopDevJob } from '@/lib/topdev-adapter';
import type { JobPost } from '@/types/recruitment';
it('counts live openings by division and updates when a job is removed',()=>{
 const make=(id:string,title:string)=>adaptJobPostToTopDevJob({id,title,description:'Hà Nội',requirements:'Python',status:'OPEN',createdAt:'2026-10-31',updatedAt:'2026-10-31'} as JobPost);
 const jobs=[make('a','AI Engineer'),make('b','Data Engineer'),make('c','Cloud DevOps Engineer')];
 const onSelectCompany=vi.fn();const {rerender}=render(<FeaturedCompanies jobs={[...jobs,{...jobs[0],id:'sample',isRealFromBackend:false}]} onSelectCompany={onSelectCompany}/>);
 const card=()=>screen.getByText('HR Tech Hub - AI & Data Intelligence').closest('.group') as HTMLElement;
 expect(within(card()).getByText('2 việc làm đang tuyển')).toBeInTheDocument();
 fireEvent.click(card());expect(onSelectCompany).toHaveBeenCalledWith('HR Tech Hub - AI & Data Intelligence');
 rerender(<FeaturedCompanies jobs={[jobs[2]]} onSelectCompany={onSelectCompany}/>);
 expect(within(card()).getByText('0 việc làm đang tuyển')).toBeInTheDocument();
});
