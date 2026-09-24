import { Test, TestingModule } from '@nestjs/testing';
import { MinutesController } from './minutes.controller';
import { MinutesService } from './minutes.service';
import { Minute } from './minutes.entity';

describe('MinutesController', () => {
  let controller: MinutesController;
  let service: MinutesService;

  const mockMinutesService = {
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinutesController],
      providers: [
        {
          provide: MinutesService,
          useValue: mockMinutesService,
        },
      ],
    }).compile();

    controller = module.get<MinutesController>(MinutesController);
    service = module.get<MinutesService>(MinutesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getById', () => {
    it('should return a minute by id', async () => {
      const minute = new Minute();
      minute.id = 1;
      mockMinutesService.getById.mockResolvedValue(minute);

      const result = await controller.getById({ id: 1 });
      expect(result).toEqual(minute);
      expect(mockMinutesService.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create and return a minute', async () => {
      const minute = new Minute();
      mockMinutesService.create.mockResolvedValue(minute);

      const input = {
        date: '2026-01-01',
        content: 'Meeting notes',
        idAssociation: 1,
        idVoters: [1, 2],
      };
      const result = await controller.create(input);
      expect(result).toEqual(minute);
      expect(mockMinutesService.create).toHaveBeenCalledWith(
        input.date,
        input.content,
        input.idAssociation,
        input.idVoters,
      );
    });
  });

  describe('update', () => {
    it('should update and return a minute', async () => {
      const minute = new Minute();
      mockMinutesService.update.mockResolvedValue(minute);

      const input = {
        date: '2026-01-02',
        content: 'Updated notes',
        idAssociation: 1,
        idVoters: [1, 2],
      };
      const result = await controller.update({ id: 1 }, input);
      expect(result).toEqual(minute);
      expect(mockMinutesService.update).toHaveBeenCalledWith(
        1,
        input.date,
        input.content,
        input.idAssociation,
        input.idVoters,
      );
    });
  });

  describe('delete', () => {
    it('should delete a minute and return boolean', async () => {
      mockMinutesService.delete.mockResolvedValue(true);

      const result = await controller.delete({ id: 1 });
      expect(result).toBe(true);
      expect(mockMinutesService.delete).toHaveBeenCalledWith(1);
    });
  });
});
