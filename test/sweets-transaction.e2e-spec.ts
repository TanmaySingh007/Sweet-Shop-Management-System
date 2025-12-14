import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Sweet } from '../src/entities/sweet.entity';
import * as bcrypt from 'bcrypt';

describe('Sweets Purchase Transaction (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let sweetRepository: Repository<Sweet>;
  let authToken: string;
  let testSweetId: string;

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
    sweetRepository = moduleFixture.get<Repository<Sweet>>(
      getRepositoryToken(Sweet),
    );
    await app.init();

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = userRepository.create({
      email: 'testuser@example.com',
      passwordHash: hashedPassword,
      isAdmin: false,
    });
    await userRepository.save(testUser);

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
      });
    authToken = loginResponse.body.access_token;

    // Create a test sweet with quantity 1
    const testSweet = sweetRepository.create({
      name: 'Test Sweet for Purchase',
      category: 'Test',
      price: 100.0,
      quantity: 1,
    });
    const savedSweet = await sweetRepository.save(testSweet);
    testSweetId = savedSweet.id;
  });

  afterAll(async () => {
    await sweetRepository.delete({ id: testSweetId });
    await userRepository.delete({ email: 'testuser@example.com' });
    await app.close();
  });

  describe('POST /api/sweets/:id/purchase - Concurrency Test', () => {
    it('should handle two simultaneous requests for last remaining unit, ensuring only one succeeds', async () => {
      // Create a sweet with quantity 1
      const testSweet = sweetRepository.create({
        name: 'Concurrency Test Sweet',
        category: 'Test',
        price: 50.0,
        quantity: 1,
      });
      const savedSweet = await sweetRepository.save(testSweet);
      const concurrencyTestId = savedSweet.id;

      // Make two simultaneous purchase requests
      const [response1, response2] = await Promise.allSettled([
        request(app.getHttpServer())
          .post(`/api/sweets/${concurrencyTestId}/purchase`)
          .set('Authorization', `Bearer ${authToken}`),
        request(app.getHttpServer())
          .post(`/api/sweets/${concurrencyTestId}/purchase`)
          .set('Authorization', `Bearer ${authToken}`),
      ]);

      // One should succeed (200), one should fail (400 - out of stock)
      const successCount = [response1, response2].filter(
        (r) => r.status === 'fulfilled' && r.value.status === 200,
      ).length;
      const failureCount = [response1, response2].filter(
        (r) => r.status === 'fulfilled' && r.value.status === 400,
      ).length;

      expect(successCount).toBe(1);
      expect(failureCount).toBe(1);

      // Verify final quantity is zero (never negative)
      const finalSweet = await sweetRepository.findOne({ where: { id: concurrencyTestId } });
      expect(finalSweet.quantity).toBe(0);
      expect(finalSweet.quantity).not.toBeLessThan(0);

      // Cleanup
      await sweetRepository.delete({ id: concurrencyTestId });
    });

    it('should successfully purchase when stock is available', async () => {
      // Create a sweet with quantity 5
      const testSweet = sweetRepository.create({
        name: 'Available Sweet',
        category: 'Test',
        price: 50.0,
        quantity: 5,
      });
      const savedSweet = await sweetRepository.save(testSweet);

      const response = await request(app.getHttpServer())
        .post(`/api/sweets/${savedSweet.id}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.quantity).toBe(4);

      // Verify in database
      const updatedSweet = await sweetRepository.findOne({ where: { id: savedSweet.id } });
      expect(updatedSweet.quantity).toBe(4);

      // Cleanup
      await sweetRepository.delete({ id: savedSweet.id });
    });

    it('should return 400 when purchasing out of stock item', async () => {
      // Create a sweet with quantity 0
      const testSweet = sweetRepository.create({
        name: 'Out of Stock Sweet',
        category: 'Test',
        price: 50.0,
        quantity: 0,
      });
      const savedSweet = await sweetRepository.save(testSweet);

      const response = await request(app.getHttpServer())
        .post(`/api/sweets/${savedSweet.id}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.message).toContain('out of stock');

      // Verify quantity is still 0
      const updatedSweet = await sweetRepository.findOne({ where: { id: savedSweet.id } });
      expect(updatedSweet.quantity).toBe(0);

      // Cleanup
      await sweetRepository.delete({ id: savedSweet.id });
    });

    it('should return 401 when purchasing without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/api/sweets/${testSweetId}/purchase`)
        .expect(401);
    });
  });
});

