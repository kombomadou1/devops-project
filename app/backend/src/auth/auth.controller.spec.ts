import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return token upon successful login', async () => {
      const mockResult = { access_token: 'jwt-token-xyz' };
      mockAuthService.login.mockResolvedValue(mockResult);

      const request = { user: { id: 1, firstname: 'John', lastname: 'Doe' } };
      const result = await controller.login(request);
      expect(result).toEqual(mockResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(request.user);
    });
  });
});
