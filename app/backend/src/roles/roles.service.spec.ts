import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RolesService } from './roles.service';
import { Role } from './role.entity';
import { User } from '../users/user.entity';
import { Association } from '../associations/association.entity';

describe('RolesService', () => {
  let service: RolesService;
  let roleRepo: Repository<Role>;
  let userRepo: Repository<User>;
  let associationRepo: Repository<Association>;

  const mockRoleRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockAssociationRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepo,
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

    service = module.get<RolesService>(RolesService);
    roleRepo = module.get<Repository<Role>>(getRepositoryToken(Role));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    associationRepo = module.get<Repository<Association>>(getRepositoryToken(Association));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserRoleInAssociation', () => {
    it('should return role when found', async () => {
      const role = new Role();
      role.idUser = 1;
      role.idAssociation = 2;
      mockRoleRepo.findOne.mockResolvedValue(role);

      const result = await service.getUserRoleInAssociation(1, 2);
      expect(result).toEqual(role);
      expect(mockRoleRepo.findOne).toHaveBeenCalledWith({
        where: { idUser: 1, idAssociation: 2 },
      });
    });

    it('should throw HttpException when role not found', async () => {
      mockRoleRepo.findOne.mockResolvedValue(null);

      await expect(service.getUserRoleInAssociation(1, 2)).rejects.toThrow(HttpException);
    });
  });

  describe('getUsersHavingRole', () => {
    it('should return users having the specified role name', async () => {
      const role1 = new Role();
      role1.idUser = 10;
      role1.name = 'Admin';
      const user = new User();
      user.id = 10;

      mockRoleRepo.find.mockResolvedValue([role1]);
      mockUserRepo.find.mockResolvedValue([user]);

      const result = await service.getUsersHavingRole('Admin');
      expect(result).toEqual([user]);
      expect(mockRoleRepo.find).toHaveBeenCalledWith({ where: { name: 'Admin' } });
    });
  });

  describe('create', () => {
    it('should create and save a new role', async () => {
      const user = new User();
      user.id = 1;
      const association = new Association();
      association.id = 2;
      const savedRole = new Role();
      savedRole.idUser = 1;
      savedRole.idAssociation = 2;
      savedRole.name = 'Treasurer';

      mockUserRepo.findOne.mockResolvedValue(user);
      mockAssociationRepo.findOne.mockResolvedValue(association);
      mockRoleRepo.save.mockResolvedValue(savedRole);

      const result = await service.create('Treasurer', 1, 2);
      expect(result).toEqual(savedRole);
      expect(mockRoleRepo.save).toHaveBeenCalled();
    });

    it('should throw HttpException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.create('Treasurer', 1, 2)).rejects.toThrow(HttpException);
    });

    it('should throw HttpException if association not found', async () => {
      const user = new User();
      user.id = 1;
      mockUserRepo.findOne.mockResolvedValue(user);
      mockAssociationRepo.findOne.mockResolvedValue(null);

      await expect(service.create('Treasurer', 1, 2)).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should update role name and save', async () => {
      const role = new Role();
      role.idUser = 1;
      role.idAssociation = 2;
      role.name = 'OldName';

      mockRoleRepo.findOne.mockResolvedValue(role);
      mockRoleRepo.save.mockResolvedValue({ ...role, name: 'NewName' });

      const result = await service.update(1, 2, 'NewName');
      expect(result.name).toBe('NewName');
      expect(mockRoleRepo.save).toHaveBeenCalled();
    });

    it('should throw HttpException if role not found for update', async () => {
      mockRoleRepo.findOne.mockResolvedValue(null);

      await expect(service.update(1, 2, 'NewName')).rejects.toThrow(HttpException);
    });
  });

  describe('delete', () => {
    it('should delete role and return true', async () => {
      const role = new Role();
      mockRoleRepo.findOne.mockResolvedValue(role);
      mockRoleRepo.remove.mockResolvedValue(role);

      const result = await service.delete(1, 2);
      expect(result).toBe(true);
      expect(mockRoleRepo.remove).toHaveBeenCalledWith(role);
    });

    it('should throw HttpException if role not found for delete', async () => {
      mockRoleRepo.findOne.mockResolvedValue(null);

      await expect(service.delete(1, 2)).rejects.toThrow(HttpException);
    });
  });
});
