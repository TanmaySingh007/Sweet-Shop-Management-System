import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sweet } from '../entities/sweet.entity';
import { CreateSweetDto } from '../dto/create-sweet.dto';

@Injectable()
export class SweetsRepository {
  constructor(
    @InjectRepository(Sweet)
    private readonly sweetRepository: Repository<Sweet>,
  ) {}

  async create(createSweetDto: CreateSweetDto): Promise<Sweet> {
    const sweet = this.sweetRepository.create({
      name: createSweetDto.name,
      category: createSweetDto.category,
      price: createSweetDto.price,
      quantity: createSweetDto.quantity,
    });
    return await this.sweetRepository.save(sweet);
  }

  async findAll(): Promise<Sweet[]> {
    return await this.sweetRepository.find();
  }

  async findById(id: string): Promise<Sweet | null> {
    return await this.sweetRepository.findOne({ where: { id } });
  }
}

