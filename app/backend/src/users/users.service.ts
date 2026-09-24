import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/roles/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>
) {}
  async getAll(): Promise<User[]> {
    return this.repository.find({relations: ["roles"]});
  }

  async getById(id): Promise<User> {
    const user = await this.repository.findOne({where: {id: id}});
    if (!user) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
    return user;
  }
  
  async getRoles(id): Promise<Role[]> {
    const user = await this.repository.findOne({where: {id: id}, relations: ['roles']});
    if (!user) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
    return user.roles;
  }

  async create(lastname: string, firstname: string, age: number, password: string): Promise<User> {
    const user = await this.repository.create({
        lastname: lastname, 
        firstname: firstname, 
        age: age,
        password: password
    });
    await this.repository.save(user);

    return user;
  }

  async update(id, lastname: string, firstname: string, age: number, password: string): Promise<User> {
    const user = await this.getById(id)
    user.lastname = lastname;
    user.firstname = firstname;
    user.age = age;
    user.password = password;

    await this.repository.save(user);
    return user;
  }

  async delete(id): Promise<boolean> {
    const user = await this.getById(id)
    await this.repository.remove(user);
    return true;
  }
}





