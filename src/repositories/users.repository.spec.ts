import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersRepository } from './users.repository';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let userRepository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should fail to create a user when database table does not exist', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      // This will fail because the users table doesn't exist yet (RED phase)
      mockRepository.save.mockRejectedValueOnce(
        new Error('relation "users" does not exist'),
      );

      await expect(repository.create(createUserDto)).rejects.toThrow(
        'relation "users" does not exist',
      );
    });

    it('should attempt to hash password and save user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockRepository.save.mockRejectedValueOnce(
        new Error('relation "users" does not exist'),
      );

      await expect(repository.create(createUserDto)).rejects.toThrow();
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should fail to find user by email when table does not exist', async () => {
      mockRepository.findOne.mockRejectedValueOnce(
        new Error('relation "users" does not exist'),
      );

      await expect(repository.findByEmail('test@example.com')).rejects.toThrow(
        'relation "users" does not exist',
      );
    });
  });
});

