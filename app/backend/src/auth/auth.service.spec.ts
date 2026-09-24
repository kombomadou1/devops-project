import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    getById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials match', async () => {
      const user = new User();
      user.id = 1;
      user.password = 'hashedPassword';

      mockUsersService.getById.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(1, 'plainPassword');
      expect(result).toEqual(user);
      expect(mockUsersService.getById).toHaveBeenCalledWith(1);
      expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
    });

    it('should return undefined when password does not match', async () => {
      const user = new User();
      user.id = 1;
      user.password = 'hashedPassword';

      mockUsersService.getById.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(1, 'wrongPassword');
      expect(result).toBeUndefined();
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      mockJwtService.sign.mockReturnValue('jwt-token');

      const user = { id: 1 };
      const result = await service.login(user);
      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ username: 1 });
    });
  });
});
