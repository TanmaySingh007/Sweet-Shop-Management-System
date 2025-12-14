import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);

    jest.clearAllMocks();
  });

  const createMockExecutionContext = (user: any, handler?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => handler || jest.fn(),
      getClass: () => class {},
    } as ExecutionContext;
  };

  it('should allow access when no roles are required', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const context = createMockExecutionContext({ userId: '1', isAdmin: false });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow access for admin user when admin role is required', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);

    const context = createMockExecutionContext({ userId: '1', isAdmin: true });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException for non-admin user accessing admin endpoint', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);

    const context = createMockExecutionContext({ userId: '1', isAdmin: false });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('Insufficient permissions. Admin access required.');
  });

  it('should throw ForbiddenException when user is not authenticated', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);

    const context = createMockExecutionContext(null);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('User not authenticated');
  });

  it('should handle user object without isAdmin property as non-admin', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);

    const context = createMockExecutionContext({ userId: '1' });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should check isAdmin flag from JWT payload correctly', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);

    const adminContext = createMockExecutionContext({ userId: '1', email: 'admin@test.com', isAdmin: true });
    const nonAdminContext = createMockExecutionContext({ userId: '2', email: 'user@test.com', isAdmin: false });

    expect(guard.canActivate(adminContext)).toBe(true);
    expect(() => guard.canActivate(nonAdminContext)).toThrow(ForbiddenException);
  });
});

