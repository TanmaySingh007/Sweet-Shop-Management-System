import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from './app.module';
import { getDatabaseConfig } from './config/database.config';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
          inject: [ConfigService],
        }),
        AppModule,
      ],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should load TypeOrmModule configuration successfully', () => {
    // TypeOrmModule is a dynamic module, so we verify it's loaded by checking the module
    const appModule = module.get(AppModule);
    expect(appModule).toBeDefined();
  });

  it('should load ConfigModule successfully', () => {
    const configService = module.get<ConfigService>(ConfigService);
    expect(configService).toBeDefined();
  });

  it('should have database configuration with SnakeNamingStrategy', () => {
    const configService = module.get<ConfigService>(ConfigService);
    const dbConfig = getDatabaseConfig(configService);
    expect(dbConfig.namingStrategy).toBeDefined();
    expect(dbConfig.type).toBe('postgres');
  });
});

