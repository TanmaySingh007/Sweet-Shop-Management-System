import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

describe('AppModule Configuration', () => {
  let module: TestingModule;
  let configService: ConfigService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should load ConfigModule successfully', () => {
    expect(configService).toBeDefined();
  });

  it('should have database configuration with SnakeNamingStrategy', () => {
    const dbConfig = getDatabaseConfig(configService);
    expect(dbConfig.namingStrategy).toBeDefined();
    expect(dbConfig.namingStrategy).toBeInstanceOf(SnakeNamingStrategy);
    expect(dbConfig.type).toBe('postgres');
  });

  it('should configure database with correct default values', () => {
    const dbConfig = getDatabaseConfig(configService);
    expect(dbConfig.host).toBe('localhost');
    expect(dbConfig.port).toBe(5432);
    expect(dbConfig.type).toBe('postgres');
  });

  it('should use environment variables for database configuration', () => {
    // Test that the configuration function uses ConfigService
    const dbConfig = getDatabaseConfig(configService);
    expect(dbConfig).toHaveProperty('host');
    expect(dbConfig).toHaveProperty('port');
    expect(dbConfig).toHaveProperty('type');
    expect(dbConfig).toHaveProperty('namingStrategy');
  });
});

