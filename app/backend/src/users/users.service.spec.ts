import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all users with their roles', async () => {
      const users = [new User()];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.getAll();
      expect(result).toEqual(users);
      expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['roles'] });
    });
  });

  describe('getById', () => {
    it('should return a user when found', async () => {
      const user = new User();
      user.id = 1;
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.getById(1);
      expect(result).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw HttpException when user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(HttpException);
    });
  });

  describe('getRoles', () => {
    it('should return roles for a given user', async () => {
      const user = new User();
      user.id = 1;
      user.roles = [];
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.getRoles(1);
      expect(result).toEqual([]);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['roles'],
      });
    });

    it('should throw HttpException when user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getRoles(999)).rejects.toThrow(HttpException);
    });
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const userData = {
        lastname: 'Doe',
        firstname: 'John',
        age: 30,
        password: 'hashedpassword',
      };
      const savedUser = { id: 1, ...userData } as User;
      mockRepository.create.mockReturnValue(savedUser);
      mockRepository.save.mockResolvedValue(savedUser);

      const result = await service.create('Doe', 'John', 30, 'hashedpassword');
      expect(mockRepository.create).toHaveBeenCalledWith(userData);
      expect(mockRepository.save).toHaveBeenCalledWith(savedUser);
      expect(result).toEqual(savedUser);
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const user = new User();
      user.id = 1;
      user.lastname = 'Old';
      user.firstname = 'Old';
      user.age = 20;
      user.password = 'oldpass';

      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue(user);

      const result = await service.update(1, 'NewLast', 'NewFirst', 25, 'newpass');
      expect(result.lastname).toBe('NewLast');
      expect(result.firstname).toBe('NewFirst');
      expect(result.age).toBe(25);
      expect(result.password).toBe('newpass');
      expect(mockRepository.save).toHaveBeenCalledWith(user);
    });
  });

  describe('delete', () => {
    it('should remove the user and return true', async () => {
      const user = new User();
      user.id = 1;
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.remove.mockResolvedValue(user);

      const result = await service.delete(1);
      expect(result).toBe(true);
      expect(mockRepository.remove).toHaveBeenCalledWith(user);
    });
  });
});
