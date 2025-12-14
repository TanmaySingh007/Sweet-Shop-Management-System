import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('SweetsController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.setGlobalPrefix('api');
    
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    await app.init();

    // Create test user for authentication
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = userRepository.create({
      email: 'testuser@example.com',
      passwordHash: hashedPassword,
      isAdmin: false,
    });
    await userRepository.save(testUser);

    // Create admin user
    const adminUser = userRepository.create({
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      isAdmin: true,
    });
    await userRepository.save(adminUser);

    // Login to get tokens
    const userLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
      });
    authToken = userLoginResponse.body.access_token;

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });
    adminToken = adminLoginResponse.body.access_token;
  });

  afterAll(async () => {
    // Clean up test users
    await userRepository.delete({ email: 'testuser@example.com' });
    await userRepository.delete({ email: 'admin@example.com' });
    await app.close();
  });

  describe('POST /api/sweets', () => {
    it('should return 401 Unauthorized when request is sent without JWT token', async () => {
      const createSweetDto = {
        name: 'Gulab Jamun',
        category: 'Traditional',
        price: 50.0,
        quantity: 100,
      };

      await request(app.getHttpServer())
        .post('/api/sweets')
        .send(createSweetDto)
        .expect(401);
    });

    it('should return 400 Bad Request for negative price value', async () => {
      const createSweetDto = {
        name: 'Barfi',
        category: 'Traditional',
        price: -10.0, // Negative price
        quantity: 50,
      };

      const response = await request(app.getHttpServer())
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createSweetDto)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should return 400 Bad Request for negative quantity value', async () => {
      const createSweetDto = {
        name: 'Rasgulla',
        category: 'Traditional',
        price: 75.0,
        quantity: -5, // Negative quantity
      };

      const response = await request(app.getHttpServer())
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createSweetDto)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should successfully create a sweet with valid DTO and JWT token', async () => {
      const createSweetDto = {
        name: 'Jalebi',
        category: 'Traditional',
        price: 60.0,
        quantity: 80,
      };

      const response = await request(app.getHttpServer())
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createSweetDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createSweetDto.name);
      expect(response.body.category).toBe(createSweetDto.category);
      expect(parseFloat(response.body.price)).toBe(createSweetDto.price);
      expect(response.body.quantity).toBe(createSweetDto.quantity);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let createdSweetId: string;

    beforeEach(async () => {
      // Create a sweet for deletion tests
      const createSweetDto = {
        name: 'Test Sweet for Deletion',
        category: 'Test',
        price: 30.0,
        quantity: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createSweetDto)
        .expect(201);

      createdSweetId = response.body.id;
    });

    afterEach(async () => {
      // Clean up if sweet still exists
      if (createdSweetId) {
        try {
          await request(app.getHttpServer())
            .delete(`/api/sweets/${createdSweetId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(204);
        } catch (error) {
          // Sweet already deleted, ignore
        }
      }
    });

    it('should return 401 Unauthorized when request is sent without JWT token', async () => {
      await request(app.getHttpServer())
        .delete(`/api/sweets/${createdSweetId}`)
        .expect(401);
    });

    it('should return 403 Forbidden when regular user attempts to delete', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/sweets/${createdSweetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('should return 204 No Content when admin successfully deletes a sweet', async () => {
      await request(app.getHttpServer())
        .delete(`/api/sweets/${createdSweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify sweet is deleted
      await request(app.getHttpServer())
        .get(`/api/sweets/${createdSweetId}`)
        .expect(404);
    });

    it('should return 404 Not Found when deleting non-existent sweet', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .delete(`/api/sweets/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});

