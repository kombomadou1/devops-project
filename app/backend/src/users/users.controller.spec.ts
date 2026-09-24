import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserInput } from './UserInput';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  findOne: jest.fn(entity => entity),
}));

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: repositoryMockFactory}
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

    describe('getAll', () => {
    it('should return an array of users', async () => {
      const user =  new User();
      user.id = 0;
      user.firstname = 'John';
      user.lastname = 'Doe';
      user.age = 23;
      const expected = Promise.all([ user, ]);

      jest.spyOn(service, 'getAll').mockImplementation(() => expected);
      expect(await controller.getAll()).toBe(await expected);
    });
  });

   describe('getById', () => {
    it('should return a single user, with the provided id', async () => {
      const user =  new User();
      user.id = 0;
      user.firstname = 'John';
      user.lastname = 'Doe';
      user.age = 23;
      // const expected = Promise.resolve(user);

      jest.spyOn(service, 'getById').mockImplementation(async (id: number) => {
        return user;
      });
      expect(await controller.getById(0)).toBe(await Promise.resolve(user));
      
    })
  });
});
