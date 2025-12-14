import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { getDatabaseConfig } from './config/database.config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

describe('AppModule', () => {
  let module: TestingModule;
  let configService: ConfigService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        AppModule,
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
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
    expect(dbConfig.host).toBeDefined();
    expect(dbConfig.port).toBeDefined();
    expect(dbConfig.type).toBe('postgres');
  });
});

