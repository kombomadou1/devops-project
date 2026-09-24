import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './role.entity';
import { User } from '../users/user.entity';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  const mockRolesService = {
    getUsersHavingRole: jest.fn(),
    getUserRoleInAssociation: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsersHavingRole', () => {
    it('should return users having the specified role', async () => {
      const users: User[] = [new User()];
      mockRolesService.getUsersHavingRole.mockResolvedValue(users);

      const result = await controller.getUsersHavingRole({ name: 'Admin' });
      expect(result).toEqual(users);
      expect(mockRolesService.getUsersHavingRole).toHaveBeenCalledWith('Admin');
    });
  });

  describe('getUserRoleInAssociation', () => {
    it('should return role of user in association', async () => {
      const role = new Role();
      mockRolesService.getUserRoleInAssociation.mockResolvedValue(role);

      const result = await controller.getUserRoleInAssociation({ idUser: 1, idAssociation: 2 });
      expect(result).toEqual(role);
      expect(mockRolesService.getUserRoleInAssociation).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('create', () => {
    it('should create a role', async () => {
      const role = new Role();
      mockRolesService.create.mockResolvedValue(role);

      const result = await controller.create({ name: 'Admin', idUser: 1, idAssociation: 2 });
      expect(result).toEqual(role);
      expect(mockRolesService.create).toHaveBeenCalledWith('Admin', 1, 2);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const role = new Role();
      mockRolesService.update.mockResolvedValue(role);

      const result = await controller.update({ idUser: 1, idAssociation: 2 }, { name: 'Member' });
      expect(result).toEqual(role);
      expect(mockRolesService.update).toHaveBeenCalledWith(1, 2, 'Member');
    });
  });

  describe('delete', () => {
    it('should delete a role', async () => {
      mockRolesService.delete.mockResolvedValue(true);

      const result = await controller.delete({ idUser: 1, idAssociation: 2 });
      expect(result).toBe(true);
      expect(mockRolesService.delete).toHaveBeenCalledWith(1, 2);
    });
  });
});
