import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MinutesService } from './minutes.service';
import { Minute } from './minutes.entity';
import { User } from '../users/user.entity';
import { Association } from '../associations/association.entity';

describe('MinutesService', () => {
  let service: MinutesService;
  let minuteRepo: Repository<Minute>;
  let userRepo: Repository<User>;
  let associationRepo: Repository<Association>;

  const mockMinuteRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepo = {
    find: jest.fn(),
  };

  const mockAssociationRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinutesService,
        {
          provide: getRepositoryToken(Minute),
          useValue: mockMinuteRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(Association),
          useValue: mockAssociationRepo,
        },
      ],
    }).compile();

    service = module.get<MinutesService>(MinutesService);
    minuteRepo = module.get<Repository<Minute>>(getRepositoryToken(Minute));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    associationRepo = module.get<Repository<Association>>(getRepositoryToken(Association));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getById', () => {
    it('should return a minute when found', async () => {
      const minute = new Minute();
      minute.id = 1;
      mockMinuteRepo.findOne.mockResolvedValue(minute);

      const result = await service.getById(1);
      expect(result).toEqual(minute);
      expect(mockMinuteRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw HttpException when minute is not found', async () => {
      mockMinuteRepo.findOne.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(HttpException);
    });
  });

  describe('create', () => {
    it('should create and save a minute', async () => {
      const users = [new User()];
      const association = new Association();
      association.id = 1;
      const createdMinute = new Minute();
      createdMinute.date = '2026-01-01';
      createdMinute.content = 'Meeting';

      mockUserRepo.find.mockResolvedValue(users);
      mockAssociationRepo.findOne.mockResolvedValue(association);
      mockMinuteRepo.create.mockReturnValue(createdMinute);
      mockMinuteRepo.save.mockResolvedValue(createdMinute);

      const result = await service.create('2026-01-01', 'Meeting', 1, [1]);
      expect(result).toEqual(createdMinute);
      expect(mockMinuteRepo.save).toHaveBeenCalledWith(createdMinute);
    });

    it('should throw HttpException if association is not found', async () => {
      mockUserRepo.find.mockResolvedValue([new User()]);
      mockAssociationRepo.findOne.mockResolvedValue(null);

      await expect(service.create('2026-01-01', 'Meeting', 999, [1])).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('update', () => {
    it('should update and save the minute', async () => {
      const minute = new Minute();
      minute.id = 1;
      const users = [new User()];
      const association = new Association();
      association.id = 1;

      mockMinuteRepo.findOne.mockResolvedValue(minute);
      mockUserRepo.find.mockResolvedValue(users);
      mockAssociationRepo.findOne.mockResolvedValue(association);
      mockMinuteRepo.save.mockResolvedValue(minute);

      const result = await service.update(1, '2026-02-01', 'New content', 1, [1]);
      expect(result.date).toBe('2026-02-01');
      expect(result.content).toBe('New content');
      expect(mockMinuteRepo.save).toHaveBeenCalledWith(minute);
    });

    it('should throw HttpException if minute not found for update', async () => {
      mockMinuteRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, '2026-02-01', 'New content', 1, [1]),
      ).rejects.toThrow(HttpException);
    });

    it('should throw HttpException if association not found for update', async () => {
      const minute = new Minute();
      mockMinuteRepo.findOne.mockResolvedValue(minute);
      mockUserRepo.find.mockResolvedValue([new User()]);
      mockAssociationRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, '2026-02-01', 'New content', 999, [1]),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('delete', () => {
    it('should delete minute and return true', async () => {
      const minute = new Minute();
      mockMinuteRepo.findOne.mockResolvedValue(minute);
      mockMinuteRepo.remove.mockResolvedValue(minute);

      const result = await service.delete(1);
      expect(result).toBe(true);
      expect(mockMinuteRepo.remove).toHaveBeenCalledWith(minute);
    });

    it('should throw HttpException if minute not found for delete', async () => {
      mockMinuteRepo.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(HttpException);
    });
  });
});
