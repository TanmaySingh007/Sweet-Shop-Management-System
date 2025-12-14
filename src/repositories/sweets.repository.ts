import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sweet } from '../entities/sweet.entity';
import { CreateSweetDto } from '../dto/create-sweet.dto';
import { SearchSweetsDto } from '../sweets/dto/search-sweets.dto';

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

  async search(searchDto: SearchSweetsDto): Promise<Sweet[]> {
    const queryBuilder = this.sweetRepository.createQueryBuilder('sweet');

    if (searchDto.name) {
      queryBuilder.andWhere('sweet.name ILIKE :name', {
        name: `%${searchDto.name}%`,
      });
    }

    if (searchDto.category) {
      queryBuilder.andWhere('sweet.category = :category', {
        category: searchDto.category,
      });
    }

    if (searchDto.minPrice !== undefined) {
      queryBuilder.andWhere('sweet.price >= :minPrice', {
        minPrice: searchDto.minPrice,
      });
    }

    if (searchDto.maxPrice !== undefined) {
      queryBuilder.andWhere('sweet.price <= :maxPrice', {
        maxPrice: searchDto.maxPrice,
      });
    }

    return await queryBuilder.getMany();
  }

  async delete(id: string): Promise<void> {
    await this.sweetRepository.delete(id);
  }
}

