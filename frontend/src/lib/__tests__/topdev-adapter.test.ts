import { describe, it, expect } from 'vitest';
import {
  inferJobLevel,
  inferWorkType,
  inferLocation,
  splitParagraphs,
  adaptJobPostToTopDevJob,
  mergeRealAndSampleJobs,
} from '../topdev-adapter';
import { JobPost } from '@/types/recruitment';
import { SAMPLE_JOBS } from '@/data/topdevMockData';

describe('TopDev Adapter', () => {
  describe('inferJobLevel', () => {
    it('nhận diện Senior chính xác', () => {
      expect(inferJobLevel('Senior Software Engineer')).toBe('Senior');
      expect(inferJobLevel('Chuyên viên cao cấp React')).toBe('Senior');
    });

    it('nhận diện Lead / Manager chính xác', () => {
      expect(inferJobLevel('Tech Lead Backend')).toBe('Lead / Manager');
      expect(inferJobLevel('Engineering Manager')).toBe('Lead / Manager');
      expect(inferJobLevel('Trưởng nhóm phát triển')).toBe('Lead / Manager');
    });

    it('nhận diện Intern / Fresher / Junior chính xác', () => {
      expect(inferJobLevel('Frontend Intern')).toBe('Intern');
      expect(inferJobLevel('Thực tập sinh NodeJS')).toBe('Intern');
      expect(inferJobLevel('Fresher Golang Developer')).toBe('Fresher');
      expect(inferJobLevel('Junior Mobile Engineer')).toBe('Junior');
    });

    it('mặc định là Middle nếu không có từ khóa đặc thù', () => {
      expect(inferJobLevel('Developer Web Fullstack')).toBe('Middle');
    });
  });

  describe('inferWorkType', () => {
    it('nhận diện Remote', () => {
      expect(inferWorkType('Golang Engineer (100% Remote)')).toBe('Remote');
      expect(inferWorkType('Developer', 'Cho phép làm việc từ xa hoàn toàn')).toBe('Remote');
    });

    it('nhận diện Hybrid', () => {
      expect(inferWorkType('Frontend Dev (Hybrid 2 days)')).toBe('Hybrid');
    });

    it('mặc định là At office', () => {
      expect(inferWorkType('DevOps Engineer')).toBe('At office');
    });
  });

  describe('inferLocation', () => {
    it('nhận diện Hà Nội, Đà Nẵng, Cần Thơ, Hồ Chí Minh', () => {
      expect(inferLocation('Kỹ sư phần mềm Hà Nội')).toBe('Hà Nội');
      expect(inferLocation('Backend Developer', 'Làm việc tại Đà Nẵng')).toBe('Đà Nẵng');
      expect(inferLocation('Dev Cần Thơ')).toBe('Cần Thơ');
      expect(inferLocation('Fullstack Developer')).toBe('Hồ Chí Minh');
    });
  });

  describe('splitParagraphs', () => {
    it('tách chuỗi thành mảng và gỡ bỏ bullet', () => {
      const raw = `- Yêu cầu 1\n* Yêu cầu 2\n• Yêu cầu 3\nYêu cầu 4`;
      const result = splitParagraphs(raw);
      expect(result).toEqual(['Yêu cầu 1', 'Yêu cầu 2', 'Yêu cầu 3', 'Yêu cầu 4']);
    });

    it('trả về mảng rỗng nếu chuỗi rỗng', () => {
      expect(splitParagraphs('')).toEqual([]);
    });
  });

  describe('adaptJobPostToTopDevJob', () => {
    const mockJobPost: JobPost = {
      id: 'mock-uuid-1234',
      title: 'Senior React Developer (Remote)',
      description: 'Phát triển kiến trúc Web Frontend.\nTối ưu hiệu năng Core Web Vitals.',
      requirements: 'ReactJS, TypeScript, Tailwind CSS, Docker, PostgreSQL',
      status: 'OPEN',
      department: 'Kỹ thuật & Công nghệ',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: {
        candidates: 5,
      },
    };

    it('chuyển đổi đầy đủ các trường của JobPost sang TopDev Job', () => {
      const topdevJob = adaptJobPostToTopDevJob(mockJobPost);

      expect(topdevJob.id).toBe('mock-uuid-1234');
      expect(topdevJob.backendJobId).toBe('mock-uuid-1234');
      expect(topdevJob.isRealFromBackend).toBe(true);
      expect(topdevJob.title).toBe('Senior React Developer (Remote)');
      expect(topdevJob.level).toBe('Senior');
      expect(topdevJob.workType).toBe('Remote');
      expect(topdevJob.skills).toContain('ReactJS');
      expect(topdevJob.skills).toContain('TypeScript');
      expect(topdevJob.applicantsCount).toBe(5);
      expect(topdevJob.description.length).toBe(2);
      expect(topdevJob.requirements.length).toBe(5);
      expect(topdevJob.techStackDetails.database).toContain('PostgreSQL');
      expect(topdevJob.techStackDetails.cloudDevops).toContain('Docker');
    });
  });

  describe('mergeRealAndSampleJobs', () => {
    it('đưa việc làm thật từ backend lên đầu danh sách', () => {
      const mockJobPost: JobPost = {
        id: 'real-job-1',
        title: 'Backend Node.js Engineer',
        description: 'Mô tả',
        requirements: 'NodeJS, NestJS',
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const merged = mergeRealAndSampleJobs([mockJobPost], SAMPLE_JOBS.slice(0, 3));
      expect(merged[0].id).toBe('real-job-1');
      expect(merged[0].isRealFromBackend).toBe(true);
      expect(merged.length).toBe(4);
    });
  });
});
