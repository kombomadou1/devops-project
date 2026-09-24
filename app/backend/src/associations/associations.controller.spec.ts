import { Test, TestingModule } from '@nestjs/testing';
import { AssociationsController } from './associations.controller';
import { AssociationsService } from './associations.service';
import { AssociationDTO } from './association.dto';
import { Association } from './association.entity';
import { Member } from './association.member';
import { Minute } from '../minutes/minutes.entity';

describe('AssociationsController', () => {
  let controller: AssociationsController;
  let service: AssociationsService;

  const mockAssociationsService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    getMembersById: jest.fn(),
    getMinutesById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssociationsController],
      providers: [
        {
          provide: AssociationsService,
          useValue: mockAssociationsService,
        },
      ],
    }).compile();

    controller = module.get<AssociationsController>(AssociationsController);
    service = module.get<AssociationsService>(AssociationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all associations', async () => {
      const dtos: AssociationDTO[] = [new AssociationDTO()];
      mockAssociationsService.getAll.mockResolvedValue(dtos);

      const result = await controller.getAll();
      expect(result).toEqual(dtos);
      expect(mockAssociationsService.getAll).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return an association by id', async () => {
      const dto = new AssociationDTO();
      dto.id = 1;
      mockAssociationsService.getById.mockResolvedValue(dto);

      const result = await controller.getById({ id: 1 });
      expect(result).toEqual(dto);
      expect(mockAssociationsService.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('getMembersById', () => {
    it('should return members of association', async () => {
      const members: Member[] = [new Member()];
      mockAssociationsService.getMembersById.mockResolvedValue(members);

      const result = await controller.getMembersById({ id: 1 });
      expect(result).toEqual(members);
      expect(mockAssociationsService.getMembersById).toHaveBeenCalledWith(1);
    });
  });

  describe('getMinutesById', () => {
    it('should return minutes of association', async () => {
      const minutes: Minute[] = [new Minute()];
      mockAssociationsService.getMinutesById.mockResolvedValue(minutes);

      const result = await controller.getMinutesById(1, 'date', 'DESC');
      expect(result).toEqual(minutes);
      expect(mockAssociationsService.getMinutesById).toHaveBeenCalledWith(1, 'date', 'DESC');
    });
  });

  describe('create', () => {
    it('should create an association', async () => {
      const association = new Association();
      association.name = 'New Association';
      mockAssociationsService.create.mockResolvedValue(association);

      const result = await controller.create({ name: 'New Association' });
      expect(result).toEqual(association);
      expect(mockAssociationsService.create).toHaveBeenCalledWith('New Association');
    });
  });

  describe('update', () => {
    it('should update an association', async () => {
      const association = new Association();
      association.id = 1;
      association.name = 'Updated Name';
      mockAssociationsService.update.mockResolvedValue(association);

      const result = await controller.update({ id: 1 }, { name: 'Updated Name' });
      expect(result).toEqual(association);
      expect(mockAssociationsService.update).toHaveBeenCalledWith(1, 'Updated Name');
    });
  });

  describe('delete', () => {
    it('should delete an association and return boolean', async () => {
      mockAssociationsService.delete.mockResolvedValue(true);

      const result = await controller.delete({ id: 1 });
      expect(result).toBe(true);
      expect(mockAssociationsService.delete).toHaveBeenCalledWith(1);
    });
  });
});
