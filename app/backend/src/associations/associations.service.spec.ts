import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AssociationsService } from './associations.service';
import { Association } from './association.entity';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { Minute } from '../minutes/minutes.entity';

describe('AssociationsService', () => {
  let service: AssociationsService;
  let associationRepo: Repository<Association>;
  let userRepo: Repository<User>;
  let roleRepo: Repository<Role>;
  let minuteRepo: Repository<Minute>;

  const mockAssociationRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRoleRepo = {
    find: jest.fn(),
  };

  const mockMinuteRepo = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociationsService,
        {
          provide: getRepositoryToken(Association),
          useValue: mockAssociationRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepo,
        },
        {
          provide: getRepositoryToken(Minute),
          useValue: mockMinuteRepo,
        },
      ],
    }).compile();

    service = module.get<AssociationsService>(AssociationsService);
    associationRepo = module.get<Repository<Association>>(getRepositoryToken(Association));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    roleRepo = module.get<Repository<Role>>(getRepositoryToken(Role));
    minuteRepo = module.get<Repository<Minute>>(getRepositoryToken(Minute));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all associations mapped to DTOs', async () => {
      const mockAssoc = new Association();
      mockAssoc.id = 1;
      mockAssoc.name = 'Test Assoc';
      mockAssoc.roles = [];

      mockAssociationRepo.find.mockResolvedValue([mockAssoc]);

      const result = await service.getAll();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('Test Assoc');
      expect(result[0].members).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return association DTO when found', async () => {
      const user = new User();
      user.id = 10;
      user.lastname = 'Doe';
      user.firstname = 'John';
      user.age = 30;

      const role = new Role();
      role.name = 'President';
      role.user = user;

      const mockAssoc = new Association();
      mockAssoc.id = 1;
      mockAssoc.name = 'Test Assoc';
      mockAssoc.roles = [role];

      mockAssociationRepo.findOne.mockResolvedValue(mockAssoc);

      const result = await service.getById(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Test Assoc');
      expect(result.members).toHaveLength(1);
      expect(result.members[0].role).toBe('President');
    });

    it('should throw HttpException when association is not found', async () => {
      mockAssociationRepo.findOne.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(HttpException);
    });
  });

  describe('getMembersById', () => {
    it('should return members of the association', async () => {
      const mockAssoc = new Association();
      mockAssoc.id = 1;
      mockAssoc.name = 'Test Assoc';
      mockAssoc.roles = [];

      mockAssociationRepo.findOne.mockResolvedValue(mockAssoc);

      const result = await service.getMembersById(1);
      expect(result).toEqual([]);
    });
  });

  describe('getMinutesById', () => {
    it('should return minutes when association exists without sort', async () => {
      const assoc = new Association();
      assoc.id = 1;
      const minutes = [new Minute()];

      mockAssociationRepo.findOne.mockResolvedValue(assoc);
      mockMinuteRepo.find.mockResolvedValue(minutes);

      const result = await service.getMinutesById(1, undefined, undefined);
      expect(result).toEqual(minutes);
      expect(mockMinuteRepo.find).toHaveBeenCalledWith({
        where: { association: { id: 1 } },
      });
    });

    it('should return sorted minutes when sort=date is provided', async () => {
      const assoc = new Association();
      assoc.id = 1;
      const minutes = [new Minute()];

      mockAssociationRepo.findOne.mockResolvedValue(assoc);
      mockMinuteRepo.find.mockResolvedValue(minutes);

      const result = await service.getMinutesById(1, 'date', 'DESC');
      expect(result).toEqual(minutes);
      expect(mockMinuteRepo.find).toHaveBeenCalledWith({
        where: { association: { id: 1 } },
        order: { date: 'DESC' },
      });
    });

    it('should throw HttpException if association does not exist', async () => {
      mockAssociationRepo.findOne.mockResolvedValue(null);

      await expect(service.getMinutesById(999, undefined, undefined)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('create', () => {
    it('should create and save an association', async () => {
      const assoc = new Association();
      assoc.name = 'New Association';

      mockAssociationRepo.create.mockReturnValue(assoc);
      mockAssociationRepo.save.mockResolvedValue(assoc);

      const result = await service.create('New Association');
      expect(result).toEqual(assoc);
      expect(mockAssociationRepo.save).toHaveBeenCalledWith(assoc);
    });
  });

  describe('update', () => {
    it('should update and return the association', async () => {
      const assoc = new Association();
      assoc.id = 1;
      assoc.name = 'Old Name';

      mockAssociationRepo.findOne.mockResolvedValue(assoc);
      mockAssociationRepo.save.mockResolvedValue(assoc);

      const result = await service.update(1, 'Updated Name');
      expect(result.name).toBe('Updated Name');
      expect(mockAssociationRepo.save).toHaveBeenCalled();
    });

    it('should throw HttpException when association to update is not found', async () => {
      mockAssociationRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, 'Name')).rejects.toThrow(HttpException);
    });
  });

  describe('delete', () => {
    it('should delete association and return true', async () => {
      mockAssociationRepo.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result = await service.delete(1);
      expect(result).toBe(true);
      expect(mockAssociationRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException when delete affected is 0', async () => {
      mockAssociationRepo.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.delete(999)).rejects.toThrow(HttpException);
    });
  });
});
