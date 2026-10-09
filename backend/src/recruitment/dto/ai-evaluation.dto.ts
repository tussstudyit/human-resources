import {
  IsDefined,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateBy,
  ValidationOptions,
} from 'class-validator';
import { Type } from 'class-transformer';

function IsObjectOrArray(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isObjectOrArray',
      validator: {
        validate: (value: any) => typeof value === 'object' && value !== null,
        defaultMessage: () => 'parsedSkillsJson must be an object or array',
      },
    },
    validationOptions,
  );
}

export class AiEvaluationDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  matchScore: number;

  @IsDefined()
  @IsObjectOrArray()
  parsedSkillsJson: any;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @IsOptional()
  @IsString()
  summary?: string;
}
