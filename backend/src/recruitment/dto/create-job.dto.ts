import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JobStatus } from '@prisma/client';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  requirements: string;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}
