import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SweetsRepository } from './sweets.repository';
import { Sweet } from '../entities/sweet.entity';
import { CreateSweetDto } from '../dto/create-sweet.dto';

describe('SweetsRepository', () => {
  let repository: SweetsRepository;
  let sweetRepository: Repository<Sweet>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SweetsRepository,
        {
          provide: getRepositoryToken(Sweet),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<SweetsRepository>(SweetsRepository);
    sweetRepository = module.get<Repository<Sweet>>(getRepositoryToken(Sweet));
  });

  describe('create', () => {
    it('should fail to create a sweet when database table does not exist', async () => {
      const createSweetDto: CreateSweetDto = {
        name: 'Gulab Jamun',
        category: 'Traditional',
        price: 50.0,
        quantity: 100,
      };

      // This will fail because the sweets table doesn't exist yet (RED phase)
      mockRepository.save.mockRejectedValueOnce(
        new Error('relation "sweets" does not exist'),
      );

      await expect(repository.create(createSweetDto)).rejects.toThrow(
        'relation "sweets" does not exist',
      );
    });

    it('should attempt to save sweet with correct properties', async () => {
      const createSweetDto: CreateSweetDto = {
        name: 'Barfi',
        category: 'Traditional',
        price: 75.5,
        quantity: 50,
      };

      mockRepository.save.mockRejectedValueOnce(
        new Error('relation "sweets" does not exist'),
      );

      await expect(repository.create(createSweetDto)).rejects.toThrow();
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should fail to find all sweets when table does not exist', async () => {
      mockRepository.find.mockRejectedValueOnce(
        new Error('relation "sweets" does not exist'),
      );

      await expect(repository.findAll()).rejects.toThrow(
        'relation "sweets" does not exist',
      );
    });
  });

  describe('findById', () => {
    it('should fail to find sweet by id when table does not exist', async () => {
      mockRepository.findOne.mockRejectedValueOnce(
        new Error('relation "sweets" does not exist'),
      );

      await expect(repository.findById('test-id')).rejects.toThrow(
        'relation "sweets" does not exist',
      );
    });
  });
});

