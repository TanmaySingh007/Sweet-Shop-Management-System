import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersRepository } from '../repositories/users.repository';
import { RegisterDto } from './dto/register.dto';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;

  const mockUsersRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get(UsersRepository);

    // Reset mocks
    jest.clearAllMocks();
    bcryptMock.hash.mockReset();
  });

  describe('registerUser', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      const existingUser = new User();
      existingUser.email = registerDto.email;
      mockUsersRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.registerUser(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.registerUser(registerDto)).rejects.toThrow(
        'Email already exists',
      );
      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(mockUsersRepository.create).not.toHaveBeenCalled();
    });

    it('should invoke bcrypt hashing mechanism when creating new user', async () => {
      // Arrange
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      const hashedPassword = 'hashed_password';
      bcryptMock.hash.mockResolvedValue(hashedPassword as never);
      
      const newUser = new User();
      newUser.email = registerDto.email;
      newUser.passwordHash = hashedPassword;
      mockUsersRepository.create.mockResolvedValue(newUser);

      // Act
      await service.registerUser(registerDto);

      // Assert
      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(bcryptMock.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUsersRepository.create).toHaveBeenCalled();
    });

    it('should successfully create a new user with hashed password', async () => {
      // Arrange
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      const hashedPassword = 'hashed_password';
      bcryptMock.hash.mockResolvedValue(hashedPassword as never);
      
      const newUser = new User();
      newUser.id = 'user-id';
      newUser.email = registerDto.email;
      newUser.passwordHash = hashedPassword;
      newUser.isAdmin = false;
      mockUsersRepository.create.mockResolvedValue(newUser);

      // Act
      const result = await service.registerUser(registerDto);

      // Assert
      expect(result).toEqual(newUser);
      expect(bcryptMock.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUsersRepository.create).toHaveBeenCalled();
    });
  });
});

