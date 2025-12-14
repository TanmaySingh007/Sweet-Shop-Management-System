import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SweetsController } from './sweets.controller';
import { SweetsService } from './sweets.service';
import { SweetsRepository } from '../repositories/sweets.repository';
import { Sweet } from '../entities/sweet.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Sweet])],
  controllers: [SweetsController],
  providers: [SweetsService, SweetsRepository, RolesGuard],
  exports: [SweetsService],
})
export class SweetsModule {}

