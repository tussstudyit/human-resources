import { Module } from '@nestjs/common';
import { TrainingService } from './training.service.js';
import { TrainingController } from './training.controller.js';

@Module({
  providers: [TrainingService],
  controllers: [TrainingController]
})
export class TrainingModule {}
