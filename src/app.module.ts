import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { User } from './entities/user.entity';
import { Sweet } from './entities/sweet.entity';
import { UsersRepository } from './repositories/users.repository';
import { SweetsRepository } from './repositories/sweets.repository';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Sweet]),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, UsersRepository, SweetsRepository],
  exports: [UsersRepository, SweetsRepository],
})
export class AppModule {}
