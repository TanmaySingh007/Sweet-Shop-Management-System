import { Injectable } from '@nestjs/common';
import { SweetsRepository } from '../repositories/sweets.repository';
import { CreateSweetDto } from '../dto/create-sweet.dto';
import { SearchSweetsDto } from './dto/search-sweets.dto';
import { Sweet } from '../entities/sweet.entity';

@Injectable()
export class SweetsService {
  constructor(private readonly sweetsRepository: SweetsRepository) {}

  async create(createSweetDto: CreateSweetDto): Promise<Sweet> {
    return await this.sweetsRepository.create(createSweetDto);
  }

  async findAll(): Promise<Sweet[]> {
    return await this.sweetsRepository.findAll();
  }

  async findOne(id: string): Promise<Sweet | null> {
    return await this.sweetsRepository.findById(id);
  }

  async search(searchDto: SearchSweetsDto): Promise<Sweet[]> {
    return await this.sweetsRepository.search(searchDto);
  }

  async remove(id: string): Promise<void> {
    await this.sweetsRepository.delete(id);
  }
}

