import {
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

export class ApproveRubricDto {
  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  requiredSkills: string[];
  @IsObject() weights: Record<string, number>;
}
export class EvaluationResultDto {
  @IsIn(['DONE', 'NEEDS_REVIEW', 'FAILED']) status: string;
  @IsString() @MaxLength(100) claimToken: string;
  @IsOptional() @IsString() @MaxLength(100) cvHash?: string;
  @IsOptional() @IsString() @MaxLength(100) modelId?: string;
  @IsOptional() @IsString() @MaxLength(100) errorCode?: string;
  @IsOptional() @IsObject() extraction?: Record<string, unknown>;
  @IsOptional() @IsArray() @ArrayMaxSize(200) segments?: Array<{
    id: string;
    text: string;
  }>;
  @IsOptional() @IsString() @MaxLength(4000) feedback?: string;
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsIn(['skills', 'projects', 'production', 'discipline'], { each: true })
  feedbackFocus?: string[];
}
export class DeliveryResultDto {
  @IsIn(['INTERVIEW', 'TALENT_POOL']) action: string;
  @IsIn(['SENT', 'FAILED', 'UNKNOWN']) status: string;
  @IsOptional() @IsObject() metadata?: Record<string, unknown>;
}
